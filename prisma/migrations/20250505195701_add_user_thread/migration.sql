-- CreateTable
CREATE TABLE "user_thread" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isWhatsApp" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_thread_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_thread_threadId_key" ON "user_thread"("threadId");

-- CreateIndex
CREATE INDEX "user_thread_userId_isWhatsApp_idx" ON "user_thread"("userId", "isWhatsApp");

-- CreateIndex
CREATE INDEX "user_thread_threadId_idx" ON "user_thread"("threadId");

-- AddForeignKey
ALTER TABLE "user_thread" ADD CONSTRAINT "user_thread_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
