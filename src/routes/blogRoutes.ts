import express from 'express';
import {
  getBlogs,
  getAllBlogsAdmin,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  toggleBlogStatus,
} from '../controllers/blogController';
import { upload } from '../middleware/upload';

const router = express.Router();

// User routes (public - chỉ lấy isActive = true)
router.get('/', getBlogs);
router.get('/:id', getBlogById);

// Admin routes (protected - lấy tất cả)
router.get('/admin/all', getAllBlogsAdmin);
router.post('/', upload.single('img'), createBlog);
router.put('/:id', upload.single('img'), updateBlog);
router.put('/:id/toggle-status', toggleBlogStatus);
router.delete('/:id', deleteBlog);

export default router;
