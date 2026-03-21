import express from "express";
import { initiateEsewaPayment, verifyEsewaPayment } from "../controllers/payment.controller.js";
import { authenticateRequest } from "../middleware/auth.middleware.js"; // Your auth guard

const router = express.Router();

router.post("/initiate-esewa", authenticateRequest, initiateEsewaPayment);

router.post("/verify-esewa", verifyEsewaPayment);

export default router;
