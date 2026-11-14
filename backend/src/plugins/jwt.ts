import { jwt } from "@elysia/jwt";
import { t } from "elysia";
import { env } from "../config/env";

export const jwtPlugin = jwt({
    name: "jwt",
    secret: env.jwtAccessSecret,
    exp: "15m",
    schema: t.Object({
        sub: t.String(),
        email: t.String(),
        sid: t.String(),
    })
}) 
