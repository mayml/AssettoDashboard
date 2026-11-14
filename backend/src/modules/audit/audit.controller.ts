import { Elysia } from "elysia";
import { jwtPlugin } from "../../plugins/jwt";
import { getAuthenticatedUser } from "../auth/auth.guard";
import { auditService } from "./audit.service";

export const auditController = new Elysia({ name: "activity" })
    .use(jwtPlugin)
    .get("/activity", async ({ headers, jwt, set }) => {
        const user = await getAuthenticatedUser(headers.authorization, (token) => jwt.verify(token));
        if (!user) {
            set.status = 401;
            return { message: "Нужен действующий access token" };
        }

        const data = await auditService.list(user.id);
        return { data, total: data.length };
    });
