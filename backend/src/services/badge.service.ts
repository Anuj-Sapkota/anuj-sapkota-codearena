import { prisma } from "../lib/prisma.js";
import { ServiceError } from "../errors/service.error.js";

interface BadgeCreateInput {
  name: string;
  description?: string;
  iconUrl: string;
}

export const getBadgeLibraryService = async () => {
  return prisma.badge.findMany({ orderBy: { createdAt: "desc" } });
};

export const createBadgeService = async (data: BadgeCreateInput) => {
  if (!data.name || !data.iconUrl) {
    throw new ServiceError("Name and Icon URL are required", 400);
  }
  return prisma.badge.create({ data });
};

//  Update badge using ID
export const updateBadgeService = async (
  id: string,
  data: {
    name?: string;
    description?: string;
    iconUrl?: string;
  },
) => {
  return prisma.badge.update({ where: { id }, data });
};

export const deleteBadgeService = async (id: string) => {
  return prisma.badge.delete({ where: { id } });
};
