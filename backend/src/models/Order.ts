import { Schema, model, Document, Types } from 'mongoose';

export type PaymentStatus = 'pending' | 'unpaid' | 'paid' | 'failed';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'dispatched' | 'delivered' | 'cancelled';

export interface IOrderItem {
  productId: string;      // Stable string ID (e.g. "prod-001")
  name: string;           // Snapshot of product name
  slug?: string;          // Snapshot of product slug
  image?: string;         // Snapshot of primary product image
  sku?: string;           // Snapshot of product SKU
  size: string;           // Selected size (e.g. "M")
  color: string;          // Selected color name (e.g. "Monolith Black")
  quantity: number;       // Integer >= 1
  unitPrice: number;      // Price in INR at purchase time
  lineTotal: number;      // unitPrice * quantity
}

export interface IOrderCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface IOrderShippingAddress {
  fullName?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  userId: Types.ObjectId;
  customer: IOrderCustomer;
  shippingAddress: IOrderShippingAddress;
  items: IOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  idempotencyKey?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: String,
      required: [true, 'Product ID is required'],
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Product name snapshot is required'],
      trim: true
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true
    },
    image: {
      type: String,
      trim: true
    },
    sku: {
      type: String,
      trim: true
    },
    size: {
      type: String,
      required: [true, 'Size is required'],
      trim: true
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price must be positive']
    },
    lineTotal: {
      type: Number,
      required: true,
      min: [0, 'Line total must be positive']
    }
  },
  { _id: false }
);

const orderCustomerSchema = new Schema<IOrderCustomer>(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, 'Customer phone is required'],
      trim: true
    }
  },
  { _id: false }
);

const orderShippingAddressSchema = new Schema<IOrderShippingAddress>(
  {
    fullName: {
      type: String,
      trim: true
    },
    addressLine1: {
      type: String,
      required: [true, 'Address line 1 is required'],
      trim: true
    },
    addressLine2: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    pinCode: {
      type: String,
      required: [true, 'PIN code is required'],
      trim: true
    }
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      unique: true,
      index: true,
      trim: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    customer: {
      type: orderCustomerSchema,
      required: true
    },
    shippingAddress: {
      type: orderShippingAddressSchema,
      required: true
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (v: IOrderItem[]) => Array.isArray(v) && v.length > 0,
        message: 'Order must contain at least one line item'
      }
    },
    subtotal: {
      type: Number,
      required: true,
      min: [0, 'Subtotal cannot be negative']
    },
    shipping: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Shipping charge cannot be negative']
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative']
    },
    currency: {
      type: String,
      required: true,
      default: 'INR',
      trim: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'unpaid', 'paid', 'failed'],
      default: 'pending',
      index: true
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'],
      default: 'pending',
      index: true
    },
    idempotencyKey: {
      type: String,
      trim: true,
      index: true
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Idempotency compound index scoped per user: enforces uniqueness strictly when idempotencyKey is provided
orderSchema.index(
  { userId: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: { idempotencyKey: { $type: 'string' } }
  }
);

// Compound index for querying a user's orders sorted by date
orderSchema.index({ userId: 1, createdAt: -1 });

export const Order = model<IOrder>('Order', orderSchema);
