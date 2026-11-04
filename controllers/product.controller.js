import * as productService from "../services/product.service.js";
import { sendSuccess } from "../utils/response.js";

export const getAllProduct = async (req, res, next) => {
  try {
    const products = await productService.getAllProduct(req.user);
    sendSuccess(res, products, "Lấy danh sách sản phẩm thành công");
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(
      req.params.id,
      req.user,
    );
    sendSuccess(res, product, "Lấy chi tiết sản phẩm thành công");
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    sendSuccess(res, product, "Tạo sản phẩm thành công", 201);
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    sendSuccess(res, product, "Cập nhật sản phẩm thành công");
  } catch (error) {
    next(error);
  }
};

export const updateProductStock = async (req, res, next) => {
  try {
    const product = await productService.updateProductStock(
      req.params.id,
      req.body.stock,
    );
    sendSuccess(res, product, "Cập nhật tồn kho thành công");
  } catch (error) {
    next(error);
  }
};

export const deactivateProduct = async (req, res, next) => {
  try {
    await productService.deactivateProduct(req.params.id);
    sendSuccess(res, null, "Đã ngừng bán sản phẩm");
  } catch (error) {
    next(error);
  }
};
export const updateProductImage = async (req, res, next) => {
  try {
    const product = await productService.updateProductImage(
      req.params.id,
      req.file,
    );
    sendSuccess(res, product, "Cập nhật ảnh sản phẩm thành công");
  } catch (error) {
    next(error);
  }
};
