import { Schema, model, Document, Types } from 'mongoose';

export type InventoryRestorationStatus = 'pending' | 'completed' | 'unresolved';

export interface IInventoryRestoration extends Document {
  restorationId: string; // Unique primary idempotency key: e.g. "VOID-20261020-0001::prod-001::M::Monolith Black"
  orderId: Types.ObjectId;
  orderNumber: string;
  lineItemId?: string;
  productId: string;
  size: string;
  color: string;
  quantity: number;
  status: InventoryRestorationStatus;
  workerToken?: string;
  lockedUntil?: Date;
  unresolvedReason?: string;
  restoredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const inventoryRestorationSchema = new Schema<IInventoryRestoration>(
  {
    restorationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true
    },
    orderNumber: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    lineItemId: {
      type: String,
      trim: true
    },
    productId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    size: {
      type: String,
      required: true,
      trim: true
    },
    color: {
      type: String,
      required: true,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'unresolved'],
      default: 'pending',
      required: true,
      index: true
    },
    workerToken: {
      type: String,
      trim: true
    },
    lockedUntil: {
      type: Date
    },
    unresolvedReason: {
      type: String,
      trim: true
    },
    restoredAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for querying active/pending restorations per worker/order
inventoryRestorationSchema.index({ status: 1, lockedUntil: 1 });
inventoryRestorationSchema.index({ orderNumber: 1, productId: 1 });

export const InventoryRestoration = model<IInventoryRestoration>(
  'InventoryRestoration',
  inventoryRestorationSchema
);
