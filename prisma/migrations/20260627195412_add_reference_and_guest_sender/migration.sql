-- DropForeignKey
ALTER TABLE "Parcel" DROP CONSTRAINT "Parcel_senderId_fkey";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "reference" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Parcel" ADD COLUMN     "reference" TEXT NOT NULL,
ADD COLUMN     "senderName" TEXT,
ALTER COLUMN "senderId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Booking_reference_key" ON "Booking"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Parcel_reference_key" ON "Parcel"("reference");

-- AddForeignKey
ALTER TABLE "Parcel" ADD CONSTRAINT "Parcel_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

