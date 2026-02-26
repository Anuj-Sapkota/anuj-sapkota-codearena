import { prisma } from "../lib/prisma.js";

export class DiscussionService {
  static async getByProblem(problemId: number, currentUserId?: number) {
    return await prisma.discussion.findMany({
      where: { problemId, parentId: null },
      include: {
        user: { 
          select: { 
            username: true, 
            full_name: true, 
            profile_pic_url: true 
          } 
        },
        replies: {
          include: { 
            user: { 
              select: { username: true, full_name: true } 
            } 
          },
          orderBy: { createdAt: "asc" },
        },
        upvoteTracks: currentUserId ? { where: { userId: currentUserId } } : false,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async create(data: { 
    content: string; 
    userId: number; 
    problemId: number; 
    parentId?: string;
    language?: string | null; // Added language from dropdown
  }) {
    // 1. Logic: Prioritize dropdown language, then fallback to regex, then null
    const match = data.content.match(/```(\w+)/);
    const languageFallback = match ? match[1] : null;
    
    const finalLanguage = data.language || languageFallback;

    // 2. Map data explicitly to avoid 'undefined' vs 'null' type errors
    // Use 'as any' only if Prisma types are still clashing with your TS strict mode
    return await prisma.discussion.create({
      data: {
        content: data.content,
        userId: data.userId,
        problemId: data.problemId,
        language: finalLanguage,
        parentId: data.parentId ?? null, 
      } as any, 
      include: { 
        user: { 
          select: { username: true, full_name: true } 
        } 
      },
    });
  }

  static async toggleUpvote(discussionId: string, userId: number) {
    const existing = await prisma.discussionUpvote.findUnique({
      where: { 
        userId_discussionId: { 
          userId, 
          discussionId 
        } 
      },
    });

    if (existing) {
      return await prisma.$transaction(async (tx) => {
        await tx.discussionUpvote.delete({ 
          where: { id: existing.id } 
        });
        
        return await tx.discussion.update({
          where: { id: discussionId },
          data: { upvotes: { decrement: 1 } },
        });
      });
    }

    return await prisma.$transaction(async (tx) => {
      await tx.discussionUpvote.create({ 
        data: { userId, discussionId } 
      });
      
      return await tx.discussion.update({
        where: { id: discussionId },
        data: { upvotes: { increment: 1 } },
      });
    });
  }
}