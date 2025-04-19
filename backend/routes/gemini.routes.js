import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  generateReport,
  getReportById,
  getUserReports
} from "../controllers/gemini.controller.js";

const router = Router();

// Apply JWT verification middleware to all routes
router.use(verifyJWT);

// Generate pre-diagnosis report using Gemini AI
router.post("/generate-report", generateReport);

// Get a specific pre-diagnosis report
router.get("/report/:preDiagnosisId", getReportById);

// Get all pre-diagnosis reports for the logged-in user
router.get("/user-reports", getUserReports);

export default router; 