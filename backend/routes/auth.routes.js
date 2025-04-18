import express from 'express';
const router = express.Router();
import { VerifyOTP, ResendOTP, Register, Login, Logout, ForgotPassword, ResetPassword  } from '../controllers/auth.controller.js';

router.post('/login',Login)
router.post('/register',Register)
router.post('/logout',Logout)
router.post('/verify-otp',VerifyOTP);
router.post('/resend-otp',ResendOTP);
router.post('/forgot-password',ForgotPassword);
router.post('/reset-password',ResetPassword);

export default router;