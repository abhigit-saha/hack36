import { Router } from "express";
import {
  generatePreDiagnosisReport,
  getPreDiagnosisForDoctor,
  updatePreDiagnosisStatus
} from "../controllers/preDiagnosis.controller.js";

const router = Router();



// Generate pre-diagnosis report
router.post("/generate", generatePreDiagnosisReport);

// Get pre-diagnosis report for doctor
router.get("/appointment/:appointmentId", getPreDiagnosisForDoctor);

// Update pre-diagnosis status and doctor notes
router.patch("/:preDiagnosisId", updatePreDiagnosisStatus);

export default router; 