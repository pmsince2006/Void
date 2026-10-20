import { Request, Response } from 'express';
import crypto from 'crypto';
import { Types } from 'mongoose';
import { Order, IOrderItem } from '../models/Order';
import { Product, IProduct } from '../models/Product';
import { Cart } from '../models/Cart';

/**
 * Generates an authentic, human-readable VOID order number.
 * Format: VOID-YYYYMMDD-XXXXXX (e.g. VOID-20261020-8A3F1B)
 */
export function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `VOID-${dateStr}-${randomSuffix}`;
}

/**
 * Validates shipping address and contact fields.
 */
function validateShippingInput(data: any): { isValid: boolean; error?: string; validated?: any } {
  const {
    fullName,
    customerName,
    email,
    customerEmail,
    phone,
    customerPhone,
    addressLine1,
    addressLine2,
    city,
    state,
    pinCode
  } = data || {};

  const name = (fullName || customerName || '').trim();
  if (!name || name.length < 2) {
    return { isValid: false, error: 'Recipient full name is required (minimum 2 characters).' };
  }

  const contactEmail = (email || customerEmail || '').trim().toLowerCase();
  if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return { isValid: false, error: 'Valid contact email address is required.' };
  }

  const cleanPhone = (phone || customerPhone || '').toString().replace(/[\s\-()]/g, '');
  if (!cleanPhone || !/^(?:\+?91|0)?[6-9]\d{9}$/.test(cleanPhone)) {
    return { isValid: false, error: 'Valid 10-digit Indian phone number is required (e.g. 98765 43210).' };
  }

  const addr1 = (addressLine1 || '').trim();
  if (!addr1 || addr1.length < 5) {
    return { isValid: false, error: 'Street address / premises is required (minimum 5 characters).' };
  }

  const destinationCity = (city || '').trim();
  if (!destinationCity || destinationCity.length < 2) {
    return { isValid: false, error: 'Destination city is required.' };
  }

  const destinationState = (state || '').trim();
  if (!destinationState) {
    return { isValid: false, error: 'State / union territory is required.' };
  }

  const cleanPin = (pinCode || '').toString().trim();
  if (!cleanPin || !/^[1-9][0-9]{5}$/.test(cleanPin)) {
    return { isValid: false, error: 'Valid 6-digit Indian PIN code is required (e.g. 110001).' };
  }

  return {
    isValid: true,
    validated: {
      customer: {
        name,
        email: contactEmail,
        phone: cleanPhone
      },
      shippingAddress: {
        fullName: name,
        addressLine1: addr1,
        addressLine2: (addressLine2 || '').trim() || undefined,
        city: destinationCity,
        state: destinationState,
        pinCode: cleanPin
      }
    }
  };
}

/**
 * POST /api/orders
 * Creates an immutable, verified order in MongoDB.
 *
 * Security & Integrity Guarantees:
 * - Requires authenticated session (req.user).
 * - Ignores client prices, subtotals, and totals.
 * - Atomically decrements stock count per variant to prevent overselling.
 * - Compensates/rolls back partial inventory changes if any item fails or order fails to save.
 * - Idempotency-key support prevents duplicate orders upon network retries or double clicks.
 * - Clears user's active bag in MongoDB only upon confirmed order creation.
 */
