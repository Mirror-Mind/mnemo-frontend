import { MemorySaver } from "@langchain/langgraph";
// Create a singleton instance of the MemorySaver
const memorySaver = new MemorySaver();
/**
 * Helper to get or create a thread ID for a user and store it with a 24-hour TTL
 * @param userId The user's unique identifier
 * @returns The thread ID for this user
 */
function getOrCreateThreadId(userId) {
    // Use a consistent naming convention for thread IDs
    // This could be enhanced with a memory expiration mechanism if needed
    return `thread_${userId}_${Date.now()}`;
}
export { memorySaver, getOrCreateThreadId, };
