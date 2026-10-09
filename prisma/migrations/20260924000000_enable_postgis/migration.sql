-- Habilitar PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Agregar la nueva columna permitiendo nulos temporalmente
ALTER TABLE "Report" ADD COLUMN "location" geometry(Point, 4326);

-- Migrar los datos existentes (Convirtiendo lat/lng a un punto geométrico)
UPDATE "Report" SET "location" = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326);

-- Borrar las columnas viejas
ALTER TABLE "Report" DROP COLUMN "latitude";
ALTER TABLE "Report" DROP COLUMN "longitude";

-- Crear un índice espacial para optimizar las búsquedas
CREATE INDEX "Report_location_idx" ON "Report" USING GIST ("location");
