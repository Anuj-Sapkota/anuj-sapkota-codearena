import type { Request, Response } from "express";
import {
  getNotifications,
  markAsRead,
  getUnreadCount,
  deleteNotification,
} from "../services/notification.service.js";

export const listNotifications = async (req: Request, res: Response) => {
  try {
    const userId = Number((req as any).user.sub);
    const notifications = await getNotifications(userId);
    const unreadCount = await getUnreadCount(userId);
    res.json({ success: true, notifications, unreadCount });
  } catch {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const markRead = async (req: Request, res: Response) => {
  try {
    const userId = Number((req as any).user.sub);
    const { id } = req.params; // optional — if not provided, marks all
    await markAsRead(userId, id || undefined);
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Failed to mark as read" });
  }
};

export const removeNotification = async (req: Request, res: Response) => {
  try {
    const userId = Number((req as any).user.sub);
    const { id } = req.params;
    await deleteNotification(userId, id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Failed to delete notification" });
  }
};
