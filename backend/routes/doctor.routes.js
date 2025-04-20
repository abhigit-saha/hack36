import { Router } from "express";
import {
  DoctorRegister,
  LoginDoctor,
  GetDoctorProfile,
  UpdateBasicInfo,
  UpdateProfessionalInfo,
  UpdateAvailability,
  getDoctorById,
  getAllDoctors,
  getFilteredDoctors,
  getDoctorListings
} from "../controllers/doctor.controller.js";

const router = Router();

// Public routes
router.post("/register", DoctorRegister);
router.post("/login", LoginDoctor);
router.get("/", getAllDoctors);
router.get("/filter", getFilteredDoctors);
router.get("/listings", getDoctorListings);

// Profile routes
router.get("/profile", GetDoctorProfile);
router.get("/profile/:id", getDoctorById);

// Update routes
router.put("/basic-info", UpdateBasicInfo);
router.put("/professional-info", UpdateProfessionalInfo);
router.put("/availability", UpdateAvailability);

export default router;
