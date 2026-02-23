import express, { Router } from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserPassword,
} from "../controllers/user.controller.js";
import {
  createUserValidator,
  getUserValidator,
  updateUserValidator,
  deleteUserValidator,
  updateUserPasswordValidator,
} from "../validators/user.validator.js";
import {
  uploadSingleImage,
  resizeImage,
  parseFormData,
} from "../middleware/uploadImage.middleware.js";
import User from "../models/user.model.js";

const router: Router = express.Router();

const userAvatarUpload = uploadSingleImage("avatar");
const resizeUserAvatar = resizeImage(User, "user", "users", "avatar", 600, 600);

router
  .route("/")
  .get(getAllUsers)
  .post(userAvatarUpload, createUserValidator, resizeUserAvatar, createUser);

router.put(
  "/change-password/:id",
  parseFormData(),
  updateUserPasswordValidator,
  updateUserPassword,
);

router
  .route("/:id")
  .get(getUserValidator, getUserById)
  .put(userAvatarUpload, updateUserValidator, resizeUserAvatar, updateUser)
  .delete(deleteUserValidator, deleteUser);

export default router;
