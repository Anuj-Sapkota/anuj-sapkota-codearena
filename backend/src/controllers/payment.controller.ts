import type { Request, Response } from "express";
import { initiateEsewaService, verifyEsewaService } from "../services/payment.service.js";
import { prisma } from "../lib/prisma.js";
import { ServiceError } from "../errors/service.error.js";
import { createNotification } from "../services/notification.service.js";

// ─── eSewa payment flow ───────────────────────────────────────────────────────

export const initiateEsewaPayment = async (req: Request, res: Response) => {
  try {
    const { resourceId } = req.body;
    const userId = Number((req as any).user.sub);
    const payload = await initiateEsewaService(userId, resourceId);
    res.json(payload);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ message: err.message || "Initialization error" });
  }
};

export const verifyEsewaPayment = async (req: Request, res: Response) => {
  try {
    const { encodedData } = req.body;
    const result = await verifyEsewaService(encodedData);
    res.status(200).json({
      success: true,
      message: "Purchase recorded. Creator balance updated.",
      resourceId: result.resourceId,
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ message: err.message || "Internal Server Error" });
  }
};

// ─── Student checkout history ─────────────────────────────────────────────────

/**
 * GET /api/payments/my-purchases
 * Student views their purchase history.
 */
export const getMyPurchases = async (req: Request, res: Response) => {
  try {
    const userId = Number((req as any).user.sub);
    const purchases = await prisma.purchase.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        resource: {
          select: {
            id: true,
            title: true,
            previewUrl: true,
            price: true,
            creator: { select: { full_name: true, username: true } },
            _count: { select: { modules: true } },
          },
        },
      },
    });
    res.json({ success: true, purchases });
  } catch {
    res.status(500).json({ message: "Failed to fetch purchase history" });
  }
};

// ─── Creator withdrawal requests ─────────────────────────────────────────────

/**
 * POST /api/payments/withdraw
 * Creator requests a withdrawal. All withdrawals require admin approval.
 * Minimum: NPR 5,000.
 */
export const requestWithdrawal = async (req: Request, res: Response) => {
  try {
    const userId = Number((req as any).user.sub);
    const { amount, esewaNumber, accountDetails } = req.body;

    if (!amount || amount <= 0) throw new ServiceError("Invalid withdrawal amount", 400);
    if (!esewaNumber?.trim()) throw new ServiceError("eSewa number is required", 400);

    const user = await prisma.user.findUnique({
      where: { userId },
      select: { pendingEarnings: true, role: true },
    });

    if (!user || (user.role !== "CREATOR" && user.role !== "ADMIN")) {
      throw new ServiceError("Only creators can request withdrawals", 403);
    }

    const MIN_WITHDRAWAL = 5_000; // NPR 5,000 minimum  
    if (amount < MIN_WITHDRAWAL) {
      console.log("MIN", MIN_WITHDRAWAL)
      throw new ServiceError(`Minimum withdrawal is NPR ${MIN_WITHDRAWAL.toLocaleString()}`, 400);
    }
    if (amount > user.pendingEarnings) {
      console.log("Amount"+ amount+ "PendingEarnings: " + user.pendingEarnings)
      throw new ServiceError("Insufficient pending earnings", 400);
    }

    const existing = await prisma.withdrawal.findFirst({ where: { userId, status: "PENDING" } });
    if (existing) throw new ServiceError("You already have a pending withdrawal request", 400);

    // All withdrawals are PENDING — admin must approve
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId,
        amount,
        method: "eSewa",
        accountDetails: `eSewa: ${esewaNumber.trim()}${accountDetails ? ` | ${accountDetails}` : ""}`,
        status: "PENDING",
      },
    });

    res.status(201).json({
      success: true,
      withdrawal,
      message: "Withdrawal request submitted. Admin will review and process within 3–5 business days.",
    });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

/**
 * GET /api/payments/withdrawals
 * Creator views their withdrawal history.
 */
export const getMyWithdrawals = async (req: Request, res: Response) => {
  try {
    const userId = Number((req as any).user.sub);
    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { requestedAt: "desc" },
    });
    res.json({ success: true, withdrawals });
  } catch {
    res.status(500).json({ message: "Failed to fetch withdrawals" });
  }
};

// ─── Admin payment management ─────────────────────────────────────────────────

/**
 * GET /api/payments/admin/withdrawals
 * Admin views all withdrawal requests with creator info.
 */
