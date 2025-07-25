import express from "express";
import {
  getChallenges,
  createChallenge,
  updateChallenge,
  deleteChallenge,
} from "../controllers/challengeController.js";

const router = express.Router();
router.get("/js", getChallenges);
router.post("/js/create", createChallenge);
router.put("/js/update", updateChallenge);
router.delete("/js/update", deleteChallenge);

export default router;
