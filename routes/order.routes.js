import express from "express";
import * as orderController from "../controllers/order.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();
const adminOnly = [authenticate, authorize(["ADMIN"])];

router.post("/", authenticate, orderController.createOrder);
router.get("/my", authenticate, orderController.getAllOrderByUserId);
router.get("/", adminOnly, orderController.getAllOrder);
router.get("/:id", authenticate, orderController.getOrderById);
router.patch("/:id/status", adminOnly, orderController.updateOrderStatus);

export default router;
