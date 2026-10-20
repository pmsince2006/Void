import { Request, Response } from 'express';
import { Wishlist, IWishlistItem } from '../models/Wishlist';
import { Product } from '../models/Product';

/**
 * Populates wishlist items with fresh product details from MongoDB.
 */
export async function formatPopulatedWishlist(wishlistItems: IWishlistItem[]) {
  if (!wishlistItems || wishlistItems.length === 0) {
    return {
      items: [],
      totalCount: 0
    };
  }

  const productIds = Array.from(new Set(wishlistItems.map((item) => item.productId)));
  const products = await Product.find({ id: { $in: productIds } });
  const productMap = new Map<string, any>();
  products.forEach((p) => productMap.set(p.id, p.toJSON()));

  const populatedItems: any[] = [];

  for (const item of wishlistItems) {
    const product = productMap.get(item.productId);
    // If piece was archived or removed, gracefully skip
    if (!product) continue;

    populatedItems.push({
      productId: item.productId,
      addedAt: item.addedAt,
      product
    });
  }

  return {
    items: populatedItems,
    totalCount: populatedItems.length
  };
}

/**
 * GET /api/wishlist
 * Returns the authenticated user's wishlist with populated product details.
 */
export async function getWishlist(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ userId, items: [] });
    }

    const populatedWishlist = await formatPopulatedWishlist(wishlist.items);

    res.status(200).json({
      status: 'ok',
      wishlist: populatedWishlist
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error retrieving watchlist'
    });
  }
}

/**
 * POST /api/wishlist/toggle
 * Adds or removes a product from the user's saved archive watchlist.
 */
export async function toggleItem(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const { productId } = req.body || {};
    if (!productId || typeof productId !== 'string') {
      res.status(400).json({
        status: 'error',
        message: 'Product ID is required to toggle watchlist.'
      });
      return;
    }

    const product = await Product.findOne({ id: productId.trim() });
    if (!product) {
      res.status(404).json({
        status: 'error',
        message: 'Piece not found in the VOID archive.'
      });
      return;
    }

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
    }

    const existingIndex = wishlist.items.findIndex((item) => item.productId === product.id);
    let action: 'added' | 'removed' = 'added';

    if (existingIndex > -1) {
      wishlist.items.splice(existingIndex, 1);
      action = 'removed';
    } else {
      wishlist.items.push({
        productId: product.id,
        addedAt: new Date()
      });
      action = 'added';
    }

    await wishlist.save();
    const populatedWishlist = await formatPopulatedWishlist(wishlist.items);

    res.status(200).json({
      status: 'ok',
      action,
      message:
        action === 'added'
          ? `${product.name} saved to archive watchlist`
          : `${product.name} removed from saved archive`,
      wishlist: populatedWishlist
    });
  } catch (error) {
    console.error('Error toggling wishlist item:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error updating watchlist'
    });
  }
}

/**
 * POST /api/wishlist/merge
 * Merges guest product IDs into the user's account watchlist without duplicates.
 */
export async function mergeWishlist(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ status: 'error', message: 'Authentication required' });
      return;
    }

    const { productIds = [], items = [] } = req.body || {};

    // Support either productIds array or items array
    const rawIds: string[] = Array.isArray(productIds) && productIds.length > 0
      ? productIds
      : Array.isArray(items)
      ? items.map((i: any) => i.productId).filter(Boolean)
      : [];

    const uniqueIncomingIds = Array.from(new Set(rawIds.map((id) => id.trim())));

    let wishlist = await Wishlist.findOne({ userId });
    if (!wishlist) {
      wishlist = new Wishlist({ userId, items: [] });
    }

    if (uniqueIncomingIds.length > 0) {
      // Validate that the products actually exist in the archive
      const validProducts = await Product.find({ id: { $in: uniqueIncomingIds } });
      const validProductIds = new Set(validProducts.map((p) => p.id));

      const existingSet = new Set(wishlist.items.map((item) => item.productId));

      for (const id of uniqueIncomingIds) {
        if (validProductIds.has(id) && !existingSet.has(id)) {
          wishlist.items.push({
            productId: id,
            addedAt: new Date()
          });
          existingSet.add(id);
        }
      }

      await wishlist.save();
    }

    const populatedWishlist = await formatPopulatedWishlist(wishlist.items);

    res.status(200).json({
      status: 'ok',
      message: 'Watchlist merged successfully',
      wishlist: populatedWishlist
    });
  } catch (error) {
    console.error('Error merging wishlist:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error merging watchlist'
    });
  }
}
