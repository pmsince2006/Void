import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { CollectionModel } from '../models/Collection';

/**
 * GET /api/products
 * Public read-only endpoint with filtering, search, and sorting.
 */
export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const { category, collection, search, drop, minPrice, maxPrice, sort } = req.query;

    const query: Record<string, any> = {};

    // 1. Category Filter (normalized to 4 canonical categories)
    if (category && typeof category === 'string') {
      const catLower = category.toLowerCase().trim();
      let canonical = catLower;
      if (['outerwear', 'tailoring', 'knitwear', 'tops', 'uppers'].includes(catLower)) canonical = 'uppers';
      else if (['bottoms', 'pants', 'trousers'].includes(catLower)) canonical = 'bottoms';
      else if (['shoes', 'footwear', 'sneakers'].includes(catLower)) canonical = 'shoes';
      else if (['accessories', 'hardware', 'bags', 'caps'].includes(catLower)) canonical = 'accessories';

      query.category = canonical;
    }

    // 2. Collection Filter (matches substring case-insensitively)
    if (collection && typeof collection === 'string') {
      query.collection = { $regex: collection.trim(), $options: 'i' };
    }

    // 3. Drop Campaign Filter
    if (drop && typeof drop === 'string') {
      query.drop = { $regex: drop.trim(), $options: 'i' };
    }

    // 4. Price Bounds
    const priceFilter: Record<string, number> = {};
    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      priceFilter.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      priceFilter.$lte = Number(maxPrice);
    }
    if (Object.keys(priceFilter).length > 0) {
      query.price = priceFilter;
    }

    // 5. Keyword Search across Name, SKU, Collection, Description
    if (search && typeof search === 'string' && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      query.$or = [
        { name: searchRegex },
        { sku: searchRegex },
        { collection: searchRegex },
        { description: searchRegex }
      ];
    }

    // 6. Sorting Options
    let sortOption: Record<string, 1 | -1> = { isFeatured: -1, createdAt: -1 };
    if (sort === 'price-asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOption = { price: -1 };
    } else if (sort === 'newest') {
      sortOption = { isNewDrop: -1, createdAt: -1 };
    } else if (sort === 'featured') {
      sortOption = { isFeatured: -1, createdAt: -1 };
    }

    const products = await Product.find(query).sort(sortOption);

    res.status(200).json({
      status: 'ok',
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error fetching archive catalogue'
    });
  }
}

/**
 * GET /api/products/:slug
 * Retrieves a single piece by slug. Returns 404 if not found.
 */
export async function getProductBySlug(req: Request, res: Response): Promise<void> {
  try {
    const rawSlug = req.params.slug;
    const slug = (Array.isArray(rawSlug) ? rawSlug[0] : rawSlug)?.toLowerCase().trim();

    if (!slug) {
      res.status(400).json({
        status: 'error',
        message: 'Product slug is required'
      });
      return;
    }

    const product = await Product.findOne({ slug });

    if (!product) {
      res.status(404).json({
        status: 'error',
        message: 'Piece not found in the VOID archive'
      });
      return;
    }

    res.status(200).json({
      status: 'ok',
      product
    });
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error retrieving piece'
    });
  }
}

/**
 * GET /api/collections
 * Public read-only endpoint listing all curated atmospheres.
 */
export async function getCollections(_req: Request, res: Response): Promise<void> {
  try {
    const collections = await CollectionModel.find().sort({ id: 1 });

    res.status(200).json({
      status: 'ok',
      count: collections.length,
      collections
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error retrieving collections'
    });
  }
}
