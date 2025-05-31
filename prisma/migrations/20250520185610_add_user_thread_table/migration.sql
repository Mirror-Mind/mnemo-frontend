/*
  Warnings:

  - You are about to drop the column `isWhatsApp` on the `user_thread` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `user_thread` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "user_thread_threadId_idx";

-- DropIndex
DROP INDEX "user_thread_threadId_key";

-- DropIndex
DROP INDEX "user_thread_userId_isWhatsApp_idx";

-- AlterTable
ALTER TABLE "user_thread" DROP COLUMN "isWhatsApp";

-- CreateIndex
CREATE UNIQUE INDEX "user_thread_userId_key" ON "user_thread"("userId");
