import authRouter from "./auth.routes.js";
import productRouter from "./product.routes.js";
import useRouter from "./user.routes.js";
import orderRoutes from "./order.routes.js";
import express from "express";

const router = express.Router();
router.use("/auth", authRouter);
router.use("/products", productRouter);
router.use("/users", useRouter);
router.use("/orders", orderRoutes);
export default router;
