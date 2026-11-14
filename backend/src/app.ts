import { Elysia } from "elysia";
import { MAX_REQUEST_BODY_BYTES } from "./config/constants";
import { healthController } from "./modules/health/health.controller";
import { authController } from "./modules/auth/auth.controller";
import { serversController } from "./modules/servers/servers.controller";
import { presetsController } from "./modules/presets/presets.controller";
import { auditController } from "./modules/audit/audit.controller";
import { modsController } from "./modules/mods/mods.controller";
import { corsPlugin } from "./plugins/cors";

export const app = new Elysia({ serve: { maxRequestBodySize: MAX_REQUEST_BODY_BYTES } })
    .use(corsPlugin)
    .use(healthController)
    .use(authController)
    .use(serversController)
    .use(presetsController)
    .use(auditController)
    .use(modsController);
    
    
export type App = typeof app;
