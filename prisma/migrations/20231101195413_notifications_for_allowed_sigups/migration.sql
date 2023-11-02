-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "allowedSignupsId" TEXT;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_allowedSignupsId_fkey" FOREIGN KEY ("allowedSignupsId") REFERENCES "AllowedSignups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
