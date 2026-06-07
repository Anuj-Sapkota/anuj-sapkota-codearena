import { prisma } from "../lib/prisma.js";
import { ServiceError } from "../errors/service.error.js";

export const saveAssignmentService = async (
  resourceId: string,
  userId: number,
  passScore: number,
  questions: any[],
) => {
  const resource = await (prisma.resource.findUnique as any)({ where: { id: resourceId } });
  if (!resource || resource.creatorId !== userId)
    throw new ServiceError("Unauthorized", 403);
  if (!questions || questions.length === 0)
    throw new ServiceError("At least one question required", 400);
  if (questions.length > 50)
    throw new ServiceError("Maximum 50 questions allowed", 400);
  if (passScore < 1 || passScore > 100)
    throw new ServiceError("Pass score must be between 1 and 100", 400);

  return prisma.$transaction(async (tx) => {
    const existing = await (tx.assignment.findUnique as any)({ where: { resourceId } });
    let asgn: any;
    if (existing) {
      await tx.assignmentQuestion.deleteMany({ where: { assignmentId: existing.id } });
      asgn = await (tx.assignment.update as any)({ where: { resourceId }, data: { passScore } });
    } else {
      asgn = await (tx.assignment.create as any)({ data: { resourceId, passScore } });
    }
    await tx.assignmentQuestion.createMany({
      data: questions.map((q: any, i: number) => ({
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
};

export const getAssignmentService = async (resourceId: string, userId: number) => {
  const resource: any = await (prisma.resource.findUnique as any)({
    where: { id: resourceId },
    include: {
      purchases: { where: { userId } },
      assignment: { include: { questions: { orderBy: { order: "asc" } } } },
    },
  });

  if (!resource) throw new ServiceError("Resource not found", 404);

  const isCreator = resource.creatorId === userId;
  const isOwned = isCreator || resource.purchases.length > 0;
  if (!isOwned) throw new ServiceError("Purchase required", 403);
  if (!resource.assignment) throw new ServiceError("No assignment", 404);

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

  return {
    id: resource.assignment.id,
    passScore: resource.assignment.passScore,
    questions,
    hasPassed: !!bestAttempt,
    isCreator,
  };
};

export const submitAssignmentService = async (
  assignmentId: string,
  userId: number,
  answers: number[],
) => {
  const assignment: any = await (prisma.assignment.findUnique as any)({
    where: { id: assignmentId },
    include: {
      questions: { orderBy: { order: "asc" } },
      resource: { select: { badgeId: true, id: true } },
    },
  });

  if (!assignment) throw new ServiceError("Assignment not found", 404);

  const total = assignment.questions.length;
  let score = 0;
  assignment.questions.forEach((q: any, i: number) => {
    if (answers[i] === q.correctIndex) score++;
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

  return { score, total, pct, passed, badgeAwarded };
};
