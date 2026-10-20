import { Schema, model, Types } from 'mongoose';

export interface ICartItem {
  productId: string; // Stable string ID (e.g. "prod-001")
  size: string;      // e.g. "M"
  color: string;     // e.g. "Monolith Black"
  quantity: number;  // min 1, max 10
  addedAt: Date;
}

export interface ICart {
  userId: Types.ObjectId;
  items: ICartItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    productId: {
      type: String,
      required: [true, 'Product ID is required'],
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
      min: [1, 'Quantity must be at least 1'],
      max: [10, 'Maximum 10 items per variant per bag'],
      default: 1
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const cartSchema = new Schema<ICart>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    items: {
      type: [cartItemSchema],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export const Cart = model<ICart>('Cart', cartSchema);
