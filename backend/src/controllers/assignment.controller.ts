import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

// ── Creator: save/replace assignment for a resource ──────────────────────────
export const saveAssignment = async (req: Request, res: Response) => {
  try {
    const resourceId = req.params.resourceId as string;
    const { passScore, questions } = req.body;
    const userId = parseInt((req as any).user?.sub);

    const resource = await (prisma.resource.findUnique as any)({ where: { id: resourceId } });
    if (!resource || resource.creatorId !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    if (!questions || questions.length === 0)
      return res.status(400).json({ message: "At least one question required" });
    if (questions.length > 50)
      return res.status(400).json({ message: "Maximum 50 questions allowed" });
    if (passScore < 1 || passScore > 100)
      return res.status(400).json({ message: "Pass score must be between 1 and 100" });

    const assignment = await prisma.$transaction(async (tx) => {
      const existing = await (tx.assignment.findUnique as any)({ where: { resourceId } });

      let asgn: any;
      if (existing) {
        await tx.assignmentQuestion.deleteMany({ where: { assignmentId: existing.id } });
        asgn = await (tx.assignment.update as any)({ where: { resourceId }, data: { passScore } });
      } else {
        asgn = await (tx.assignment.create as any)({ data: { resourceId, passScore } });
      }

      await tx.assignmentQuestion.createMany({
        data: (questions as any[]).map((q: any, i: number) => ({
          assignmentId: asgn.id,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          order: i,
        })),
      });

      return (tx.assignment.findUnique as any)({
        where: { id: asgn.id },
        include: { questions: { orderBy: { order: "asc" } } },
      });
    });

    res.status(200).json({ success: true, assignment });
  } catch (err: any) {
    console.error("saveAssignment error:", err);
    res.status(500).json({ message: "Failed to save assignment" });
  }
};

// ── Student: get assignment (strips correct answers) ─────────────────────────
export const getAssignment = async (req: Request, res: Response) => {
  try {
    const resourceId = req.params.resourceId as string;
    const userId = parseInt((req as any).user?.sub);

    const resource: any = await (prisma.resource.findUnique as any)({
      where: { id: resourceId },
      include: {
        purchases: { where: { userId } },
        assignment: { include: { questions: { orderBy: { order: "asc" } } } },
      },
    });

    if (!resource) return res.status(404).json({ message: "Resource not found" });

    const isCreator = resource.creatorId === userId;
    const isOwned = isCreator || resource.purchases.length > 0;
    if (!isOwned) return res.status(403).json({ message: "Purchase required" });
    if (!resource.assignment) return res.status(404).json({ message: "No assignment" });

    const bestAttempt = await prisma.assignmentAttempt.findFirst({
      where: { assignmentId: resource.assignment.id, userId, passed: true },
    });

    const questions = resource.assignment.questions.map((q: any) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      order: q.order,
      ...(isCreator ? { correctIndex: q.correctIndex } : {}),
    }));

    res.json({
      id: resource.assignment.id,
      passScore: resource.assignment.passScore,
      questions,
      hasPassed: !!bestAttempt,
      isCreator,
    });
  } catch (err: any) {
    console.error("getAssignment error:", err);
    res.status(500).json({ message: "Failed to fetch assignment" });
  }
};

// ── Student: submit answers ───────────────────────────────────────────────────
export const submitAssignment = async (req: Request, res: Response) => {
  try {
    const assignmentId = req.params.assignmentId as string;
    const { answers } = req.body;
    const userId = parseInt((req as any).user?.sub);

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const assignment: any = await (prisma.assignment.findUnique as any)({
      where: { id: assignmentId },
      include: {
        questions: { orderBy: { order: "asc" } },
        resource: { select: { badgeId: true, id: true } },
      },
    });

    if (!assignment) return res.status(404).json({ message: "Assignment not found" });

    const total = assignment.questions.length;
    let score = 0;
    assignment.questions.forEach((q: any, i: number) => {
      if ((answers as number[])[i] === q.correctIndex) score++;
    });

    const pct = Math.round((score / total) * 100);
    const passed = pct >= assignment.passScore;

    await prisma.assignmentAttempt.create({
      data: { assignmentId, userId, score, total, passed, answers },
    });

    let badgeAwarded = false;
    if (passed && assignment.resource.badgeId) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId, badgeId: assignment.resource.badgeId } },
        update: {},
        create: { userId, badgeId: assignment.resource.badgeId },
      });
      badgeAwarded = true;
    }

    res.json({ success: true, score, total, pct, passed, badgeAwarded });
  } catch (err: any) {
    console.error("submitAssignment error:", err);
    res.status(500).json({ message: "Failed to submit assignment" });
  }
};
