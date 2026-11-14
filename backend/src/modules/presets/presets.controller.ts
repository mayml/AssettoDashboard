import { Elysia, t } from "elysia";
import { jwtPlugin } from "../../plugins/jwt";
import { getAuthenticatedUser } from "../auth/auth.guard";
import { presetsService } from "./presets.service";

const presetFields = {
    name: t.String({ minLength: 1, maxLength: 32 }),
    track: t.String({ minLength: 1, maxLength: 100 }),
    trackConfig: t.String({ minLength: 1, maxLength: 60 }),
    mode: t.String({ minLength: 1, maxLength: 40 }),
    slots: t.Integer({ minimum: 1, maximum: 64 }),
    cars: t.Array(t.String({ minLength: 1, maxLength: 60 }), { minItems: 1, maxItems: 12 }),
    practiceMinutes: t.Integer({ minimum: 0, maximum: 300 }),
    qualifyingMinutes: t.Integer({ minimum: 0, maximum: 120 }),
    raceLaps: t.Integer({ minimum: 1, maximum: 200 }),
    weather: t.String({ minLength: 1, maxLength: 40 }),
    timeOfDay: t.String({ minLength: 1, maxLength: 10 }),
};

export const presetsController = new Elysia({ name: "presets" })
    .use(jwtPlugin)
    .get("/presets", async ({ headers, jwt, set }) => {
        const user = await getAuthenticatedUser(headers.authorization, (token) => jwt.verify(token));
        if (!user) {
            set.status = 401;
            return { message: "Нужен действующий access token" };
        }

        const data = await presetsService.list(user.id);
        return { data, total: data.length };
    })
    .post("/presets", async ({ headers, body, jwt, set }) => {
        const user = await getAuthenticatedUser(headers.authorization, (token) => jwt.verify(token));
        if (!user) {
            set.status = 401;
            return { message: "Нужен действующий access token" };
        }

        set.status = 201;
        return { data: await presetsService.create(user.id, body) };
    }, { body: t.Object(presetFields) })
    .patch("/presets/:id", async ({ headers, params, body, jwt, set }) => {
        const user = await getAuthenticatedUser(headers.authorization, (token) => jwt.verify(token));
        if (!user) {
            set.status = 401;
            return { message: "Нужен действующий access token" };
        }

        const data = await presetsService.update(user.id, params.id, body);
        if (!data) {
            set.status = 404;
            return { message: "Пресет не найден" };
        }
        return { data };
    }, {
        params: t.Object({ id: t.String({ minLength: 1 }) }),
        body: t.Object({
            name: t.Optional(presetFields.name),
            track: t.Optional(presetFields.track),
            trackConfig: t.Optional(presetFields.trackConfig),
            mode: t.Optional(presetFields.mode),
            slots: t.Optional(presetFields.slots),
            cars: t.Optional(presetFields.cars),
            practiceMinutes: t.Optional(presetFields.practiceMinutes),
            qualifyingMinutes: t.Optional(presetFields.qualifyingMinutes),
            raceLaps: t.Optional(presetFields.raceLaps),
            weather: t.Optional(presetFields.weather),
            timeOfDay: t.Optional(presetFields.timeOfDay),
        }),
    })
    .delete("/presets/:id", async ({ headers, params, jwt, set }) => {
        const user = await getAuthenticatedUser(headers.authorization, (token) => jwt.verify(token));
        if (!user) {
            set.status = 401;
            return { message: "Нужен действующий access token" };
        }

        const removed = await presetsService.remove(user.id, params.id);
        if (!removed) {
            set.status = 404;
            return { message: "Пресет не найден" };
        }
        set.status = 204;
    }, { params: t.Object({ id: t.String({ minLength: 1 }) }) });
