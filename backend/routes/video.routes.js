import { Router } from "express";
import {
  getPrescribedVideos,
  createSession,
  updateSessionProgress,
  prescribeVideo,
} from "../controllers/video.controller.js";

const router = Router();

// Get prescribed videos for logged-in user
router.get("/prescribed-videos", getPrescribedVideos);

// Create a new video Fsession
router.post("/sessions", createSession);

// Update session progress
router.patch("/sessions/:sessionId", updateSessionProgress);

router.post("/prescribe", prescribeVideo);
// router.post("/recommend", recommendVideo);

export default router;
