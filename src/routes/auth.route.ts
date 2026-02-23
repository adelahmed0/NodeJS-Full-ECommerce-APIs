import express, { Router } from "express";
import {
  signupValidator,
  loginValidator,
} from "../validators/auth.validator.js";
import { signup, login } from "../controllers/auth.controller.js";

const router: Router = express.Router();

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);

export default router;