export const adminGetWithdrawals = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const where: any = status && status !== "ALL" ? { status } : {};

    const withdrawals = await prisma.withdrawal.findMany({
      where,
      orderBy: { requestedAt: "desc" },
      include: {
        user: {
          select: {
            userId: true, username: true, full_name: true,
            email: true, profile_pic_url: true,
            pendingEarnings: true, totalWithdrawn: true, totalEarnings: true,
          },
        },
      },
    });

    res.json({ success: true, withdrawals });
  } catch {
    res.status(500).json({ message: "Failed to fetch withdrawals" });
  }
};

/**
 * PATCH /api/payments/admin/withdrawals/:id
 * Admin approves (marks as PAID) or rejects a withdrawal.
 * When PAID: deducts from creator's pendingEarnings.
 */
export const adminReviewWithdrawal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body; // PAID | REJECTED

    if (!["PAID", "REJECTED"].includes(status)) {
      throw new ServiceError("Status must be PAID or REJECTED", 400);
    }

    const withdrawal = await prisma.withdrawal.findUnique({ where: { id: id as string } });
    if (!withdrawal) throw new ServiceError("Withdrawal not found", 404);
    if (withdrawal.status !== "PENDING") {
      throw new ServiceError("Only pending withdrawals can be reviewed", 400);
    }

    await prisma.$transaction(async (tx) => {
      await tx.withdrawal.update({
        where: { id: id as string },
        data: { status, adminNote: adminNote ?? null, resolvedAt: new Date() },
      });

      if (status === "PAID") {
        await tx.user.update({
          where: { userId: withdrawal.userId },
          data: {
            pendingEarnings: { decrement: withdrawal.amount },
            totalWithdrawn: { increment: withdrawal.amount },
          },
        });
      }
      // REJECTED: no balance change — amount stays in pending
    });

    res.json({ success: true, message: `Withdrawal ${status === "PAID" ? "approved and marked as paid" : "rejected"}` });

    // Fire notification to creator after responding (non-blocking)
    const npr = (v: number) => `NPR ${v.toLocaleString()}`;
    if (status === "PAID") {
      createNotification({
        userId: withdrawal.userId,
        type: "SYSTEM",
        title: "Withdrawal Processed ✅",
        message: `Your withdrawal of ${npr(withdrawal.amount)} has been approved and transferred to your eSewa account. Check your eSewa wallet.`,
        link: "/creator/dashboard",
      }).catch(() => {});
    } else {
      createNotification({
        userId: withdrawal.userId,
        type: "SYSTEM",
        title: "Withdrawal Rejected",
        message: `Your withdrawal request of ${npr(withdrawal.amount)} was rejected.${adminNote ? ` Reason: ${adminNote}` : " Please contact support for details."}`,
        link: "/creator/dashboard",
      }).catch(() => {});
    }
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

/**
 * GET /api/payments/admin/purchases
 * Admin views complete checkout/purchase history across all users.
 */
export const adminGetPurchases = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || "1")));
    const limit = Math.min(20, parseInt(String(req.query.limit || "15")));
    const skip = (page - 1) * limit;

    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { userId: true, username: true, full_name: true, email: true } },
          resource: {
            select: {
              id: true, title: true, price: true,
              creator: { select: { username: true, full_name: true } },
            },
          },
        },
      }),
      prisma.purchase.count(),
    ]);

    res.json({
      success: true,
      purchases,
      meta: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch purchase history" });
  }
};

/**
 * GET /api/payments/admin/stats
 * Platform-wide payment overview for admin.
 */
export const adminPaymentStats = async (req: Request, res: Response) => {
  try {
    const [totalRevenue, pendingWithdrawals, paidOut, totalPurchases] = await Promise.all([
      prisma.purchase.aggregate({ _sum: { amount: true } }),
      prisma.withdrawal.aggregate({
        where: { status: "PENDING" },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.withdrawal.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),
      prisma.purchase.count(),
    ]);

    const gross = totalRevenue._sum.amount ?? 0;

    res.json({
      success: true,
      stats: {
        grossRevenue: gross,
        platformFee: gross * 0.2,
        creatorPayouts: gross * 0.8,
        totalPurchases,
        pendingWithdrawals: {
          count: pendingWithdrawals._count,
          amount: pendingWithdrawals._sum.amount ?? 0,
        },
        totalPaidOut: paidOut._sum.amount ?? 0,
      },
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch payment stats" });
  }
};
