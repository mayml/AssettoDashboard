import { Elysia, t } from "elysia";
import { jwtPlugin } from "../../plugins/jwt";
import { authService } from "./auth.service";
import { Prisma } from "@prisma/client";
import { getAuthenticatedUser } from "./auth.guard";

export const authController = new Elysia({ name: "auth" , prefix: "auth"})
    .use(jwtPlugin)
    .post("/register", async ({ body, set }) => {
        try{
            const user = await authService.create(body.email, body.password)
            set.status = 201;
            return user;
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                set.status = 409;
                return { message: "Пользователь с таким email уже существует" };
            }
            throw error;
        }
    }, {
        body: t.Object({
            email: t.String({ format: "email", maxLength: 320 }),
            password: t.String({ minLength: 1, maxLength: 200 }),
        })
    })
    .post("/login", async ({ body, set, jwt }) => {
        const result = await authService.login(body.email, body.password);

        if (!result) {
            set.status = 401;
            return { message: "Неверный email или пароль" };
        }
        const token = await jwt.sign({
            sub: result.user.id,
            email: result.user.email,
            sid: result.sessionId,
        });

        return {
            accessToken: token,
            refreshToken: result.refreshToken,
            user: { id: result.user.id, email: result.user.email },
        };
    }, {
        body: t.Object({
            email: t.String({ format: "email", maxLength: 320 }),
            password: t.String({ minLength: 1, maxLength: 200 }),
        }),
    })
    .post("/refresh", async ({ body, set, jwt }) => {
        const result = await authService.refresh(body.refreshToken);

        if (!result) {
            set.status = 401;
            return { message: "Недействительный refresh token" };
        }

        const token = await jwt.sign({
            sub: result.user.id,
            email: result.user.email,
            sid: result.sessionId,
        });

        return {
            accessToken: token,
            refreshToken: result.refreshToken,
            user: { id: result.user.id, email: result.user.email},
        };
    }, {
        body: t.Object({ refreshToken: t.String({ minLength: 1 }) }),
    })
    .post("/logout", async ({ body, set }) => {
            await authService.logout(body.refreshToken);
            set.status = 204;
        },
        {
            body: t.Object({ refreshToken: t.String({ minLength: 1 }) }),
        },
    )
    .get("/me", async ({ headers, jwt, set }) => {
        const user = await getAuthenticatedUser(headers.authorization, (token) => jwt.verify(token));
        if (!user) {
            set.status = 401;
            return { message: "Нужен действующий access token" };
        }

        const profile = await authService.getProfile(user.id);
        if (!profile) {
            set.status = 404;
            return { message: "Аккаунт не найден" };
        }

        return profile;
    })
    .post("/password", async ({ headers, body, jwt, set }) => {
        const user = await getAuthenticatedUser(headers.authorization, (token) => jwt.verify(token));
        if (!user) {
            set.status = 401;
            return { message: "Нужен действующий access token" };
        }

        const changed = await authService.changePassword(
            user.id,
            body.currentPassword,
            body.newPassword,
            user.sessionId,
        );
        if (!changed) {
            set.status = 400;
            return { message: "Текущий пароль указан неверно" };
        }

        return { message: "Пароль изменён" };
    }, {
        body: t.Object({
            currentPassword: t.String({ minLength: 1, maxLength: 200 }),
            newPassword: t.String({ minLength: 8, maxLength: 200 }),
        }),
    })
    .get("/sessions", async ({ headers, jwt, set }) => {
        const user = await getAuthenticatedUser(headers.authorization, (token) => jwt.verify(token));
        if (!user) {
            set.status = 401;
            return { message: "Нужен действующий access token" };
        }

        return { data: await authService.listSessions(user.id, user.sessionId) };
    })
    .delete("/sessions/:id", async ({ headers, params, jwt, set }) => {
        const user = await getAuthenticatedUser(headers.authorization, (token) => jwt.verify(token));
        if (!user) {
            set.status = 401;
            return { message: "Нужен действующий access token" };
        }

        if (params.id === user.sessionId) {
            set.status = 400;
            return { message: "Чтобы завершить текущий вход, используй кнопку выхода" };
        }

        const revoked = await authService.revokeSession(user.id, params.id);
        if (!revoked) {
            set.status = 404;
            return { message: "Активный вход не найден" };
        }

        set.status = 204;
    }, { params: t.Object({ id: t.String({ minLength: 1 }) }) });
