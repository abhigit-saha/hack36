import { Router } from "express";
import { GetAppointments } from "../controllers/doctor-dashboard.controller.js";
const router = Router();

router.get('/getAppointments',GetAppointments);


export default router;