import { REFRESH_TOKEN_TTL_MS } from "../../config/constants";
import { prisma } from "../../infra/prisma";
import { auditService } from "../audit/audit.service";


export class AuthService {
    async create(email: string, password: string) {
        const normalizeEmail = email.trim().toLocaleLowerCase();
        const passwordHash = await Bun.password.hash(password);

        const user = await prisma.user.create({
            data: {
                email: normalizeEmail,
                passwordHash,
            },
            select: {
                id: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        await auditService.add(user.id, "account_registered", "Создан аккаунт");
        return user;
    }

    async login(email: string, password: string) {
        const normalizeEmail = email.trim().toLocaleLowerCase();
        const user = await prisma.user.findUnique({
            where: {email: normalizeEmail}
        });
        
        if(!user) {
            return null;
        }

        const isPasswordValid = await Bun.password.verify(password, user.passwordHash);
         if(!isPasswordValid) {
            return null;
        }

        const sessionId = crypto.randomUUID();
        const refreshToken = `ac_refresh_${sessionId}.${crypto.randomUUID()}`; 
        const tokenHash = await Bun.password.hash(refreshToken);
        const expiredAt = new Date(Date.now()+REFRESH_TOKEN_TTL_MS);

        await prisma.authSession.create({
            data: {
                id: sessionId,
                userId: user.id,
                tokenHash,
                expiredAt
            }
        })

        await auditService.add(user.id, "login", "Вход в аккаунт");
        return { user, refreshToken, sessionId };
    }

    async refresh(refreshToken: string) {
        if (!refreshToken.startsWith("ac_refresh_")) {
            return null
        }

        const tokenParts = refreshToken.replace("ac_refresh_", "").split(".");
        if (tokenParts.length !== 2) {
            return null;
        }

        const [sessionId] = tokenParts;
        const session = await prisma.authSession.findUnique({
            where: {
                id: sessionId
            },
            include: { 
                user: true
            }
        });

        if (!session || session.revokedAt || session.expiredAt <= new Date()) {
            return null;
        }
        
        const isTokenValid = await Bun.password.verify(refreshToken, session.tokenHash);

        if (!isTokenValid) {
            return null;
        }

        const newSessionId = crypto.randomUUID();
        const newRefreshToken = `ac_refresh_${newSessionId}.${crypto.randomUUID()}`;
        const newTokenHash = await Bun.password.hash(newRefreshToken);
        const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

        const result = await prisma.$transaction(async (transaction) => {
        const revokedSession = await transaction.authSession.updateMany({
                where: { id: session.id, tokenHash: session.tokenHash, revokedAt: null, expiredAt: { gt: new Date() } },
                data: { revokedAt: new Date() },
            });

            if (revokedSession.count !== 1) {
                return null;
            }

            await transaction.authSession.create({
                data: { id: newSessionId, userId: session.userId, tokenHash: newTokenHash, expiredAt: newExpiresAt },
            });

            return { user: session.user, refreshToken: newRefreshToken, sessionId: newSessionId };
            
        });
        return result;
    }

    async logout(refreshToken: string) {
        if (!refreshToken.startsWith("ac_refresh_")) {
            return false;
        }

        const tokenParts = refreshToken.replace("ac_refresh_", "").split(".");
        if (tokenParts.length !== 2) {
            return false;
        }

        const [sessionId] = tokenParts;
        const session = await prisma.authSession.findUnique({
            where: { id: sessionId },
        });

        if (!session || session.revokedAt) {
            return false;
        }

        const isTokenValid = await Bun.password.verify(refreshToken, session.tokenHash);
        if (!isTokenValid) {
            return false;
        }

        const result = await prisma.authSession.updateMany({
            where: { id: session.id, tokenHash: session.tokenHash, revokedAt: null },
            data: { revokedAt: new Date() },
        });

        if (result.count === 1) {
            await auditService.add(session.userId, "logout", "Выход из аккаунта");
            return true;
        }
        return false;
    }

    async getProfile(userId: string) {
        return prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, createdAt: true },
        });
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string, currentSessionId: string) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || !(await Bun.password.verify(currentPassword, user.passwordHash))) {
            return false;
        }

        const passwordHash = await Bun.password.hash(newPassword);
        await prisma.$transaction([
            prisma.user.update({ where: { id: userId }, data: { passwordHash } }),
            prisma.authSession.updateMany({
                where: { userId, id: { not: currentSessionId }, revokedAt: null },
                data: { revokedAt: new Date() },
            }),
        ]);

        await auditService.add(userId, "password_changed", "Пароль изменён; остальные входы завершены");
        return true;
    }

    async listSessions(userId: string, currentSessionId: string) {
        const sessions = await prisma.authSession.findMany({
            where: { userId, revokedAt: null, expiredAt: { gt: new Date() } },
            orderBy: { createdAt: "desc" },
            select: { id: true, createdAt: true, expiredAt: true },
        });

        return sessions.map((session) => ({ ...session, isCurrent: session.id === currentSessionId }));
    }

    async revokeSession(userId: string, sessionId: string) {
        const result = await prisma.authSession.updateMany({
            where: { id: sessionId, userId, revokedAt: null, expiredAt: { gt: new Date() } },
            data: { revokedAt: new Date() },
        });

        if (result.count === 1) {
            await auditService.add(userId, "session_revoked", "Завершён другой вход в аккаунт");
            return true;
        }

        return false;
    }
}

export const authService = new AuthService();
