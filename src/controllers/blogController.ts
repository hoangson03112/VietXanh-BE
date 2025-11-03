import { Request, Response } from 'express';
import Blog from '../models/Blog';
import { uploadToCloudinary } from '../utils/cloudinaryHelper';

// Lấy blogs cho USER (chỉ isActive = true)
export const getBlogs = async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.find({ isActive: true }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: blogs,
      total: blogs.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy tất cả blogs cho ADMIN (bao gồm cả isActive = false)
export const getAllBlogsAdmin = async (req: Request, res: Response) => {
  try {
    const blogs = await Blog.find({}).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: blogs,
      total: blogs.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy blog theo ID
export const getBlogById = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    
    res.json({ success: true, data: blog });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tạo blog mới
export const createBlog = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }

    let imgUrl = '';
    
    // Upload ảnh lên Cloudinary nếu có
    if (req.file) {
      console.log('📤 Uploading blog thumbnail to Cloudinary...');
      const result = await uploadToCloudinary(req.file.buffer, 'VietXanh/blogs');
      imgUrl = result.secure_url;
      console.log('✅ Thumbnail uploaded:', imgUrl);
    }

    if (!imgUrl) {
      return res.status(400).json({
        success: false,
        message: 'Blog thumbnail is required',
      });
    }

    const blog = await Blog.create({
      title,
      content,
      img: imgUrl,
      isActive: true,
    });

    console.log('✅ Blog created:', blog._id);
    res.status(201).json({ success: true, data: blog });
  } catch (error: any) {
    console.error('❌ Error creating blog:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật blog
export const updateBlog = async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required',
      });
    }

    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    let imgUrl = blog.img;

    // Upload ảnh mới lên Cloudinary nếu có
    if (req.file) {
      console.log('📤 Uploading new blog thumbnail to Cloudinary...');
      const result = await uploadToCloudinary(req.file.buffer, 'VietXanh/blogs');
      imgUrl = result.secure_url;
      console.log('✅ New thumbnail uploaded:', imgUrl);
    }

    blog.title = title;
    blog.content = content;
    blog.img = imgUrl;

    await blog.save();

    console.log('✅ Blog updated:', blog._id);
    res.json({ success: true, data: blog });
  } catch (error: any) {
    console.error('❌ Error updating blog:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa blog
export const deleteBlog = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    
    console.log('✅ Blog deleted:', req.params.id);
    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error: any) {
    console.error('❌ Error deleting blog:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle trạng thái hiển thị blog (isActive)
export const toggleBlogStatus = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    blog.isActive = !blog.isActive;
    await blog.save();

    console.log(`✅ Blog ${blog._id} isActive: ${blog.isActive}`);

    res.json({
      success: true,
      data: blog,
      message: `Blog ${blog.isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error: any) {
    console.error('❌ Error toggling blog status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
