import { tool } from '@langchain/core/tools';
import { memory } from '../agentUtils';
import { z } from 'zod';


// Search memories tool
export const getMemorySearchTool = (getUserId: () => string) => tool(
  async (input: { query: string; limit?: number; filters?: Record<string, unknown> }) => {
    try {
      const userId = getUserId();
      console.log(`[MEMORY SEARCH] Searching memories for user: ${userId}, query: "${input.query}"`);
      
      const results = await memory.search(
        input.query, 
        { 
          userId, 
          limit: input.limit || 5,
          filters: input.filters
        }
      );
      
      if (!results?.results || results.results.length === 0) {
        return "No relevant memories found for your query.";
      }
      
      const memories = results.results.map((result: { memory: string; score?: number }, index: number) => 
        `${index + 1}. ${result.memory} (Score: ${result.score?.toFixed(2) || 'N/A'})`
      ).join('\n');
      
      console.log(`[MEMORY SEARCH] Found ${results.results.length} memories for user: ${userId}`);
      return `Found ${results.results.length} relevant memories:\n${memories}`;
    } catch (error) {
      console.error('[MEMORY SEARCH] Error searching memories:', error);
      return `Error searching memories: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
  {
    name: "search_memories",
    description: "Search through stored memories to find relevant information from past conversations. Use this when you need to recall information about the user or previous interactions.",
    schema: z.object({
      query: z.string().describe("The search query to find relevant memories"),
      limit: z.number().optional().describe("Maximum number of memories to return (default: 5)"),
      filters: z.record(z.unknown()).optional().describe("Optional filters to apply to the search")
    })
  }
);

// Add memory tool
export const getMemoryAddTool = (getUserId: () => string) => tool(
  async (input: { content: string; metadata?: Record<string, unknown> }) => {
    try {
      const userId = getUserId();
      console.log(`[MEMORY ADD] Adding memory for user: ${userId}`);
      
      const messages = [
        {
          role: "user",
          content: input.content
        }
      ];
      
      await memory.add(messages, { 
        userId,
        metadata: input.metadata
      });
      
      console.log(`[MEMORY ADD] Successfully added memory for user: ${userId}`);
      return `Successfully stored the information: "${input.content}"`;
    } catch (error) {
      console.error('[MEMORY ADD] Error adding memory:', error);
      return `Error storing memory: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
  {
    name: "add_memory",
    description: "Store important information from the conversation for future reference. Use this when the user shares important details you should remember.",
    schema: z.object({
      content: z.string().describe("The information to store in memory"),
      metadata: z.record(z.unknown()).optional().describe("Optional metadata to associate with the memory")
    })
  }
);

// Get all memories tool
export const getMemoryGetAllTool = (getUserId: () => string) => tool(
  async (input: { limit?: number }) => {
    try {
      const userId = getUserId();
      console.log(`[MEMORY GET ALL] Retrieving all memories for user: ${userId}`);
      
      const results = await memory.getAll({ 
        userId,
        limit: input.limit || 10
      });
      
      if (!results?.results || results.results.length === 0) {
        return "No memories found for this user.";
      }
      
      const memories = results.results.map((result: any, index: number) => 
        `${index + 1}. ${result.memory} ${result.created_at ? `(Created: ${new Date(result.created_at).toLocaleDateString()})` : ''}`
      ).join('\n');
      
      console.log(`[MEMORY GET ALL] Retrieved ${results.results.length} memories for user: ${userId}`);
      return `Found ${results.results.length} stored memories:\n${memories}`;
    } catch (error) {
      console.error('[MEMORY GET ALL] Error retrieving memories:', error);
      return `Error retrieving memories: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
  {
    name: "get_all_memories",
    description: "Retrieve all stored memories for the current user. Use this to review what information has been stored about the user.",
    schema: z.object({
      limit: z.number().optional().describe("Maximum number of memories to return (default: 10)")
    })
  }
);

// Delete memory tool
export const getMemoryDeleteTool = (getUserId: () => string) => tool(
  async (input: { memoryId: string }) => {
    try {
      const userId = getUserId();
      console.log(`[MEMORY DELETE] Deleting memory ${input.memoryId} for user: ${userId}`);
      
      await memory.delete(input.memoryId);
      
      console.log(`[MEMORY DELETE] Successfully deleted memory ${input.memoryId} for user: ${userId}`);
      return `Successfully deleted the memory.`;
    } catch (error) {
      console.error('[MEMORY DELETE] Error deleting memory:', error);
      return `Error deleting memory: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
  {
    name: "delete_memory",
    description: "Delete a specific memory by its ID. Use this when you need to remove outdated or incorrect information.",
    schema: z.object({
      memoryId: z.string().describe("The ID of the memory to delete")
    })
  }
);

// Update memory tool  
export const getMemoryUpdateTool = (getUserId: () => string) => tool(
  async (input: { memoryId: string; newContent: string }) => {
    try {
      const userId = getUserId();
      console.log(`[MEMORY UPDATE] Updating memory ${input.memoryId} for user: ${userId}`);
      
      await memory.update(input.memoryId, input.newContent);
      
      console.log(`[MEMORY UPDATE] Successfully updated memory ${input.memoryId} for user: ${userId}`);
      return `Successfully updated the memory with new content: "${input.newContent}"`;
    } catch (error) {
      console.error('[MEMORY UPDATE] Error updating memory:', error);
      return `Error updating memory: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  },
  {
    name: "update_memory",
    description: "Update an existing memory with new content. Use this when you need to correct or enhance stored information.",
    schema: z.object({
      memoryId: z.string().describe("The ID of the memory to update"),
      newContent: z.string().describe("The new content to replace the existing memory")
    })
  }
); 