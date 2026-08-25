-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "capacityAdults" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "capacityChildren" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'room',
ADD COLUMN     "sizeSqm" INTEGER;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "description" TEXT;
