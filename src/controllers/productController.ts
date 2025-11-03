import { Request, Response } from "express";
import Product from "../models/Product";
import { uploadMultipleToCloudinary } from "../utils/cloudinaryHelper";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      data: products,
      total: products.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy tất cả products cho ADMIN (bao gồm cả isActive = false)
export const getAllProductsAdmin = async (req: Request, res: Response) => {
  try {
    // Lấy tất cả sản phẩm, không filter isActive
    const products = await Product.find({}).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: products,
      total: products.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy product theo ID
export const getProductById = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Tạo product mới
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price } = req.body;

    if (!name || !price || !description) {
      return res.status(400).json({
        success: false,
        message: "Name, description and price are required",
      });
    }

    let imageUrls: string[] = [];

    // Upload ảnh lên Cloudinary nếu có
    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      console.log(
        "📤 Uploading",
        (req.files as Express.Multer.File[]).length,
        "images to Cloudinary..."
      );
      imageUrls = await uploadMultipleToCloudinary(
        req.files as Express.Multer.File[],
        "VietXanh/products"
      );
    }

    // Validation: Ít nhất 1 ảnh
    if (imageUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product image is required",
      });
    }

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      images: imageUrls,
      isActive: true,
    });

    console.log("✅ Product created:", product._id);
    res.status(201).json({ success: true, data: product });
  } catch (error: any) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cập nhật product
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, existingImages } = req.body;

    if (!name || !price || !description) {
      return res.status(400).json({
        success: false,
        message: "Name, description and price are required",
      });
    }

    let imageUrls: string[] = [];

    // Lấy danh sách ảnh cũ cần giữ lại
    if (existingImages) {
      try {
        imageUrls = JSON.parse(existingImages);
        console.log("🖼️ Keeping existing images:", imageUrls.length);
      } catch (error) {
        console.error("Error parsing existingImages:", error);
      }
    }

    // Upload ảnh mới lên Cloudinary nếu có
    if (req.files && (req.files as Express.Multer.File[]).length > 0) {
      console.log(
        "📤 Uploading",
        (req.files as Express.Multer.File[]).length,
        "new images..."
      );
      const newImageUrls = await uploadMultipleToCloudinary(
        req.files as Express.Multer.File[],
        "VietXanh/products"
      );

      // Kết hợp ảnh cũ + ảnh mới
      imageUrls = [...imageUrls, ...newImageUrls];
    }

    // Validation: Phải có ít nhất 1 ảnh
    if (imageUrls.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Product must have at least one image",
      });
    }

    const updateData: any = {
      name,
      description,
      price: parseFloat(price),
      images: imageUrls,
    };

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    console.log("✅ Product updated:", product._id);
    res.json({ success: true, data: product });
  } catch (error: any) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Xóa product
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle trạng thái hiển thị sản phẩm (isActive)
export const toggleProductStatus = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    product.isActive = !product.isActive;

    if (!product.isActive && product.isFeatured) {
      product.isFeatured = false;
      console.log(
        `⚠️ Product ${product._id} auto-removed from featured (product is now inactive)`
      );
    }

    await product.save();

    console.log(`✅ Product ${product._id} isActive: ${product.isActive}`);

    res.json({
      success: true,
      data: product,
      message: `Product ${
        product.isActive ? "activated" : "deactivated"
      } successfully`,
    });
  } catch (error: any) {
    console.error("❌ Error toggling product status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search products
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res
        .status(400)
        .json({ success: false, message: "Search query is required" });
    }

    const products = await Product.find({
      $text: { $search: q as string },
      isActive: true,
    }).limit(20);

    res.json({ success: true, data: products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFeaturedProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find({
      isActive: true,
      isFeatured: true,
    })
      .sort({ createdAt: -1 })
      .limit(4);

    res.json({
      success: true,
      data: products,
      total: products.length,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle featured status (Admin)
export const toggleFeaturedStatus = async (req: Request, res: Response) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // QUAN TRỌNG: Chỉ cho phép featured sản phẩm đang ACTIVE
    if (!product.isFeatured && !product.isActive) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot feature an inactive product. Please activate the product first.",
      });
    }

    // Nếu đang bật featured, kiểm tra số lượng featured products
    if (!product.isFeatured) {
      const featuredCount = await Product.countDocuments({
        isFeatured: true,
        isActive: true,
      });

      if (featuredCount >= 4) {
        return res.status(400).json({
          success: false,
          message:
            "Maximum 4 featured products allowed. Please remove another featured product first.",
        });
      }
    }

    // Đảo trạng thái
    product.isFeatured = !product.isFeatured;
    await product.save();

    console.log(`✅ Product ${product._id} isFeatured: ${product.isFeatured}`);

    res.json({
      success: true,
      data: product,
      message: `Product ${
        product.isFeatured ? "marked as featured" : "removed from featured"
      } successfully`,
    });
  } catch (error: any) {
    console.error("❌ Error toggling featured status:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
