"use strict";

/**
 * Production implementation of the LangGraph memory checkpointer system
 */

/**
 * MemorySaver class mimics the LangGraph MemorySaver
 * This is a simplified version for compatibility with the codebase
 */
class MemorySaver {
  constructor() {
    this.checkpoints = new Map();
  }

  /**
   * Get a checkpoint for a thread
   * @param {Object} config - Configuration with thread_id
   * @returns {Promise<any>} The checkpoint data or undefined
   */
  async get(config) {
    const threadId = config?.configurable?.thread_id;
    if (!threadId) return undefined;
    
    return this.checkpoints.get(threadId);
  }
  
  /**
   * Store a checkpoint for a thread
   * @param {Object} config - Configuration with thread_id
   * @param {any} checkpoint - The checkpoint data
   * @returns {Promise<void>}
   */
  async put(config, checkpoint) {
    const threadId = config?.configurable?.thread_id;
    if (!threadId) return;
    
    this.checkpoints.set(threadId, checkpoint);
    
    // Set expiration for the thread (24 hours)
    setTimeout(() => {
      this.checkpoints.delete(threadId);
    }, 24 * 60 * 60 * 1000);
  }
  
  /**
   * Delete a checkpoint for a thread
   * @param {Object} config - Configuration with thread_id
   * @returns {Promise<void>}
   */
  async delete(config) {
    const threadId = config?.configurable?.thread_id;
    if (!threadId) return;
    
    this.checkpoints.delete(threadId);
  }
  
  /**
   * List available checkpoints
   * @returns {Promise<string[]>} List of checkpoint IDs
   */
  async list() {
    return Array.from(this.checkpoints.keys());
  }
}

/**
 * Generate a unique thread ID for a user
 * @param {string} userId - The user's unique identifier
 * @returns {string} A unique thread ID
 */
function getOrCreateThreadId(userId) {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 10);
  return `thread_${userId}_${timestamp}_${randomId}`;
}

/**
 * Get a configuration object for LangGraph with thread_id
 * @param {string} userId - The user's unique identifier
 * @returns {Object} Configuration object for LangGraph thread persistence
 */
function getThreadConfig(userId) {
  const threadId = getOrCreateThreadId(userId);
  
  return {
    configurable: {
      thread_id: threadId,
    },
  };
}

// Create singleton instance of MemorySaver
const memorySaver = new MemorySaver();

module.exports = {
  memorySaver,
  getOrCreateThreadId,
  getThreadConfig
}; 