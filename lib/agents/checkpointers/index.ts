import { PrismaClient } from "@prisma/client";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";

const prisma = new PrismaClient();

// Create a singleton instance of the PostgresSaver for thread persistence
const memorySaver = PostgresSaver.fromConnString(process.env.DATABASE_URL || "");

/**
 * Get or create a thread ID for a user from the database
 * @param userId The user's unique identifier
 * @returns A unique thread ID that can be used with LangGraph
 */
async function getOrCreateThreadId(userId: string): Promise<string> {
  try {
    // Check if we have a thread ID for this user
    let userThread = await prisma.userThread.findUnique({
      where: { userId }
    });

    if (userThread) {
      return userThread.threadId;
    }

    // Create a new thread ID if none exists
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 10);
    const threadId = `thread_${userId}_${timestamp}_${randomId}`;

    // Store the thread ID in the database
    userThread = await prisma.userThread.create({
      data: {
        userId,
        threadId
      }
    });

    return threadId;
  } catch (error) {
    console.error("[CHECKPOINTER] Error in getOrCreateThreadId:", error);
    throw error;
  }
}

/**
 * Get a configuration object for LangGraph with thread_id
 * @param userId The user's unique identifier
 * @returns Configuration object for LangGraph thread persistence
 */
async function getThreadConfig(userId: string) {
  const threadId = await getOrCreateThreadId(userId);
  
  return {
    configurable: {
      thread_id: threadId,
    },
  };
}

// Initialize the checkpointer tables
memorySaver.setup().catch(error => {
  console.error("[CHECKPOINTER] Error setting up PostgresSaver:", error);
});

export {
  memorySaver,
  getOrCreateThreadId,
  getThreadConfig,
}; 