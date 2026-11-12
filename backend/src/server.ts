import { app } from "./app";
import { env } from "./config/env";

async function start() {
    app.listen(env.appPort);
    console.log(`API запущен | ПОРТ : 8000`);
}

start().catch((error) => {
    console.error(`Не удалось запустить API : ${error}`);
    process.exit(1);
})