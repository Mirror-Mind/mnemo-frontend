import { Message as VercelChatMessage } from "ai";
import { createDataStreamResponse } from "ai";
import { AGENT_SYSTEM_PROMPT, WHATSAPP_SYSTEM_PROMPT } from "@/constants/prompts";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  AIMessage,
  BaseMessage,
  ChatMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { Memory } from "mem0ai/oss";
import { getCalendarListTool, getCalendarCreateTool, getCalendarDeleteTool } from './tools/googleCalendar';
import { getDocsListTool, getDocsContentTool } from './tools/googleDocs';
import { getGitHubPullRequestsListTool, getGitHubPullRequestDetailsTool } from './tools/github';
import { getGmailListTool, getGmailReadTool, getGmailSendTool } from './tools/gmail';
import { 
  getMemorySearchTool, 
  getMemoryAddTool, 
  getMemoryGetAllTool, 
  getMemoryDeleteTool, 
  getMemoryUpdateTool 
} from './tools/memory';
import { memorySaver, getThreadConfig } from './checkpointers/index';
import fs from 'fs';
import path from 'path';
import getUserDetails from "../get-user-details";
import prisma from "../prisma";

// Function to send WhatsApp typing indicator
const sendWhatsAppTypingIndicator = async (whatsAppMessageId: string) => {
  const apiVersion = "v22.0"; // Use a recent API version
  const phoneNumberId = process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !accessToken) {
    console.error("WhatsApp Business Phone Number ID or Access Token is not set in environment variables.");
    return;
  }
  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
  const payload = {
    messaging_product: "whatsapp",
    status: "read",
    message_id: whatsAppMessageId,
    typing_indicator: {
      "type": "text"
    }
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    const responseData = await response.json();
    if (responseData.success) {
      console.log(`[AGENT] Successfully sent typing indicator for message ID: ${whatsAppMessageId}`);
    } else {
      console.error(`[AGENT] Failed to send typing indicator for message ID: ${whatsAppMessageId}`, responseData);
    }
  } catch (error) {
    console.error(`[AGENT] Error sending typing indicator for message ID: ${whatsAppMessageId}`, error);
  }
};

// Define type for Mem0 messages to help with conversions
type Mem0Message = {
  role: string;
  content: string;
};

// Track the current user ID for the request context
let currentUserId = "default_user";

// Set the current user ID (should be called at the beginning of the request)
export const setCurrentUserId = (userId: string) => {
  currentUserId = userId;
  console.log(`[AGENT] Set current user ID to: ${userId}`);
};

// Get the current user ID
export const getCurrentUserId = () => {
  return currentUserId;
};

export const convertVercelMessageToLangChainMessage = (message: VercelChatMessage) => {
  if (message.role === "user") {
    return new HumanMessage(message.content);
  } else if (message.role === "assistant") {
    return new AIMessage(message.content);
  } else if (message.role === "system") {
    return new SystemMessage(message.content);
  } else {
    return new ChatMessage(message.content, message.role);
  }
};

export const convertLangChainMessageToVercelMessage = (message: BaseMessage) => {
  if (message._getType() === "human") {
    return { content: message.content, role: "user" };
  } else if (message._getType() === "ai") {
    return {
      content: message.content,
      role: "assistant",
      tool_calls: (message as AIMessage).tool_calls,
    };
  } else if (message._getType() === "system") {
    return { content: message.content, role: "system" };
  } else {
    return { content: message.content, role: message._getType() };
  }
};

// Convert LangChain messages to Mem0 format
export const convertToMem0Format = (messages: BaseMessage[]): Mem0Message[] => {
  return messages.map(msg => ({
    role: msg._getType() === "human" ? "user" : msg._getType() === "ai" ? "assistant" : msg._getType(),
    content: msg.content.toString()
  }));
};

// Initialize Mem0 memory with production Redis support
const createMemoryConfig = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const useRedis = process.env.USE_REDIS_MEM0 === "true" || isProduction;
  
  if (useRedis) {
    console.log("[MEM0] Using Redis vector store for production");
    return {
      embedder: {
        provider: "openai",
        config: {
          apiKey: process.env.OPENAI_API_KEY,
          model: "text-embedding-3-small",
        },
      },
      vectorStore: {
        provider: "redis",
        config: {
          collectionName: process.env.MEM0_COLLECTION_NAME || "orbia-memories",
          embeddingModelDims: 1536, // For text-embedding-3-small
          redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
          ...(process.env.REDIS_USERNAME && { username: process.env.REDIS_USERNAME }),
          ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
        },
      },
      llm: {
        provider: "openai",
        config: {
          apiKey: process.env.OPENAI_API_KEY,
          model: "gpt-4.1-mini-2025-04-14",
        },
      },
    };
  } else {
    console.log("[MEM0] Using in-memory vector store for development");
    return {
      embedder: {
        provider: "openai",
        config: {
          apiKey: process.env.OPENAI_API_KEY,
          model: "text-embedding-3-small",
        },
      },
      vectorStore: {
        provider: "memory",
        config: {
          collectionName: "custom-memories",
        },
      },
      llm: {
        provider: "openai",
        config: {
          apiKey: process.env.OPENAI_API_KEY,
          model: "gpt-4.1-mini-2025-04-14",
        },
      },
    };
  }
};

