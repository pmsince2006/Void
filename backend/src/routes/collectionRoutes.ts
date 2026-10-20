import { Router } from 'express';
import { getCollections } from '../controllers/productController';

const router = Router();

// Public Read-Only Collection Routes
router.get('/', getCollections);

export default router;
