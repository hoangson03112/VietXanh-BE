import express from 'express';
import {
  getProducts,
  getAllProductsAdmin,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  toggleProductStatus,
  getFeaturedProducts,
  toggleFeaturedStatus,
} from '../controllers/productController';
import { upload } from '../middleware/upload';

const router = express.Router();

// User routes (public - chỉ lấy isActive = true)
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);

// Admin routes (protected - lấy tất cả)
router.get('/admin/all', getAllProductsAdmin);
router.post('/', upload.array('images', 5), createProduct);
router.put('/:id', upload.array('images', 5), updateProduct);
router.put('/:id/toggle-status', toggleProductStatus);
router.put('/:id/toggle-featured', toggleFeaturedStatus);
router.delete('/:id', deleteProduct);

export default router;
