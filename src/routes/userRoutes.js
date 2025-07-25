import express from "express";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  res.json({ user: req.user });
});

export default router;
