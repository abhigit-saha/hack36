import { Router } from "express";
import {
  DoctorRegister,
  getAllDoctors,
  getFilteredDoctors,
  getDoctorById,
  prescribeExerciseVideos,
  getPatientPreDiagnosisReports,
  GetDoctor,
} from "../controllers/doctor.controller.js";
import { DoctorLogin } from "../controllers/auth.controller.js";

const router = Router();

// Public routes
router.post("/register", DoctorRegister);
router.get("/", getAllDoctors);
router.get("/filter", getFilteredDoctors);
router.get("/:id", getDoctorById);
router.get("/login", DoctorLogin);
router.get("/me", GetDoctor);

// Prescribe exercise videos
router.post("/prescribe", prescribeExerciseVideos);

// Get patient pre-diagnosis reports
router.get("/reports/pre-diagnosis", getPatientPreDiagnosisReports);

export default router;
