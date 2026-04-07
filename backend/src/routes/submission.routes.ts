import { Router } from 'express';
import * as SubmissionController from '../controllers/submission.controller.js';
import { authenticateRequest } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticateRequest);

router.post('/submit', SubmissionController.handleSubmission);
router.get('/history/:problemId', SubmissionController.getSubmissionHistory);
router.get('/stats/:problemId', SubmissionController.getSubmissionStats);

export default router;