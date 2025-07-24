import express from "express";
import {
  loginUser,
  registerUser,
  forgotPassword,
  logoutUser,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);

export default router;
