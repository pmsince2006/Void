import { Request, Response } from 'express';
import { Cart, ICartItem } from '../models/Cart';
import { Product } from '../models/Product';

/**
 * Populates cart items with fresh product details from MongoDB.
 * Computes official subtotal using trusted database prices (never client-submitted prices).
 */
export async function formatPopulatedCart(cartItems: ICartItem[]) {
  if (!cartItems || cartItems.length === 0) {
    return {
      items: [],
      totalCount: 0,
      subtotal: 0
    };
  }

  // Fetch referenced products in a single database query
  const productIds = Array.from(new Set(cartItems.map((item) => item.productId)));
  const products = await Product.find({ id: { $in: productIds } });
  const productMap = new Map<string, any>();
  products.forEach((p) => productMap.set(p.id, p.toJSON()));

  const populatedItems: any[] = [];
  let totalCount = 0;
  let subtotal = 0;

  for (const item of cartItems) {
    const product = productMap.get(item.productId);
    // If a product was removed or archived, safely skip it without crashing
    if (!product) continue;

    const variantId = `${item.productId}-${item.size}-${item.color}`;
    // Clamp quantity to current stock count or max 10
    const maxAllowed = product.stockCount !== undefined && product.stockCount > 0 ? Math.min(10, product.stockCount) : 10;
    const qty = Math.min(item.quantity, maxAllowed);
    const itemSubtotal = product.price * qty;

    totalCount += qty;
    subtotal += itemSubtotal;

    populatedItems.push({
      id: variantId,
      productId: item.productId,
      size: item.size,
      color: item.color,
      quantity: qty,
      addedAt: item.addedAt,
      product
    });
  }

  return {
    items: populatedItems,
    totalCount,
    subtotal
  };
}

/**
 * GET /api/cart
 * Returns the authenticated user's cart populated with live database prices and details.
 */
export async function getCart(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }

    const populatedCart = await formatPopulatedCart(cart.items);

    res.status(200).json({
      status: 'ok',
      cart: populatedCart
    });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error retrieving bag'
    });
  }
}

/**
 * POST /api/cart/items
 * Adds a product variant or increments its quantity in the user's cart.
 */
export async function addItem(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const { productId, size, color, quantity = 1 } = req.body || {};

    if (!productId || typeof productId !== 'string' || !size || typeof size !== 'string' || !color || typeof color !== 'string') {
      res.status(400).json({
        status: 'error',
        message: 'Product ID, size, and color are required to identify the silhouette variant.'
      });
      return;
    }

    const parsedQty = Number(quantity);
    if (isNaN(parsedQty) || parsedQty < 1) {
      res.status(400).json({
        status: 'error',
        message: 'Quantity must be at least 1.'
      });
      return;
    }

    // 1. Validate against live Product catalogue
    const product = await Product.findOne({ id: productId.trim() });
    if (!product) {
      res.status(404).json({
        status: 'error',
        message: 'Piece not found in the VOID archive.'
      });
      return;
    }

    if (!product.inStock) {
      res.status(400).json({
        status: 'error',
        message: 'This piece is currently unavailable.'
      });
      return;
    }

    // Validate size exists for this piece
    if (product.sizes.length > 0 && !product.sizes.includes(size.trim())) {
      res.status(400).json({
        status: 'error',
        message: `Invalid size "${size}" for ${product.name}. Available: ${product.sizes.join(', ')}`
      });
      return;
    }

    // Validate color exists for this piece
    const validColors = product.colors.map((c) => c.name.toLowerCase());
    if (product.colors.length > 0 && !validColors.includes(color.trim().toLowerCase())) {
      res.status(400).json({
        status: 'error',
        message: `Invalid color "${color}" for ${product.name}.`
      });
      return;
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const maxStock = product.stockCount !== undefined && product.stockCount > 0 ? Math.min(10, product.stockCount) : 10;

    // Check if variant already exists in cart
    const existingIndex = cart.items.findIndex(
      (item) => item.productId === product.id && item.size === size.trim() && item.color.toLowerCase() === color.trim().toLowerCase()
    );

    if (existingIndex > -1) {
      const newQty = Math.min(maxStock, cart.items[existingIndex].quantity + parsedQty);
      cart.items[existingIndex].quantity = newQty;
    } else {
      cart.items.push({
        productId: product.id,
        size: size.trim(),
        color: color.trim(),
        quantity: Math.min(maxStock, parsedQty),
        addedAt: new Date()
      });
    }

    await cart.save();
    const populatedCart = await formatPopulatedCart(cart.items);

    res.status(200).json({
      status: 'ok',
      message: `${product.name} [${size}] added to bag`,
      cart: populatedCart
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error updating bag'
    });
  }
}

/**
 * PUT /api/cart/items
 * Updates a variant's quantity in the user's cart.
 */
