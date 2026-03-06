import express, { Router } from "express";
import { createCashOrder } from "../controllers/order.controller.js";
import { protect, allowedTo } from "../middleware/auth.middleware.js";

const router: Router = express.Router();

router.use(protect, allowedTo("user"));

router.post("/:cartId", createCashOrder);

export default router;
