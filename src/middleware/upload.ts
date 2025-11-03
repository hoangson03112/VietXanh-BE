import multer from 'multer';
import path from 'path';

// File filter để chỉ cho phép upload ảnh
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Middleware upload - lưu vào memory để upload lên Cloudinary
export const upload = multer({
  storage: multer.memoryStorage(), // Lưu file vào memory buffer
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
});
