import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// 1. Get all available badges (For the Creator Dropdown)
export const getBadgeLibrary = async (req: Request, res: Response) => {
  try {
    const badges = await prisma.badge.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(badges);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch badges" });
  }
};

// 2. Admin Creates a New Badge Template
export const adminCreateBadge = async (req: Request, res: Response) => {
  try {
    const { name, description, iconUrl } = req.body;

    if (!name || !iconUrl) {
      return res
        .status(400)
        .json({ message: "Name and Icon URL are required" });
    }

    const newBadge = await prisma.badge.create({
      data: { name, description, iconUrl },
    });

    return res.status(201).json(newBadge);
  } catch (error) {
    return res.status(500).json({ message: "Error creating badge" });
  }
};

export const getBadges = async (req: Request, res: Response) => {
  try {
    const badges = await prisma.badge.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json(badges);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch badges" });
  }
};

export const updateBadge = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, iconUrl } = req.body;
  try {
    const updated = await prisma.badge.update({
      where: { id },
      data: { name, description, iconUrl },
    });
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ error: "Update failed" });
  }
};

export const deleteBadge = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await prisma.badge.delete({ where: { id } });
    return res.status(200).json({ message: "Badge deleted" });
  } catch (error) {
    return res.status(500).json({ error: "Delete failed" });
  }
};
