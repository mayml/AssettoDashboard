# Backend

API написан на Elysia и использует Prisma с SQLite.

Запуск из корня проекта:

```bash
bun run --filter @assetto-dash/backend dev
```

Нужны переменные `APP_PORT`, `DATABASE_URL` и `JWT_ACCESS_SECRET` в `backend/.env`.

Авторизация доступна по адресам:

- `POST /auth/register` — создать пользователя;
- `POST /auth/login` — получить access и refresh токены;
- `POST /auth/refresh` — обновить пару токенов;
- `POST /auth/logout` — отозвать refresh-токен.

На фронтенде подключена только авторизация. Остальные сущности панели пока используют моковые данные.
