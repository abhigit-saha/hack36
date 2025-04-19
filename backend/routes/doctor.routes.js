import { Router } from "express";
import {
  DoctorRegister,
  getAllDoctors,
  getFilteredDoctors,
  getDoctorById,
  prescribeExerciseVideos,
  getPatientPreDiagnosisReports,LoginDoctor, GetDoctor,
  SuggestDoctor
} from "../controllers/doctor.controller.js";

const router = Router();

// Public routes
router.post("/register", DoctorRegister);
router.get("/", getAllDoctors);
router.get("/filter", getFilteredDoctors);
router.get("/profile/:id", getDoctorById);
router.post("/login",LoginDoctor);
router.get("/me",GetDoctor)
router.post("/suggest",SuggestDoctor);



router.post("/prescribe", prescribeExerciseVideos);

router.get("/reports/pre-diagnosis", getPatientPreDiagnosisReports);

export default router;

