import { cn } from "@/lib/utils";
import type { Message } from "ai";
import ReactMarkdown from 'react-markdown';

// Create a custom message type that includes additional_kwargs
interface SafeMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool';
  content: string;
  additional_kwargs?: Record<string, any>;
}

// Format message content to remove streaming artifacts
function formatMessageContent(content: string): string {
  if (!content) return '';
  
  // Split by newlines and process each line separately
  const lines = content.split('\n');
  const processedLines = lines.map(line => {
    const match = line.match(/^\d+:\s*\[["']?(.*?)["']?\]$/);
    if (match && match[1]) {
      return match[1];
    }
    
    return line
      .replace(/^\d+:\s*\[["']?/g, '') // Remove prefix like "2:["
      .replace(/["']?\]$/g, '');        // Remove suffix like "]"
  });
  
  // Join lines back together
  let processedContent = processedLines.join('');
  // Replace escaped newlines with actual newlines
  processedContent = processedContent.replace(/\\n/g, '\n');
  
  return processedContent;
}

// Create a safe wrapper for messages with additional_kwargs issues
function createSafeMessage(message: any): SafeMessage {
  const safeMessage: SafeMessage = {
    id: message.id || `static-id-${message.content?.slice(0, 10)?.replace(/\s+/g, '-') || 'empty'}`,
    role: (message.role as SafeMessage['role']) || "assistant",
    content: message.content || "",
    // Add an empty additional_kwargs to prevent undefined errors
    additional_kwargs: {},
  };
  
  return safeMessage;
}

export function ChatMessageBubble(props: {
  message: Message;
  aiEmoji?: string;
  sources: any[];
}) {
  // Create a safe copy of the message to avoid additional_kwargs errors
  let safeMessage: SafeMessage;
  try {
    safeMessage = createSafeMessage(props.message);
  } catch (error) {
    console.error("Error creating safe message:", error);
    // Fallback message if anything goes wrong
    safeMessage = {
      id: "static-error-message",
      role: "assistant",
      content: "Error displaying message",
      additional_kwargs: {},
    };
  }
  
  // Safely get and format message content
  const rawContent = safeMessage.content || '';
  const messageContent = formatMessageContent(rawContent);
  
  return (
    <div
      className={cn(
        "rounded-lg mb-3 flex w-full",
        safeMessage.role === "user"
          ? "bg-primary text-primary-foreground px-4 py-2.5 justify-end"
          : "bg-muted text-muted-foreground px-4 py-2.5",
      )}
    >
      {safeMessage.role !== "user" && (
        <div className="mr-3 bg-secondary border border-border rounded-full w-8 h-8 flex-shrink-0 flex items-center justify-center">
          {props.aiEmoji || "🤖"}
        </div>
      )}

      <div className={cn(
        "whitespace-pre-wrap flex flex-col overflow-hidden",
        safeMessage.role === "user" ? "max-w-[80%]" : "max-w-[85%]",
      )}>
        {safeMessage.role === "user" ? (
          <span className="leading-relaxed text-current font-normal break-words">
            {messageContent || "(Empty message)"}
          </span>
        ) : (
          <div className="markdown-prose break-words">
            <ReactMarkdown>
              {messageContent || "(Empty message)"}
            </ReactMarkdown>
          </div>
        )}

        {props.sources && props.sources.length ? (
          <div className="mt-3 space-y-2">
            <div className="font-medium text-xs bg-secondary/30 px-2 py-1 rounded-md inline-block">
              🔍 Sources:
            </div>
            <div className="text-xs space-y-2 bg-secondary/30 p-2 rounded-md">
              {props.sources?.map((source, i) => (
                <div className="border-l-2 border-border pl-2" key={"source:" + i}>
                  <span className="font-medium">{i + 1}.</span> &quot;{source.pageContent}&quot;
                  {source.metadata?.loc?.lines !== undefined && (
                    <div className="mt-1 opacity-70">
                      Lines {source.metadata?.loc?.lines?.from} to{" "}
                      {source.metadata?.loc?.lines?.to}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}