import type { Request, Response } from "express";
import {
  getBadgeLibraryService,
  createBadgeService,
  updateBadgeService,
  deleteBadgeService,
} from "../services/badge.service.js";

export const getBadgeLibrary = async (req: Request, res: Response) => {
  try {
    const badges = await getBadgeLibraryService();
    res.status(200).json(badges);
  } catch {
    res.status(500).json({ message: "Failed to fetch badges" });
  }
};

export const adminCreateBadge = async (req: Request, res: Response) => {
  try {
    const badge = await createBadgeService(req.body);
    res.status(201).json(badge);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ message: err.message || "Error creating badge" });
  }
};

// alias kept for route compatibility
export const getBadges = getBadgeLibrary;

export const updateBadge = async (req: Request, res: Response) => {
  try {
    const updated = await updateBadgeService(req.params.id, req.body);
    res.status(200).json(updated);
  } catch {
    res.status(500).json({ message: "Update failed" });
  }
};

export const deleteBadge = async (req: Request, res: Response) => {
  try {
    await deleteBadgeService(req.params.id);
    res.status(200).json({ message: "Badge deleted" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
};
