import express from 'express';
import { GetUser } from '../controllers/user.controller.js';
import protectRoute from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/me',GetUser);
router.get('/protected', protectRoute, (req, res) => {
    res.status(200).json({
      message: 'Access granted to protected route',
      user: req.user
    });
});

export default router;