export const memory = new Memory(createMemoryConfig());

// Create LLM instances
const geminiChat = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-preview-05-20",
});

// Make an openai instance from langchain
const openaiChat = new ChatOpenAI({
  model: "gpt-4.1-mini-2025-04-14",
  apiKey: process.env.OPENAI_API_KEY,
  // @ts-ignore
  response_format: { type: "json_object" }
});

const structuredGeminiChat = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-preview-05-20",
  // @ts-ignore
  response_format: { type: "json_object" }
});

// Helper function to parse WhatsApp structured output
export const parseWhatsAppResponse = (content: string): string => {
  try {
    JSON.parse(content);
    return content;
  } catch (error) {
    const jsonMatch = content.match(/```(?:json)?\s*({[\s\S]*?})\s*```|({[\s\S]*?})/);
    if (jsonMatch) {
      const jsonContent = jsonMatch[1] || jsonMatch[2];
      try {
        JSON.parse(jsonContent);
        return jsonContent;
      } catch (extractError) {
        console.error("Error parsing extracted JSON:", extractError);
      }
    }
    console.error("Error parsing WhatsApp response, falling back to text format");
    const textMessage = {
      message_type: "text",
      type: "text",
      text: content
    };
    return JSON.stringify(textMessage);
  }
};

// Create tool sets for agents
const getAgentTools = () => [
  getCalendarListTool(getCurrentUserId),
  getCalendarCreateTool(getCurrentUserId),
  getCalendarDeleteTool(getCurrentUserId),
  getDocsListTool(getCurrentUserId),
  getDocsContentTool(getCurrentUserId),
  getGitHubPullRequestsListTool(getCurrentUserId),
  getGitHubPullRequestDetailsTool(getCurrentUserId),
  getGmailListTool(getCurrentUserId),
  getGmailReadTool(getCurrentUserId),
  getGmailSendTool(getCurrentUserId),
  getMemorySearchTool(getCurrentUserId),
  getMemoryAddTool(getCurrentUserId),
  getMemoryGetAllTool(getCurrentUserId),
  getMemoryDeleteTool(getCurrentUserId),
  getMemoryUpdateTool(getCurrentUserId),
];

// Create Agent for streaming responses (without WhatsApp prompts)
export const streamAgent = (() => {
  const agentInstance = createReactAgent({
    llm: geminiChat,
    tools: getAgentTools(),
    checkpointer: memorySaver,
  });
  return agentInstance;
})();

// Create Agent for WhatsApp responses (with WhatsApp prompts)
export const whatsappAgent = (() => {
  const agentInstance = createReactAgent({
    llm: structuredGeminiChat,
    tools: getAgentTools(),
    checkpointer: memorySaver,
  });
  return agentInstance;
})();

// Legacy agent reference for backward compatibility
export const agent = streamAgent;

export const streamAgentResponse = async (messages: BaseMessage[], userId: string = "default_user") => {
  setCurrentUserId(userId);
  let processedMessages = [...messages];
  const systemMessageIndex = processedMessages.findIndex(msg => msg._getType() === "system");
  let systemMessage: SystemMessage | null = null;
  if (systemMessageIndex >= 0) {
    systemMessage = processedMessages[systemMessageIndex] as SystemMessage;
    processedMessages.splice(systemMessageIndex, 1);
  } else {
    systemMessage = new SystemMessage(AGENT_SYSTEM_PROMPT);
  }
  let memoryMessage: BaseMessage | null = null;
  if (processedMessages.length > 0 && processedMessages[processedMessages.length - 1]._getType() === "human") {
    const userMessage = processedMessages[processedMessages.length - 1].content.toString();
    const memoryResults = await memory.search(userMessage, { userId, limit: 5 });
    if (memoryResults && memoryResults.results && memoryResults.results.length > 0) {
      const relevantMemories = memoryResults.results.map((m: any) => m.memory);
      if (relevantMemories.length > 0) {
        const memoryText = `Previous relevant information:\n${relevantMemories.join("\n")}`;
        memoryMessage = new HumanMessage(memoryText);
      }
    }
  }
  const finalMessages = [systemMessage, memoryMessage, ...processedMessages].filter(Boolean);
  // Create thread configuration for the user
  const threadConfig = await getThreadConfig(userId);
  console.log("[AGENT] Short Memory Messages sent to streamAgent:", JSON.stringify(finalMessages, null, 2));
  const eventStream = await streamAgent.streamEvents(
    { 
      messages: finalMessages as BaseMessage[]
    },
    { 
      version: "v2",
      configurable: threadConfig.configurable
    },
  );
  const mem0Messages = convertToMem0Format(finalMessages as BaseMessage[]);
  await memory.add(mem0Messages, { userId });
  return createDataStreamResponse({
    async execute(dataStream) {
      let fullResponse = "";
      for await (const { event, data } of eventStream) {
        if (event === "on_chat_model_stream") {
          if (!!data.chunk.content) {
            const content = data.chunk.content.toString();
            dataStream.writeData(content);
            fullResponse += content;
          }
        }
      }
      if (fullResponse) {
        const assistantMessage: Mem0Message = { 
          role: "assistant", 
          content: fullResponse 
        };
        await memory.add([assistantMessage], { userId });
      }
    },
    onError: (error) => `Error: ${error instanceof Error ? error.message : String(error)}`
  });
};

