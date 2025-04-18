import express from 'express';
import { DoctorRegister } from '../controllers/doctor.controller.js';
const router = express.Router();

router.post("/register",DoctorRegister)

export default router;