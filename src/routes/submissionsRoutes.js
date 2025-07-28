import express from "express";

import { authMiddleware } from "../middlewares/auth.js";
import {
  getSubmissionChallenge,
  submitRegularChallenge,
  resubmitRegularChallenge,
  deleteSubmissionChallenge,
} from "../controllers/submissionsController.js";

const router = express.Router();

router.get("/js/regular", authMiddleware, getSubmissionChallenge);
router.post("/js/regular", authMiddleware, submitRegularChallenge);
router.put("/js/regular", authMiddleware, resubmitRegularChallenge);
router.delete("/js/regular", authMiddleware, deleteSubmissionChallenge);

export default router;
