import { prisma } from "../../infra/prisma";

export interface AuthenticatedUser {
    id: string;
    email: string;
    sessionId: string;
}

type AccessTokenPayload = { sub: string; email: string; sid: string };
type JwtVerifier = (token: string) => Promise<AccessTokenPayload | false>;

export async function getAuthenticatedUser(
    authorization: string | undefined,
    verifyToken: JwtVerifier,
): Promise<AuthenticatedUser | null> {
    if (!authorization?.startsWith("Bearer ")) {
        return null;
    }

    const token = authorization.slice("Bearer ".length).trim();
    if (!token) {
        return null;
    }

    const payload = await verifyToken(token);
    if (!payload) {
        return null;
    }

    const session = await prisma.authSession.findFirst({
        where: {
            id: payload.sid,
            userId: payload.sub,
            revokedAt: null,
            expiredAt: { gt: new Date() },
        },
        select: { id: true },
    });
    if (!session) {
        return null;
    }

    return { id: payload.sub, email: payload.email, sessionId: payload.sid };
}

