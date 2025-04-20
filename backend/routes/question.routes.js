import express from 'express';
import { GenerateQuestions } from '../controllers/question.controller.js';

const router = express.Router();

router.post('/generate', GenerateQuestions);

export default router;