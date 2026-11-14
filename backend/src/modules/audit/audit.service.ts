import { prisma } from "../../infra/prisma";

export class AuditService {
    async add(userId: string, action: string, details: string) {
        return prisma.auditLog.create({
            data: { userId, action, details },
        });
    }

    async list(userId: string) {
        return prisma.auditLog.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 100,
            select: { id: true, action: true, details: true, createdAt: true },
        });
    }
}

export const auditService = new AuditService();
