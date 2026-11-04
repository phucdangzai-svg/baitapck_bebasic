import express from "express";
import * as userController from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", authenticate, userController.getUserProfile);
router.put("/me", authenticate, userController.updateUserProfile);

export default router;
