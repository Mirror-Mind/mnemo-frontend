import type { Message } from "ai";
import type { UIMessage } from "@ai-sdk/ui-utils";

// Helper to convert a legacy Message to a UIMessage
export function convertToUIMessage(message: Message): UIMessage {
  return {
    id: message.id,
    role: message.role as "user" | "system" | "assistant" | "data",
    parts: [
      {
        type: "text" as const,
        text: message.content,
      },
    ],
  };
}

// Helper to convert a UIMessage to a legacy Message
export function convertToLegacyMessage(message: UIMessage): Message {
  // Extract text from parts
  let content = "";
  for (const part of message.parts) {
    if (part.type === "text") {
      content += part.text;
    }
  }

  return {
    id: message.id,
    role: message.role,
    content,
  };
}

// Helper to convert an array of Messages to UIMessages
export function convertToUIMessages(messages: Message[]): UIMessage[] {
  return messages.map(convertToUIMessage);
}

// Helper to convert an array of UIMessages to Messages
export function convertToLegacyMessages(messages: UIMessage[]): Message[] {
  return messages.map(convertToLegacyMessage);
} 