import { Router } from 'express';
import * as SubmissionController from '../controllers/submission.controller.js';
import { authenticateRequest } from '../middlewares/auth.middleware.js'; // Ensure user is logged in

const router = Router();

router.use(authenticateRequest); 

// POST /api/submissions/submit
router.post('/submit', SubmissionController.handleSubmission);

// GET /api/submissions/history/:problemId
router.get('/history/:problemId', SubmissionController.getSubmissionHistory);

export default router;