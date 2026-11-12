import { cors } from "@elysiajs/cors";

export const corsPlugin = cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: false,
});