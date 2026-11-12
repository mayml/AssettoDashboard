import { Elysia } from "elysia";

export const healthController = new Elysia({ name: "health" })
    .get("/health", async () => {
        return {
            status: "ОКЕЙ"
        }
    })