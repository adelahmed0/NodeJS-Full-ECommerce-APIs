import express, { Router } from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
} from "../validators/user.validator.js";
import {
  uploadSingleImage,
  resizeImage,
} from "../middleware/uploadImage.middleware.js";
import User from "../models/user.model.js";

const router: Router = express.Router();

const userAvatarUpload = uploadSingleImage("avatar");
const resizeUserAvatar = resizeImage(User, "user", "users", "avatar", 600, 600);

router
  .route("/")
  .get(getAllUsers)
  .post(userAvatarUpload, createUserValidator, resizeUserAvatar, createUser);

router
  .route("/:id")
  .get(getUserValidator, getUserById)
  .put(userAvatarUpload, updateUserValidator, resizeUserAvatar, updateUser)
  .delete(deleteUserValidator, deleteUser);

export default router;
