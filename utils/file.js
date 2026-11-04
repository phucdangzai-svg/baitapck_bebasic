import fs from "fs/promises";
import path from "path";

// xóa file, file không còn thì bỏ qua
export const removeFile = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // không làm gì
  }
};

// xóa ảnh theo đường dẫn lưu trong DB, ví dụ /uploads/products/abc.png
export const removeImageByUrl = async (imageUrl) => {
  await removeFile(path.join(process.cwd(), imageUrl));
};
