import { Elysia, t } from "elysia";
import { jwtPlugin } from "../../plugins/jwt";
import { authService } from "./auth.service";
import { Prisma } from "@prisma/client";

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
    );