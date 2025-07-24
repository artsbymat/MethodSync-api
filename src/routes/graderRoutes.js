import express from "express";
import { gradeCode } from "../controllers/graderController.js";

const router = express.Router();
router.post("/js", gradeCode);

export default router;
