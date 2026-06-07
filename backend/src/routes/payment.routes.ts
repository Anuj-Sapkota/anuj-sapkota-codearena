import express from "express";
import {
  initiateEsewaPayment,
  verifyEsewaPayment,
  getMyPurchases,
  requestWithdrawal,
  getMyWithdrawals,
  adminGetWithdrawals,
  adminReviewWithdrawal,
  adminGetPurchases,
  adminPaymentStats,
} from "../controllers/payment.controller.js";
import { authenticateRequest } from "../middleware/auth.middleware.js";
import { authorizeRequest } from "../middleware/authorize.middleware.js";

const router = express.Router();

// ── Student ───────────────────────────────────────────────────────────────────
router.post("/initiate-esewa", authenticateRequest, initiateEsewaPayment);
router.post("/verify-esewa", verifyEsewaPayment);
router.get("/my-purchases", authenticateRequest, getMyPurchases);

// ── Creator ───────────────────────────────────────────────────────────────────
router.post("/withdraw", authenticateRequest, requestWithdrawal);
router.get("/withdrawals", authenticateRequest, getMyWithdrawals);

// ── Admin ─────────────────────────────────────────────────────────────────────
router.get("/admin/stats", authenticateRequest, authorizeRequest("ADMIN"), adminPaymentStats);
router.get("/admin/purchases", authenticateRequest, authorizeRequest("ADMIN"), adminGetPurchases);
router.get("/admin/withdrawals", authenticateRequest, authorizeRequest("ADMIN"), adminGetWithdrawals);
router.patch("/admin/withdrawals/:id", authenticateRequest, authorizeRequest("ADMIN"), adminReviewWithdrawal);

export default router;