export const getNormalAgentResponse = async (messages: BaseMessage[], userId: string = "default_user", isWhatsApp: boolean = false, whatsAppMessageId?: string) => {
  try {
    setCurrentUserId(userId);
    // TODO: Fix
    if (isWhatsApp && whatsAppMessageId) {
      await sendWhatsAppTypingIndicator(whatsAppMessageId);
    }
    const userDetails = await getUserDetails(userId);
    let relevantMemories: string[] = [];
    let processedMessages = [...messages];
    let systemMessage: SystemMessage | null = null;
    let userThread = await prisma.userThread.findUnique({
      where: { userId }
    });
    if (!userThread) {
      systemMessage = isWhatsApp
        ? new SystemMessage(`${AGENT_SYSTEM_PROMPT}\n\n${WHATSAPP_SYSTEM_PROMPT}\n\nUser details: ${JSON.stringify(userDetails)}\n\nCurrent date and time: ${new Date().toISOString()}`)
        : new SystemMessage(`${AGENT_SYSTEM_PROMPT}\n\nUser details: ${JSON.stringify(userDetails)}\n\nCurrent date and time: ${new Date().toISOString()}`);
      processedMessages.unshift(systemMessage);
    }
    const threadConfig = await getThreadConfig(userId);
    let memoryMessage: BaseMessage | null = null;
    if (processedMessages.length > 0 && processedMessages[processedMessages.length - 1]._getType() === "human") {
      const userMessage = processedMessages[processedMessages.length - 1].content.toString();
      const memoryResults = await memory.search(userMessage, { userId, limit: 5 });
      console.log("memoryResults", memoryResults);
      if (memoryResults && memoryResults.results && memoryResults.results.length > 0) {
        relevantMemories = memoryResults.results.map((m: any) => m.memory);
        if (relevantMemories.length > 0) {
          const memoryText = `Previous relevant information:\n${relevantMemories.join("\n")}`;
          memoryMessage = new HumanMessage(memoryText);
        }
      }
    }
    const finalMessages = (systemMessage ? [systemMessage, memoryMessage, ...processedMessages] : [memoryMessage, ...processedMessages]).filter(Boolean);
    const activeAgent = isWhatsApp ? whatsappAgent : streamAgent;
    console.log("threadConfig", threadConfig);
    if (process.env.NODE_ENV !== 'production') {
      const messagesFilePath = path.join(process.cwd(), 'messages.json');
      fs.writeFileSync(messagesFilePath, JSON.stringify(finalMessages, null, 2));
    }
    // Store thread ID and messages for debugging/testing
    console.log(`[AGENT] Using thread ID: ${threadConfig.configurable.thread_id} for user: ${userId}`);
    const response = await activeAgent.invoke({
      messages: finalMessages as BaseMessage[]
    }, {
      configurable: threadConfig.configurable
    });
    console.log("Response recieved", response);
    const mem0Messages = convertToMem0Format(finalMessages as BaseMessage[]);
    await memory.add(mem0Messages, { userId });
    if (response.messages) {
      const lastMessage = response.messages[response.messages.length - 1];
      if (lastMessage && lastMessage._getType() === "ai") {
        const assistantMessage: Mem0Message = { 
          role: "assistant", 
          content: lastMessage.content.toString() 
        };
        await memory.add([assistantMessage], { userId });
      }
    }
    return response;
  } catch (error) {
    console.error("Full error:", JSON.stringify(error, null, 2));
    throw error;
  }
}; 