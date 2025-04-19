import { Router } from "express";
import { getAppointmentById, GetAppointments } from "../controllers/doctor-dashboard.controller.js";
const router = Router();

router.get('/getAppointments',GetAppointments);
router.get('/getAppointment/:id', getAppointmentById);


export default router;