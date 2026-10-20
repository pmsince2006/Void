import { Schema, model, Document } from 'mongoose';

export type ProductCategory = 'uppers' | 'bottoms' | 'shoes' | 'accessories';
export type ProductBadgeType = 'DROP 01' | 'ARCHIVE' | 'LIMITED' | 'NEW ARRIVAL' | 'SOLDOUT';

export interface IProductColor {
  name: string;
  hex: string;
}

export interface IProduct {
  id: string; // Stable string ID (e.g. "prod-001")
  name: string;
  subtitle?: string;
  sku: string;
  slug: string;
  category: ProductCategory;
  collection: string;
  drop: string;
  wave: string;
  price: number;
  currency: string;
  originalPrice?: number;
  description: string;
  editorialDescription?: string;
  details: string[];
  materials: string[];
  fit: string;
  sizes: string[];
  colors: IProductColor[];
  images: string[];
  badge?: ProductBadgeType;
  inStock: boolean;
  stockCount?: number;
  isFeatured: boolean;
  isNewDrop: boolean;
  releaseStatus: 'unlocked' | 'incoming' | 'archived';
  releaseDate?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const productColorSchema = new Schema<IProductColor>(
  {
    name: { type: String, required: true, trim: true },
    hex: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    id: {
      type: String,
      required: [true, 'Product ID is required'],
      unique: true,
      index: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    subtitle: {
      type: String,
      trim: true
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      index: true,
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      index: true,
      trim: true,
      lowercase: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ['uppers', 'bottoms', 'shoes', 'accessories'],
        message: '{VALUE} is not a valid VOID product category'
      },
      lowercase: true,
      index: true
    },
    collection: {
      type: String,
      required: [true, 'Collection is required'],
      trim: true,
      index: true
    },
    drop: {
      type: String,
      required: [true, 'Drop code is required'],
      trim: true
    },
    wave: {
      type: String,
      required: [true, 'Wave identifier is required'],
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive']
    },
    currency: {
      type: String,
      required: true,
      default: 'INR',
      trim: true
    },
    originalPrice: {
      type: Number,
      min: [0, 'Original price must be positive']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    editorialDescription: {
      type: String,
      trim: true
    },
    details: {
      type: [String],
      default: []
    },
    materials: {
      type: [String],
      default: []
    },
    fit: {
      type: String,
      required: [true, 'Fit specification is required'],
      trim: true
    },
    sizes: {
      type: [String],
      default: []
    },
    colors: {
      type: [productColorSchema],
      default: []
    },
    images: {
      type: [String],
      default: []
    },
    badge: {
      type: String,
      enum: ['DROP 01', 'ARCHIVE', 'LIMITED', 'NEW ARRIVAL', 'SOLDOUT']
    },
    inStock: {
      type: Boolean,
      default: true
    },
    stockCount: {
      type: Number,
      default: 0
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isNewDrop: {
      type: Boolean,
      default: false
    },
    releaseStatus: {
      type: String,
      enum: ['unlocked', 'incoming', 'archived'],
      default: 'unlocked'
    },
    releaseDate: {
      type: String
    }
  },
  {
    suppressReservedKeysWarning: true,
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

// Search text index for name, sku, collection, description
productSchema.index({
  name: 'text',
  sku: 'text',
  collection: 'text',
  description: 'text'
});

export const Product = model<IProduct>('Product', productSchema);
