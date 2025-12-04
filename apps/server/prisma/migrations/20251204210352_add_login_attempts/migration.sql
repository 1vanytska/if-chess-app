-- AlterTable
ALTER TABLE "User" ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "LoginAttempt" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "email" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LoginAttempt" ADD CONSTRAINT "LoginAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
