import { Elysia } from "elysia";
import { MAX_REQUEST_BODY_BYTES } from "./config/constants";
import { healthController } from "./modules/health/health.controller";
import { authController } from "./modules/auth/auth.controller";
import { corsPlugin } from "./plugins/cors";

export const app = new Elysia({ serve: { maxRequestBodySize: MAX_REQUEST_BODY_BYTES } })
    .use(corsPlugin)
    .use(healthController)
    .use(authController);
    
    
export type App = typeof app;