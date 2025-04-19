import express from 'express';
import { scheduleExerciseVideo, getUserScheduledSessions } from '../controllers/schedule.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js'; // Assuming you have auth middleware

const router = express.Router();

router.use(verifyJWT); // Protect all routes

router.post('/schedule', scheduleExerciseVideo);
router.get('/sessions', getUserScheduledSessions);

export default router; 