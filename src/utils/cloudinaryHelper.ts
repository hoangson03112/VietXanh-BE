import { UploadApiResponse } from 'cloudinary';
import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

/**
 * Upload file buffer to Cloudinary
 * @param buffer - File buffer from multer
 * @param folder - Cloudinary folder name (e.g., 'products', 'blogs')
 * @returns Cloudinary upload result with secure_url
 */
export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string = 'vietxanh'
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' }, // Giới hạn kích thước
          { quality: 'auto' }, // Tự động optimize chất lượng
          { fetch_format: 'auto' }, // Tự động chọn format tốt nhất
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result);
        }
      }
    );

    // Convert buffer to stream và pipe vào Cloudinary
    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Upload multiple files to Cloudinary
 * @param files - Array of multer files
 * @param folder - Cloudinary folder name
 * @returns Array of Cloudinary URLs
 */
export const uploadMultipleToCloudinary = async (
  files: Express.Multer.File[],
  folder: string = 'vietxanh'
): Promise<string[]> => {
  const uploadPromises = files.map((file) =>
    uploadToCloudinary(file.buffer, folder)
  );
  
  const results = await Promise.all(uploadPromises);
  return results.map((result) => result.secure_url);
};

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public_id (extracted from URL)
 * @returns Deletion result
 */
export const deleteFromCloudinary = async (publicId: string): Promise<any> => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

/**
 * Extract public_id from Cloudinary URL
 * @param url - Cloudinary URL
 * @returns public_id
 */
export const getPublicIdFromUrl = (url: string): string => {
  // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/image.jpg
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  
  if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
    // Get everything after 'upload/v123456789/'
    const pathParts = parts.slice(uploadIndex + 2);
    const fullPath = pathParts.join('/');
    // Remove file extension
    return fullPath.replace(/\.[^/.]+$/, '');
  }
  
  return '';
};
