-- CreateTable
CREATE TABLE "lang_graph_state" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "state" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lang_graph_state_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lang_graph_state_threadId_idx" ON "lang_graph_state"("threadId");