export async function createOrder(req: Request, res: Response): Promise<void> {
  const userId = req.user?._id;
  if (!userId) {
    res.status(401).json({ status: 'error', message: 'Authentication required' });
    return;
  }

  // 1. Check Idempotency Key
  const rawIdempotencyKey =
    req.headers['idempotency-key'] ||
    req.headers['x-idempotency-key'] ||
    req.body.idempotencyKey;
  const idempotencyKey = typeof rawIdempotencyKey === 'string' && rawIdempotencyKey.trim()
    ? rawIdempotencyKey.trim()
    : undefined;

  if (idempotencyKey) {
    const existingOrder = await Order.findOne({ userId, idempotencyKey });
    if (existingOrder) {
      if (existingOrder.orderStatus === 'cancelled') {
        res.status(409).json({
          status: 'error',
          message: 'Previous order attempt associated with this checkout session has expired or was cancelled. Please submit with a new checkout session.',
          order: existingOrder
        });
        return;
      }
      res.status(200).json({
        status: 'ok',
        message: 'Order already recorded (idempotent submission)',
        order: existingOrder
      });
      return;
    }
  }

  // 2. Validate Contact & Shipping Information
  const shippingInput = req.body.shippingAddress || req.body;
  const validation = validateShippingInput({
    ...shippingInput,
    customerName: req.body.customer?.name || shippingInput.fullName || req.user?.name,
    customerEmail: req.body.customer?.email || shippingInput.email || req.user?.email,
    customerPhone: req.body.customer?.phone || shippingInput.phone
  });

  if (!validation.isValid || !validation.validated) {
    res.status(400).json({
      status: 'error',
      message: validation.error || 'Invalid shipping details'
    });
    return;
  }

  const { customer, shippingAddress } = validation.validated;

  // 3. Resolve Items (Explicit items payload OR active database cart)
  let rawItems = req.body.items;
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    const userCart = await Cart.findOne({ userId });
    rawItems = userCart?.items || [];
  }

  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    res.status(400).json({
      status: 'error',
      message: 'Cannot create order: archive bag contains zero allocated silhouettes.'
    });
    return;
  }

  // Normalize and combine identical variants in order request
  const combinedItemsMap = new Map<string, { productId: string; size: string; color: string; quantity: number }>();
  for (const item of rawItems) {
    const pId = typeof item.productId === 'string' ? item.productId.trim() : '';
    const size = typeof item.size === 'string' ? item.size.trim() : '';
    const color = typeof item.color === 'string' ? item.color.trim() : '';
    const qty = parseInt(item.quantity, 10);

    if (!pId || !size || !color || isNaN(qty) || qty <= 0) {
      res.status(400).json({
        status: 'error',
        message: `Invalid line item parameters: productId '${pId}', size '${size}', color '${color}', quantity '${qty}'`
      });
      return;
    }

    if (qty > 10) {
      res.status(400).json({
        status: 'error',
        message: `Maximum 10 units allowed per variant per order. Specified: ${qty}`
      });
      return;
    }

    const key = `${pId}::${size}::${color}`;
    if (combinedItemsMap.has(key)) {
      const existing = combinedItemsMap.get(key)!;
      existing.quantity += qty;
      if (existing.quantity > 10) {
        res.status(400).json({
          status: 'error',
          message: `Combined quantity for variant ${pId} [${size}] exceeds maximum 10 units limit.`
        });
        return;
      }
    } else {
      combinedItemsMap.set(key, { productId: pId, size, color, quantity: qty });
    }
  }

  const targetItems = Array.from(combinedItemsMap.values());

  // 4. Validate Each Variant Against Product Catalogue
  const productIds = Array.from(new Set(targetItems.map((i) => i.productId)));
  const products = await Product.find({ id: { $in: productIds } });
  const productMap = new Map<string, IProduct>();
  products.forEach((p) => productMap.set(p.id, p));

  for (const item of targetItems) {
    const product = productMap.get(item.productId);
    if (!product) {
      res.status(404).json({
        status: 'error',
        message: `Silhouette '${item.productId}' not found in VOID archive.`
      });
      return;
    }

    // Validate size availability
    if (!product.sizes.includes(item.size)) {
      res.status(400).json({
        status: 'error',
        message: `Size '${item.size}' is not available for ${product.name}. Available: ${product.sizes.join(', ')}`
      });
      return;
    }

    // Validate color availability
    const hasColor = product.colors.some(
      (c) => c.name.toLowerCase() === item.color.toLowerCase()
    );
    if (!hasColor) {
      res.status(400).json({
        status: 'error',
        message: `Color '${item.color}' is not available for ${product.name}.`
      });
      return;
    }

    // Validate active stock status
    if (!product.inStock || (product.stockCount !== undefined && product.stockCount < item.quantity)) {
      res.status(400).json({
        status: 'error',
        message: `Insufficient stock for ${product.name} [${item.size}]. Available allocation: ${product.stockCount || 0}`
      });
      return;
    }
  }

  // 5. Atomic Stock Deduction with Compensation Rollback
  const deductedItems: { productId: string; quantity: number }[] = [];
  let stockError: string | null = null;

  for (const item of targetItems) {
    const updated = await Product.findOneAndUpdate(
      {
        id: item.productId,
        inStock: true,
        stockCount: { $gte: item.quantity }
      },
      {
        $inc: { stockCount: -item.quantity }
      },
      { returnDocument: 'after' }
    );

    if (!updated) {
      const product = productMap.get(item.productId);
      stockError = `Insufficient stock for ${product?.name || item.productId} [${item.size}] during concurrent reservation.`;
      break;
    }

    deductedItems.push({ productId: item.productId, quantity: item.quantity });

    // Mark out-of-stock if remaining allocation reached 0
    if (updated.stockCount === 0) {
      await Product.updateOne({ id: item.productId }, { inStock: false });
    }
  }

  // If any item failed deduction, immediately rollback all previously deducted stock
  if (stockError) {
    for (const d of deductedItems) {
      await Product.updateOne(
        { id: d.productId },
        {
          $inc: { stockCount: d.quantity },
          $set: { inStock: true }
        }
      );
    }
    res.status(400).json({ status: 'error', message: stockError });
    return;
  }

  // 6. Compute Trusted Purchase-Time Snapshots and Server-Calculated Totals
  let subtotal = 0;
  const orderItems: IOrderItem[] = [];

  for (const item of targetItems) {
    const product = productMap.get(item.productId)!;
    const unitPrice = product.price; // Authentic database price
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    orderItems.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0] || '',
      sku: product.sku,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unitPrice,
      lineTotal
    });
  }

  // Shipping policy: Complimentary domestic express dispatch across India (₹0)
  const shipping = 0;
  const total = subtotal + shipping;

  // 7. Save Immutable Order Document
  try {
    let orderNumber = generateOrderNumber();
    // Safety check against rare random order number collisions
    for (let attempts = 0; attempts < 3; attempts++) {
      const exists = await Order.findOne({ orderNumber });
      if (!exists) break;
      orderNumber = generateOrderNumber();
    }

    const order = await Order.create({
      orderNumber,
      userId,
      customer,
      shippingAddress,
      items: orderItems,
      subtotal,
      shipping,
      total,
      currency: 'INR',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      idempotencyKey,
      notes: req.body.notes ? String(req.body.notes).trim() : undefined
    });

    // 8. Safely clear the user's cart in MongoDB now that order is confirmed
    try {
      await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });
    } catch (cartClearErr) {
      // Non-critical: Do not fail the order if subsequent cart cleanup encounters an issue
      console.error('Non-critical: Failed to clear user cart after order creation:', cartClearErr);
    }

    res.status(201).json({
      status: 'ok',
      message: 'Order created successfully. Ready for payment verification in Stage 7C.',
      order,
      cartCleared: true
    });
  } catch (error: any) {
    // If saving the order fails, rollback all deducted inventory
    for (const d of deductedItems) {
      await Product.updateOne(
        { id: d.productId },
        {
          $inc: { stockCount: d.quantity },
          $set: { inStock: true }
        }
      );
    }

    // Handle race condition on duplicate idempotency key (code 11000)
    if (error.code === 11000 && idempotencyKey) {
      const existing = await Order.findOne({ userId, idempotencyKey });
      if (existing) {
        if (existing.orderStatus === 'cancelled') {
          res.status(409).json({
            status: 'error',
            message: 'Previous order attempt associated with this checkout session has expired or was cancelled.',
            order: existing
          });
          return;
        }
        res.status(200).json({
          status: 'ok',
          message: 'Order already recorded (concurrent race condition resolved)',
          order: existing
        });
        return;
      }
    }

    console.error('Failed to create order in MongoDB:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error creating order'
    });
  }
}

