import type { Request, Response } from "express";
import {
  getAdminStatsService,
  getUsersService,
  updateUserRoleService,
  banUserService,
} from "../services/admin.service.js";
import { createNotification, notifyRoleChanged } from "../services/notification.service.js";

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const stats = await getAdminStatsService();
    res.json(stats);
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ message: "Failed to fetch admin stats" });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || "1")));
    const limit = Math.min(20, parseInt(String(req.query.limit || "10")));
    const search = String(req.query.search || "");
    const role = req.query.role as string | undefined;

    const result = await getUsersService({ page, limit, search, role });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["USER", "CREATOR", "ADMIN"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const updated = await updateUserRoleService(Number(userId), role);

    // Notify user of role change (non-blocking)
    notifyRoleChanged(Number(userId), role, updated.previousRole ?? "USER").catch(() => {});

    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update role" });
  }
};

export const banUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const updated = await banUserService(Number(userId));

    // Notify user they've been demoted
    notifyRoleChanged(Number(userId), "USER", updated.previousRole ?? "CREATOR").catch(() => {});

    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to ban user" });
  }
};
