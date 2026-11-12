/*
  Warnings:

  - You are about to drop the column `expires_at` on the `auth_sessions` table. All the data in the column will be lost.
  - Added the required column `expired_at` to the `auth_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_auth_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expired_at" DATETIME NOT NULL,
    "revoke_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "auth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_auth_sessions" ("created_at", "id", "revoke_at", "token_hash", "user_id") SELECT "created_at", "id", "revoke_at", "token_hash", "user_id" FROM "auth_sessions";
DROP TABLE "auth_sessions";
ALTER TABLE "new_auth_sessions" RENAME TO "auth_sessions";
CREATE INDEX "auth_sessions_user_id_idx" ON "auth_sessions"("user_id");
CREATE INDEX "auth_sessions_expired_at_idx" ON "auth_sessions"("expired_at");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
