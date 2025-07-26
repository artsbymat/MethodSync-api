import express from "express";
import {
  getChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getChallenge,
} from "../controllers/challengeController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();
router.get("/js", authMiddleware, getChallenges);
router.post("/js", authMiddleware, createChallenge);
router.put("/js", authMiddleware, updateChallenge);
router.delete("/js", authMiddleware, deleteChallenge);
router.get("/js/:slug", authMiddleware, getChallenge);

export default router;
