-- Let session presets store the same track variant and car list as server configurations.
ALTER TABLE "session_presets" ADD COLUMN "track_config" TEXT NOT NULL DEFAULT 'GP';
ALTER TABLE "server_configs" ADD COLUMN "practice_minutes" INTEGER NOT NULL DEFAULT 20;
ALTER TABLE "server_configs" ADD COLUMN "qualifying_minutes" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "server_configs" ADD COLUMN "race_laps" INTEGER NOT NULL DEFAULT 5;

CREATE TABLE "session_preset_cars" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "preset_id" TEXT NOT NULL,
    "car" TEXT NOT NULL,
    CONSTRAINT "session_preset_cars_preset_id_fkey" FOREIGN KEY ("preset_id") REFERENCES "session_presets" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "session_preset_cars_preset_id_car_key" ON "session_preset_cars"("preset_id", "car");
CREATE INDEX "session_preset_cars_preset_id_idx" ON "session_preset_cars"("preset_id");
