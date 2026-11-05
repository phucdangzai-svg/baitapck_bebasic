import "dotenv/config";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// đẩy ảnh (dạng buffer trong RAM) lên Cloudinary, trả về kết quả có secure_url và public_id
export const uploadImageToCloud = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "shop/products", resource_type: "image" },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      },
    );
    stream.end(buffer);
  });
};

// xóa ảnh trên Cloudinary, lỗi thì chỉ ghi log, không làm hỏng request
export const deleteImageFromCloud = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Xóa ảnh trên Cloudinary thất bại:", error.message);
  }
};
