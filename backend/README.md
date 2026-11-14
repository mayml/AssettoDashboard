# Backend

API написан на Elysia и использует Prisma с SQLite.

Запуск из корня проекта:

```bash
bun run --filter @assetto-dash/backend dev
```

Нужны переменные `APP_PORT`, `DATABASE_URL` и `JWT_ACCESS_SECRET` в `backend/.env`.

Все защищённые маршруты требуют заголовок `Authorization: Bearer <accessToken>`.

Аккаунт:

- `POST /auth/register` — создать пользователя;
- `POST /auth/login` — получить access и refresh токены;
- `POST /auth/refresh` — обновить пару токенов;
- `POST /auth/logout` — отозвать refresh-токен;
- `GET /auth/me` — получить свой профиль;
- `POST /auth/password` — сменить пароль; остальные входы будут завершены;
- `GET /auth/sessions` — посмотреть активные входы;
- `DELETE /auth/sessions/:id` — завершить другой вход.

Данные аккаунта и панели:

- `GET/POST /servers`, `PATCH/DELETE /servers/:id` — CRUD конфигураций: трасса и её вариант, машины, режим, места, длительность сессии, погода и время суток;
- `GET/POST /presets`, `PATCH/DELETE /presets/:id` — CRUD пресетов сессий с машинами и вариантом трассы;
- `GET /mods`, `POST /mods`, `DELETE /mods/:id` — список, загрузка архива и удаление мода;
- `GET /activity` — последние 100 действий текущего аккаунта.

Новые таблицы создаются отдельной добавочной миграцией. Сначала сгенерируй Prisma Client и примени миграцию из корня репозитория:

```bash
bun run --filter @assetto-dash/backend prisma:generate
bun run --filter @assetto-dash/backend migrate:deploy
```

Архивы модов хранятся в `backend/data/mods/`; поддерживаются ZIP, 7Z и RAR до 50 МБ. Backend не распаковывает архивы и не устанавливает их в Assetto Corsa.

В интерфейсе подключены профиль, сессии аккаунта, сохранённые конфигурации, пресеты, загрузка архивов модов и журнал действий. Игроки, результаты, установка модов и запуск настоящего процесса Assetto Corsa остаются демо-функциями.

## Как устроен код

- `*.controller.ts` описывает URL, проверяет входные данные и вызывает сервис.
- `*.service.ts` выполняет работу с Prisma и применяет правила приложения.
- `auth.guard.ts` проверяет access token и убеждается, что связанный вход ещё активен.
- `prisma/schema.prisma` описывает таблицы, а `prisma/migrations/` — изменения базы по шагам.
- На фронтенде `services/api/` делает HTTP-запросы, а страницы показывают результат и состояния загрузки.

Например, сохранение сервера идёт так: страница «Серверы» → `services/api/serverConfigs.ts` → `servers.controller.ts` → `servers.service.ts` → таблица `server_configs`.

У конфигурации и пресета список машин хранится в отдельных связанных таблицах: `server_config_cars` и `session_preset_cars`. Одна запись может содержать несколько машин. Кнопка «Создать конфигурацию» на странице пресетов переносит сохранённые параметры в форму сервера. Список доступных машин и вариантов трасс пока задан в `frontend/app/data/serverFormOptions.ts`; позже его можно заменить каталогом из API.
