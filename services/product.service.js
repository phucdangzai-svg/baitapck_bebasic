import * as productRepo from "../repositories/product.repository.js";
import { createError } from "../utils/createError.js";
import {
  uploadImageToCloud,
  deleteImageFromCloud,
} from "../configs/cloudinary.config.js";

const isAdmin = (user) => Boolean(user) && user.role === "ADMIN";

const isBlank = (value) =>
  value === undefined || value === null || value === "";

const formatProduct = (p) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  price: Number(p.price),
  stock: p.stock,
  isActive: Boolean(p.is_active),
  createdAt: p.created_at,
  updatedAt: p.updated_at,
  imageUrl: p.image_url,
});

const parseId = (id) => {
  const productId = Number(id);
  if (!Number.isInteger(productId) || productId <= 0) {
    throw createError(400, "Id sản phẩm không hợp lệ");
  }
  return productId;
};

const validateStock = (stock) => {
  return (
    !isBlank(stock) && Number.isInteger(Number(stock)) && Number(stock) >= 0
  );
};

const validateProduct = (product) => {
  const errors = [];

  if (typeof product.name !== "string" || product.name.trim() === "") {
    errors.push("Tên sản phẩm là bắt buộc");
  }
  if (
    isBlank(product.price) ||
    Number.isNaN(Number(product.price)) ||
    Number(product.price) < 0
  ) {
    errors.push("Giá phải là số lớn hơn hoặc bằng 0");
  }
  if (!validateStock(product.stock)) {
    errors.push("Tồn kho phải là số nguyên lớn hơn hoặc bằng 0");
  }
  if (typeof product.isActive !== "boolean") {
    errors.push("Trạng thái hoạt động phải là true hoặc false");
  }

  if (errors.length > 0) {
    throw createError(400, "Dữ liệu không hợp lệ", errors);
  }
};

export const getAllProduct = async (user) => {
  const products = await productRepo.getAllProduct(!isAdmin(user));
  return products.map(formatProduct);
};

export const getProductById = async (id, user) => {
  const product = await productRepo.getProductById(parseId(id));

  if (!product || (!product.is_active && !isAdmin(user))) {
    throw createError(404, "Không tìm thấy sản phẩm");
  }

  return formatProduct(product);
};

export const createProduct = async (data) => {
  const product = {
    name: data.name,
    description: data.description ?? null,
    price: data.price,
    stock: data.stock ?? 0,
    isActive: data.isActive ?? true,
  };

  validateProduct(product);

  const id = await productRepo.createProduct(product);
  return formatProduct(await productRepo.getProductById(id));
};

export const updateProduct = async (id, data) => {
  const productId = parseId(id);
  const existing = await productRepo.getProductById(productId);

  if (!existing) {
    throw createError(404, "Không tìm thấy sản phẩm");
  }

  const product = {
    name: data.name ?? existing.name,
    description: data.description ?? existing.description,
    price: data.price ?? existing.price,
    stock: data.stock ?? existing.stock,
    isActive: data.isActive ?? Boolean(existing.is_active),
  };

  validateProduct(product);

  await productRepo.updateProduct(productId, product);
  return formatProduct(await productRepo.getProductById(productId));
};

export const updateProductStock = async (id, stock) => {
  const productId = parseId(id);

  if (!validateStock(stock)) {
    throw createError(400, "Tồn kho phải là số nguyên lớn hơn hoặc bằng 0");
  }

  const existing = await productRepo.getProductById(productId);
  if (!existing) {
    throw createError(404, "Không tìm thấy sản phẩm");
  }

  await productRepo.updateProductStock(productId, Number(stock));
  return formatProduct(await productRepo.getProductById(productId));
};

export const deactivateProduct = async (id) => {
  const productId = parseId(id);
  const existing = await productRepo.getProductById(productId);

  if (!existing) {
    throw createError(404, "Không tìm thấy sản phẩm");
  }

  await productRepo.deactivateProduct(productId);
};

export const updateProductImage = async (id, file) => {
  if (!file) {
    throw createError(400, "Cần gửi file ảnh trong trường image");
  }

  // kiểm tra sản phẩm trước, không có thì khỏi upload
  const existing = await productRepo.getProductById(parseId(id));
  if (!existing) {
    throw createError(404, "Không tìm thấy sản phẩm");
  }

  let result;
  try {
    result = await uploadImageToCloud(file.buffer);
  } catch (error) {
    throw createError(502, "Không upload được ảnh lên Cloudinary, thử lại sau");
  }

  try {
    await productRepo.updateProductImage(
      existing.id,
      result.secure_url,
      result.public_id,
    );
  } catch (error) {
    // lưu DB lỗi thì xóa ảnh vừa upload, tránh để ảnh mồ côi trên Cloudinary
    await deleteImageFromCloud(result.public_id);
    throw error;
  }

  // thay ảnh mới thì xóa ảnh cũ
  if (existing.image_public_id) {
    await deleteImageFromCloud(existing.image_public_id);
  }

  const updated = await productRepo.getProductById(existing.id);
  return formatProduct(updated);
};
