-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "actionData" JSONB;

-- CreateTable
CREATE TABLE "SuperEmails" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "SuperEmails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllowedSignups" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "businessName" TEXT,

    CONSTRAINT "AllowedSignups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SuperEmails_email_key" ON "SuperEmails"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AllowedSignups_email_key" ON "AllowedSignups"("email");
