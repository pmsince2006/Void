import { Schema, model, Document } from 'mongoose';

export interface ICollection {
  id: string; // Stable string ID (e.g. "col-01")
  title: string;
  code: string;
  description: string;
  season: string;
  itemCount: number;
  heroImage: string;
  thumbnail: string;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const collectionSchema = new Schema<ICollection>(
  {
    id: {
      type: String,
      required: [true, 'Collection ID is required'],
      unique: true,
      index: true,
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Collection code is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    season: {
      type: String,
      required: [true, 'Season is required'],
      trim: true
    },
    itemCount: {
      type: Number,
      default: 0
    },
    heroImage: {
      type: String,
      required: [true, 'Hero image URL is required'],
      trim: true
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail URL is required'],
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      index: true,
      trim: true,
      lowercase: true
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

export const CollectionModel = model<ICollection>('Collection', collectionSchema);
