import { Elysia, t } from "elysia";
import { jwtPlugin } from "../../plugins/jwt";
import { getAuthenticatedUser } from "../auth/auth.guard";
import { ModUploadError, modsService } from "./mods.service";

export const modsController = new Elysia({ name: "mods" })
    .use(jwtPlugin)
    .get("/mods", async ({ headers, jwt, set }) => {
        const user = await getAuthenticatedUser(headers.authorization, (token) => jwt.verify(token));
        if (!user) {
            set.status = 401;
            return { message: "Нужен действующий access token" };
        }

        const data = await modsService.list(user.id);
        return { data, total: data.length };
    })
    .post("/mods", async ({ headers, body, jwt, set }) => {
        const user = await getAuthenticatedUser(headers.authorization, (token) => jwt.verify(token));
        if (!user) {
            set.status = 401;
            return { message: "Нужен действующий access token" };
        }

        try {
            const data = await modsService.upload(user.id, body.file);
            set.status = 201;
            return { data };
        } catch (error) {
            if (error instanceof ModUploadError) {
                set.status = error.statusCode;
                return { message: error.message };
            }
            throw error;
        }
    }, { body: t.Object({ file: t.File() }) })
    .delete("/mods/:id", async ({ headers, params, jwt, set }) => {
        const user = await getAuthenticatedUser(headers.authorization, (token) => jwt.verify(token));
        if (!user) {
            set.status = 401;
            return { message: "Нужен действующий access token" };
        }

        const removed = await modsService.remove(user.id, params.id);
        if (!removed) {
            set.status = 404;
            return { message: "Мод не найден" };
        }
        set.status = 204;
    }, { params: t.Object({ id: t.String({ minLength: 1 }) }) });
