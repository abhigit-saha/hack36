import express from 'express';
import { 
  GetUser, 
  UpdateUser, 
  GetUserProfile,
  UpdateMedicalHistory,
  UpdateLifestyle,
  UpdateEmergencyContact,
  UpdateBasicInfo
} from '../controllers/user.controller.js';
import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

// Profile routes
router.get('/me', GetUser);
router.get('/profile', GetUserProfile);
router.put('/update', UpdateUser);

// Medical routes
router.put('/medical-history', UpdateMedicalHistory);

// Lifestyle routes
router.put('/lifestyle', UpdateLifestyle);

// Emergency contact routes
router.put('/emergency-contact', UpdateEmergencyContact);

// Basic info routes
router.put('/basic-info', UpdateBasicInfo);

// Protected route example
router.get('/protected', protectRoute, (req, res) => {
    res.status(200).json({
      message: 'Access granted to protected route',
      user: req.user
    });
});

export default router;