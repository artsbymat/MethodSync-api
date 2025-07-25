import express from "express";
import {
  getChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
} from "../controllers/challengeController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();
router.get("/js", authMiddleware, getChallenges);
router.post("/js/create", authMiddleware, createChallenge);
router.put("/js/update", authMiddleware, updateChallenge);
router.delete("/js/update", authMiddleware, deleteChallenge);

export default router;
