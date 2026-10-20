import { Router } from 'express';
import { getProducts, getProductBySlug } from '../controllers/productController';

const router = Router();

// Public Read-Only Catalogue Routes
router.get('/', getProducts);
router.get('/:slug', getProductBySlug);

export default router;
