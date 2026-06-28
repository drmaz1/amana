-- Recreate VehicleType (SEDAN/VAN/BUS -> SEDAN/SUV/GMC); map VAN/BUS -> GMC.
BEGIN;
CREATE TYPE "VehicleType_new" AS ENUM ('SEDAN', 'SUV', 'GMC');
ALTER TABLE "Vehicle" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Vehicle" ALTER COLUMN "type" TYPE "VehicleType_new" USING (
  CASE "type"::text
    WHEN 'VAN' THEN 'GMC'
    WHEN 'BUS' THEN 'GMC'
    ELSE "type"::text
  END::"VehicleType_new"
);
ALTER TYPE "VehicleType" RENAME TO "VehicleType_old";
ALTER TYPE "VehicleType_new" RENAME TO "VehicleType";
DROP TYPE "VehicleType_old";
ALTER TABLE "Vehicle" ALTER COLUMN "type" SET DEFAULT 'SEDAN';
COMMIT;

-- Per-seat prices.
ALTER TABLE "Trip" ADD COLUMN "seatPrices" INTEGER[] DEFAULT ARRAY[]::INTEGER[];
