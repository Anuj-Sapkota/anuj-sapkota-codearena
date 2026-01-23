import { Router } from 'express';
import * as SubmissionController from '../controllers/submission.controller.js';

const router = Router();

// POST /api/submissions/submit
router.post('/submit', SubmissionController.handleSubmission);

export default router;