export async function updateItem(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    let { id, productId, size, color, quantity } = req.body || {};

    // Support either composite variant ID (e.g. "prod-001-M-Black") or individual fields
    if (id && typeof id === 'string' && (!productId || !size || !color)) {
      const parts = id.split('-');
      if (parts.length >= 3) {
        productId = `${parts[0]}-${parts[1]}`;
        size = parts[2];
        color = parts.slice(3).join('-') || color;
      }
    }

    const parsedQty = Number(quantity);
    if (isNaN(parsedQty)) {
      res.status(400).json({
        status: 'error',
        message: 'Valid quantity number is required.'
      });
      return;
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      res.status(404).json({ status: 'error', message: 'Cart not found' });
      return;
    }

    // Identify variant to update
    const targetIndex = cart.items.findIndex((item) => {
      const itemVariantId = `${item.productId}-${item.size}-${item.color}`;
      if (id && itemVariantId === id) return true;
      return (
        item.productId === productId &&
        item.size === size &&
        item.color.toLowerCase() === (color || '').toLowerCase()
      );
    });

    if (targetIndex === -1) {
      res.status(404).json({
        status: 'error',
        message: 'Piece variant not found in bag.'
      });
      return;
    }

    if (parsedQty <= 0) {
      // Remove variant if quantity is 0 or negative
      cart.items.splice(targetIndex, 1);
    } else {
      // Check stock limit
      const product = await Product.findOne({ id: cart.items[targetIndex].productId });
      const maxStock = product?.stockCount ? Math.min(10, product.stockCount) : 10;
      cart.items[targetIndex].quantity = Math.min(maxStock, parsedQty);
    }

    await cart.save();
    const populatedCart = await formatPopulatedCart(cart.items);

    res.status(200).json({
      status: 'ok',
      cart: populatedCart
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error updating bag item'
    });
  }
}

/**
 * DELETE /api/cart/items/:id
 * Removes a specific variant by composite variant ID `${productId}-${size}-${color}`.
 */
export async function removeItem(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const variantId = req.params.id;
    if (!variantId) {
      res.status(400).json({ status: 'error', message: 'Variant ID is required' });
      return;
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      res.status(200).json({
        status: 'ok',
        cart: { items: [], totalCount: 0, subtotal: 0 }
      });
      return;
    }

    cart.items = cart.items.filter((item) => {
      const currentVariantId = `${item.productId}-${item.size}-${item.color}`;
      return currentVariantId !== variantId;
    });

    await cart.save();
    const populatedCart = await formatPopulatedCart(cart.items);

    res.status(200).json({
      status: 'ok',
      message: 'Piece removed from bag',
      cart: populatedCart
    });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error removing bag item'
    });
  }
}

/**
 * DELETE /api/cart
 * Clears the authenticated user's cart.
 */
export async function clearCart(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { upsert: true }
    );

    res.status(200).json({
      status: 'ok',
      message: 'Bag cleared successfully',
      cart: {
        items: [],
        totalCount: 0,
        subtotal: 0
      }
    });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error clearing bag'
    });
  }
}

/**
 * POST /api/cart/merge
 * Merges guest cart items into the authenticated user's cart without duplicates.
 */
export async function mergeCart(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const { items = [] } = req.body || {};
    if (!Array.isArray(items)) {
      res.status(400).json({
        status: 'error',
        message: 'Items must be an array of variants.'
      });
      return;
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    if (items.length > 0) {
      // Find all referenced products
      const incomingProductIds = items.map((i: any) => i.productId).filter(Boolean);
      const products = await Product.find({ id: { $in: incomingProductIds } });
      const productMap = new Map<string, any>();
      products.forEach((p) => productMap.set(p.id, p));

      for (const incoming of items) {
        if (!incoming.productId || !incoming.size || !incoming.color) continue;
        const product = productMap.get(incoming.productId);
        if (!product || !product.inStock) continue;

        const qty = Math.max(1, Math.min(10, Number(incoming.quantity) || 1));
        const maxStock = product.stockCount !== undefined && product.stockCount > 0 ? Math.min(10, product.stockCount) : 10;

        const existingIndex = cart.items.findIndex(
          (item) =>
            item.productId === incoming.productId &&
            item.size === incoming.size &&
            item.color.toLowerCase() === incoming.color.toLowerCase()
        );

        if (existingIndex > -1) {
          // Combine quantities safely without duplicate line items
          cart.items[existingIndex].quantity = Math.min(maxStock, cart.items[existingIndex].quantity + qty);
        } else {
          cart.items.push({
            productId: product.id,
            size: incoming.size,
            color: incoming.color,
            quantity: Math.min(maxStock, qty),
            addedAt: new Date()
          });
        }
      }

      await cart.save();
    }

    const populatedCart = await formatPopulatedCart(cart.items);

    res.status(200).json({
      status: 'ok',
      message: 'Guest items merged successfully into account bag',
      cart: populatedCart
    });
  } catch (error) {
    console.error('Error merging cart:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error merging bag'
    });
  }
}
