import { Router } from "express";
import {
  DoctorRegister,
  getAllDoctors,
  getFilteredDoctors,
  getDoctorById,
  prescribeExerciseVideos,
  getPatientPreDiagnosisReports
} from "../controllers/doctor.controller.js";

const router = Router();

// Public routes
router.post("/register", DoctorRegister);
router.get("/", getAllDoctors);
router.get("/filter", getFilteredDoctors);
router.get("/:id", getDoctorById);



// Prescribe exercise videos
router.post("/prescribe", prescribeExerciseVideos);

// Get patient pre-diagnosis reports
router.get("/reports/pre-diagnosis", getPatientPreDiagnosisReports);

export default router;
