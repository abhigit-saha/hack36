import express from 'express';
import {
  DoctorRegister,
  getAllDoctors,getFilteredDoctors,getDoctorById
} from '../controllers/doctor.controller.js';

const router = express.Router();

router.post('/register', DoctorRegister);
router.get('/', getAllDoctors);
router.get('/filter', getFilteredDoctors);
router.get('/profile/:id', getDoctorById);


export default router;
