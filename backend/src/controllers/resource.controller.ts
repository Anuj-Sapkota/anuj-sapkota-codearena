import type { Request, Response } from "express";
import {
  createSeriesService,
  getMyResourcesService,
  getResourceDashboardService,
  getResourceByIdService,
  deleteResourceService,
  updateResourceService,
  updateResourceBadgeService,
  getPublicResourcesService,
  getCreatorStatsService,
  incrementViewCountService,
  completeModuleService,
} from "../services/resource.service.js";

export const createSeries = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user?.sub);
    if (!userId || isNaN(userId)) {
      return res.status(401).json({ message: "Unauthorized: Invalid User ID" });
    }
    const result = await createSeriesService(userId, req.body);
    res.status(201).json({ success: true, message: "Series created successfully", data: result });
  } catch (error: any) {
    console.error("Resource creation error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ message: "A resource with this unique constraint already exists." });
    }
    res.status(500).json({ message: "Failed to create resource series", error: error.message });
  }
};

export const getMyResources = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user?.sub);
    const resources = await getMyResourcesService(userId);
    res.status(200).json(resources);
  } catch {
    res.status(500).json({ message: "Failed to fetch resources" });
  }
};

export const getResourceDashboard = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user?.sub);
    const result = await getResourceDashboardService(req.params.id as string, userId);
    res.json(result);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to fetch course dashboard" });
  }
};

export const getResourceById = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.sub ? parseInt((req as any).user.sub) : null;
    const result = await getResourceByIdService(req.params.id as string, userId);
    res.json(result);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ message: err.message || "Error fetching resource" });
  }
};

export const deleteResource = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user.sub);
    await deleteResourceService(req.params.id as string, userId);
    res.json({ message: "Resource and cloud assets deleted successfully" });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to delete resource" });
  }
};

export const updateResource = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user.sub);
    const updated = await updateResourceService(req.params.id as string, userId, req.body);
    res.json(updated);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ message: err.message || "Update failed" });
  }
};

export const updateResourceBadge = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user?.sub);
    await updateResourceBadgeService(req.params.id as string, userId, req.body.badgeId);
    res.json({ success: true });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to update badge" });
  }
};

export const getPublicResources = async (req: Request, res: Response) => {
  try {
    const rawUserId = (req as any).user?.sub;
    const result = await getPublicResourcesService({
      search: String(req.query.search || ""),
      page: Math.max(1, parseInt(String(req.query.page || "1"))),
      limit: Math.min(12, parseInt(String(req.query.limit || "9"))),
      sortBy: String(req.query.sortBy || "newest"),
      ...(rawUserId ? { userId: parseInt(rawUserId) } : {}),
    });
    res.status(200).json(result);
  } catch (error) {
    console.error("Public resources error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};  

export const getCreatorStats = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user?.sub);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const stats = await getCreatorStatsService(userId);
    res.status(200).json(stats);
  } catch {
    res.status(500).json({ message: "Failed to fetch creator stats" });
  }
};

export const incrementViewCount = async (req: Request, res: Response) => {
  try {
    const resource = await incrementViewCountService(req.params.id as string);
    res.status(200).json({ success: true, currentViews: resource.views });
  } catch {
    res.status(500).json({ message: "Could not track view" });
  }
};

export const completeModule = async (req: Request, res: Response) => {
  try {
    const userId = parseInt((req as any).user?.sub);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const result = await completeModuleService(userId, req.body.moduleId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: "Error saving progress", error: error.message });
  }
};
