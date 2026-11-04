import express from "express";
import * as productController from "../controllers/product.controller.js";
import {
  authenticate,
  authorize,
  optionalAuthenticate,
} from "../middlewares/auth.middleware.js";
import { uploadProductImage } from "../middlewares/upload.middleware.js";

const router = express.Router();
const adminOnly = [authenticate, authorize(["ADMIN"])];

router.get("/", optionalAuthenticate, productController.getAllProduct);
router.get("/:id", optionalAuthenticate, productController.getProductById);
router.post("/", adminOnly, productController.createProduct);
router.put("/:id", adminOnly, productController.updateProduct);
router.patch("/:id/stock", adminOnly, productController.updateProductStock);
router.delete("/:id", adminOnly, productController.deactivateProduct);
router.put(
  "/:id/image",
  adminOnly,
  uploadProductImage,
  productController.updateProductImage,
);
export default router;
