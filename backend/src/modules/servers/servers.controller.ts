import { Elysia, t } from "elysia";
import { jwtPlugin } from "../../plugins/jwt";
import { getAuthenticatedUser } from "../auth/auth.guard";
import { serversService } from "./servers.service";

export const serversController = new Elysia({ name: "servers" })
    .use(jwtPlugin)
    .get("/servers", async ({ headers, jwt, set }) => {
        const user = await getAuthenticatedUser(headers.authorization, (token) => jwt.verify(token));
        if (!user) {
            set.status = 401;
            return { message: "Нужен действующий access token" };
        }

        const data = await serversService.list(user.id);
        return { data, total: data.length };
    })
    .post("/servers", async ({ headers, body, jwt, set }) => {
        const user = await getAuthenticatedUser(headers.authorization, (token) => jwt.verify(token));
        if (!user) {
            set.status = 401;
            return { message: "Нужен действующий access token" };
        }

        set.status = 201;
        return { data: await serversService.create(user.id, body) };
    }, {
        body: t.Object({
            name: t.String({ minLength: 1, maxLength: 32 }),
            track: t.String({ minLength: 1, maxLength: 100 }),
            trackConfig: t.String({ minLength: 1, maxLength: 60 }),
            mode: t.String({ minLength: 1, maxLength: 40 }),
            slots: t.Integer({ minimum: 1, maximum: 64 }),
            practiceMinutes: t.Integer({ minimum: 0, maximum: 300 }),
            qualifyingMinutes: t.Integer({ minimum: 0, maximum: 120 }),
            raceLaps: t.Integer({ minimum: 1, maximum: 200 }),
            cars: t.Array(t.String({ minLength: 1, maxLength: 60 }), { minItems: 1, maxItems: 12 }),
            weather: t.String({ minLength: 1, maxLength: 40 }),
            timeOfDay: t.String({ minLength: 1, maxLength: 5 }),
        }),
    })
    .patch("/servers/:id", async ({ headers, params, body, jwt, set }) => {
        const user = await getAuthenticatedUser(headers.authorization, (token) => jwt.verify(token));
        if (!user) {
            set.status = 401;
            return { message: "Нужен действующий access token" };
        }

        const data = await serversService.update(user.id, params.id, body);
        if (!data) {
            set.status = 404;
            return { message: "Конфигурация сервера не найдена" };
        }
        return { data };
    }, {
        params: t.Object({ id: t.String({ minLength: 1 }) }),
        body: t.Object({
            name: t.Optional(t.String({ minLength: 1, maxLength: 32 })),
            track: t.Optional(t.String({ minLength: 1, maxLength: 100 })),
            trackConfig: t.Optional(t.String({ minLength: 1, maxLength: 60 })),
            mode: t.Optional(t.String({ minLength: 1, maxLength: 40 })),
            slots: t.Optional(t.Integer({ minimum: 1, maximum: 64 })),
            practiceMinutes: t.Optional(t.Integer({ minimum: 0, maximum: 300 })),
            qualifyingMinutes: t.Optional(t.Integer({ minimum: 0, maximum: 120 })),
            raceLaps: t.Optional(t.Integer({ minimum: 1, maximum: 200 })),
            cars: t.Optional(t.Array(t.String({ minLength: 1, maxLength: 60 }), { minItems: 1, maxItems: 12 })),
            weather: t.Optional(t.String({ minLength: 1, maxLength: 40 })),
            timeOfDay: t.Optional(t.String({ minLength: 1, maxLength: 5 })),
        }),
    })
    .delete("/servers/:id", async ({ headers, params, jwt, set }) => {
        const user = await getAuthenticatedUser(headers.authorization, (token) => jwt.verify(token));
        if (!user) {
            set.status = 401;
            return { message: "Нужен действующий access token" };
        }

        const removed = await serversService.remove(user.id, params.id);
        if (!removed) {
            set.status = 404;
            return { message: "Конфигурация сервера не найдена" };
        }
        set.status = 204;
    }, { params: t.Object({ id: t.String({ minLength: 1 }) }) });