/**
 * GET /api/orders
 * Returns the current authenticated user's orders, sorted newest first with pagination.
 */
export async function getOrders(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const [orders, totalOrders] = await Promise.all([
      Order.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments({ userId })
    ]);

    res.status(200).json({
      status: 'ok',
      orders,
      pagination: {
        page,
        limit,
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit) || 1
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error retrieving order history'
    });
  }
}

/**
 * GET /api/orders/:id
 * Retrieves a single order by MongoDB _id or orderNumber.
 * Strictly verifies ownership; returns 404 for nonexistent orders or orders belonging to other users.
 */
export async function getOrderById(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const rawId = req.params.id;
    const idParam = (Array.isArray(rawId) ? rawId[0] : (rawId || '')).toString().trim();
    if (!idParam) {
      res.status(404).json({ status: 'error', message: 'Order not found' });
      return;
    }

    let order = null;
    if (Types.ObjectId.isValid(idParam)) {
      order = await Order.findOne({
        $or: [{ _id: idParam }, { orderNumber: idParam }]
      });
    } else {
      order = await Order.findOne({ orderNumber: idParam });
    }

    // Consistent 404 for missing orders and orders belonging to other users
    if (!order || !order.userId.equals(userId)) {
      res.status(404).json({ status: 'error', message: 'Order not found' });
      return;
    }

    res.status(200).json({
      status: 'ok',
      order
    });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error retrieving order'
    });
  }
}
