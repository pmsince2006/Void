import { Schema, model, Types } from 'mongoose';

export interface IWishlistItem {
  productId: string; // Stable string ID (e.g. "prod-001")
  addedAt: Date;
}

export interface IWishlist {
  userId: Types.ObjectId;
  items: IWishlistItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

const wishlistItemSchema = new Schema<IWishlistItem>(
  {
    productId: {
      type: String,
      required: [true, 'Product ID is required'],
      trim: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const wishlistSchema = new Schema<IWishlist>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    items: {
      type: [wishlistItemSchema],
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

export const Wishlist = model<IWishlist>('Wishlist', wishlistSchema);
