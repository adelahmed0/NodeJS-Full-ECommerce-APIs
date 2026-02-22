import express, { Router } from "express";
import { signupValidator } from "../validators/auth.validator.js";
import { signup } from "../controllers/auth.controller.js";

const router: Router = express.Router();

router.post("/signup", signupValidator, signup);

export default router;
