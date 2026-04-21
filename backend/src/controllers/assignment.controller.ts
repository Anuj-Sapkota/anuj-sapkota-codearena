import type { Request, Response } from "express";
import {
  saveAssignmentService,
  getAssignmentService,
  submitAssignmentService,
} from "../services/assignment.service.js";

export const saveAssignment = async (req: Request, res: Response) => {
  try {
    const resourceId = req.params.resourceId as string;
    const userId = parseInt((req as any).user?.sub);
    const { passScore, questions } = req.body;

    const assignment = await saveAssignmentService(resourceId, userId, passScore, questions);
    res.status(200).json({ success: true, assignment });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to save assignment" });
  }
};

export const getAssignment = async (req: Request, res: Response) => {
  try {
    const resourceId = req.params.resourceId as string;
    const userId = parseInt((req as any).user?.sub);

    const assignment = await getAssignmentService(resourceId, userId);
    res.json(assignment);
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to fetch assignment" });
  }
};

export const submitAssignment = async (req: Request, res: Response) => {
  try {
    const assignmentId = req.params.assignmentId as string;
    const userId = parseInt((req as any).user?.sub);
    const { answers } = req.body;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "answers array is required" });
    }

    const result = await submitAssignmentService(assignmentId, userId, answers);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(err.statusCode || 500).json({ message: err.message || "Failed to submit assignment" });
  }
};
