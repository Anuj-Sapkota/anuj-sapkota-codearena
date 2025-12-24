import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();
//signup
router.post('/register', authController.registerUser)

//sign in
router.post('/login', authController.loginUser);

export default router;