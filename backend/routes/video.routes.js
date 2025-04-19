import { Router } from "express";
import {
  getPrescribedVideos,
  createSession,
  updateSessionProgress
} from "../controllers/video.controller.js";

const router = Router();

// Get prescribed videos for logged-in user
router.get("/prescribed-videos", getPrescribedVideos);

// Create a new video session
router.post("/sessions", createSession);

// Update session progress
router.patch("/sessions/:sessionId", updateSessionProgress);

export default router; 