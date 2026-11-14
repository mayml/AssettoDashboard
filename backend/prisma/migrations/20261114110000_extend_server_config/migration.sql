-- Add track variants and basic weather/time settings to saved server configurations.
ALTER TABLE "server_configs" ADD COLUMN "track_config" TEXT NOT NULL DEFAULT 'GP';
ALTER TABLE "server_configs" ADD COLUMN "weather" TEXT NOT NULL DEFAULT 'Солнечно';
ALTER TABLE "server_configs" ADD COLUMN "time_of_day" TEXT NOT NULL DEFAULT '14:00';

-- Keep selected cars in a separate table so one configuration can have several cars.
CREATE TABLE "server_config_cars" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "server_config_id" TEXT NOT NULL,
    "car" TEXT NOT NULL,
    CONSTRAINT "server_config_cars_server_config_id_fkey" FOREIGN KEY ("server_config_id") REFERENCES "server_configs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "server_config_cars_server_config_id_car_key" ON "server_config_cars"("server_config_id", "car");
CREATE INDEX "server_config_cars_server_config_id_idx" ON "server_config_cars"("server_config_id");
