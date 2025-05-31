"use client";

import { type Message } from "ai";
import { useChat } from "@ai-sdk/react";
import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { toast } from "sonner";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";

import { ChatMessageBubble } from "@/components/chatbot/ChatMessageBubble";
import { IntermediateStep } from "@/components/chatbot/IntermediateStep";
import { Button } from "@/components/ui/button";
import { ArrowDown, LoaderCircle, Paperclip } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { UploadDocumentsForm } from "@/components/chatbot/UploadDocumentsForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { convertToLegacyMessages, convertToUIMessage } from "@/lib/chat-helpers";

function ChatMessages(props: {
  messages: Message[];
  emptyStateComponent: ReactNode;
  sourcesForMessages: Record<string, any>;
  aiEmoji?: string;
  className?: string;
}) {
  console.log("ChatMessages received messages:", props.messages.length);
  
  // Use a try-catch block for the whole component to prevent any rendering errors
  try {
    if (props.messages.length === 0) {
      return (
        <div className="flex h-full items-center justify-center">
          {props.emptyStateComponent}
        </div>
      );
    }
    
    return (
      <div className={cn("flex flex-col w-full space-y-3", props.className)}>
        {props.messages.map((m, i) => {
          // Skip invalid messages
          if (!m) return null;
          
          try {
            if (m.role === "system") {
              return <IntermediateStep key={m.id || i} message={m} />;
            }

            const sourceKey = (props.messages.length - 1 - i).toString();
            
            return (
              <ChatMessageBubble
                key={m.id || i}
                message={m}
                aiEmoji={props.aiEmoji}
                sources={props.sourcesForMessages[sourceKey]}
              />
            );
          } catch (error) {
            console.error("Error rendering message:", error);
            return null;
          }
        })}
      </div>
    );
  } catch (error) {
    console.error("Error rendering ChatMessages:", error);
    return <div className="text-red-500 p-4">Error displaying messages</div>;
  }
}

export function ChatInput(props: {
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onStop?: () => void;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
  placeholder?: string;
  children?: ReactNode;
  className?: string;
  actions?: ReactNode;
}) {
  const disabled = props.loading && props.onStop == null;
  return (
    <form
      onSubmit={(e) => {
        e.stopPropagation();
        e.preventDefault();

        if (props.loading) {
          props.onStop?.();
        } else {
          props.onSubmit(e);
        }
      }}
      className={cn("w-full", props.className)}
    >
      <div className="border border-input bg-card rounded-lg flex flex-col gap-2 w-full shadow-sm">
        <input
          value={props.value}
          placeholder={props.placeholder || "Type your message..."}
          onChange={props.onChange}
          className="border-none outline-none bg-transparent p-3 text-foreground min-h-[50px] resize-none"
        />

        <div className="flex justify-between items-center px-3 pb-2">
          <div className="flex gap-2">{props.children}</div>

          <div className="flex gap-2 items-center">
            {props.actions}
            <Button type="submit" disabled={disabled} className="px-3 py-1.5 h-auto">
              {props.loading ? (
                <span role="status" className="flex justify-center items-center gap-1">
                  <LoaderCircle className="animate-spin h-3.5 w-3.5" />
                  <span>Loading...</span>
                </span>
              ) : (
                <span>Send</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function ScrollToBottom(props: { className?: string }) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();

  if (isAtBottom) return null;
  return (
    <Button
      variant="secondary"
      size="sm"
      className={cn("shadow-md", props.className)}
      onClick={() => scrollToBottom()}
    >
      <ArrowDown className="w-4 h-4 mr-2" />
      <span>Scroll to bottom</span>
    </Button>
  );
}

function StickyToBottomContent(props: {
  content: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  const context = useStickToBottomContext();

  return (
    <div
      ref={context.scrollRef}
      className={cn("h-full flex flex-col", props.className)}
      style={{ width: "100%", overflow: "auto" }}
    >
      <div 
        ref={context.contentRef} 
        className={cn("flex-1 overflow-y-auto py-4 px-4", props.contentClassName)}
      >
        {props.content}
      </div>

      {props.footer}
    </div>
  );
}

export function ChatLayout(props: { content: ReactNode; footer: ReactNode }) {
  return (
    <StickToBottom>
      <StickyToBottomContent
        className="h-full"
        contentClassName="py-4 px-4"
        content={props.content}
        footer={
          <div className="sticky bottom-0 px-2 pb-3 pt-2 bg-background border-t">
            <ScrollToBottom className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5" />
            {props.footer}
          </div>
        }
      />
    </StickToBottom>
  );
}

export function ChatWindow(props: {
  endpoint: string;
  emptyStateComponent: ReactNode;
  placeholder?: string;
  emoji?: string;
  showIngestForm?: boolean;
  showIntermediateStepsToggle?: boolean;
  userId?: string;
}) {
  const [sourcesForMessages, setSourcesForMessages] = useState<
    Record<string, any>
  >({});

  const chat = useChat({
    api: props.endpoint,
    body: props.userId ? { userId: props.userId } : undefined,
    onResponse(response: Response) {
      const sourcesHeader = response.headers.get("x-sources");
      const sources = sourcesHeader
        ? JSON.parse(Buffer.from(sourcesHeader, "base64").toString("utf8"))
        : [];

      const messageIndexHeader = response.headers.get("x-message-index");
      if (sources.length && messageIndexHeader !== null) {
        setSourcesForMessages({
          ...sourcesForMessages,
          [messageIndexHeader]: sources,
        });
      }
    },
    streamProtocol: "text",
    onError: (e: Error) => {
      console.error("Error in chat:", e);
      toast.error(`Error while processing your request`, {
        description: e.message,
      });
    },
    onFinish: (message) => {
      console.log("Chat finished with final message");
    },
    id: 'chatbot-' + (props.userId || 'anon'),
  });

  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (chat.isLoading) return;

    console.log("Sending message with input:", chat.input);
    
    // Let the chat hook handle submission directly
    chat.handleSubmit(e);
  }

  console.log("Current chat messages:", chat.messages);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-h-[calc(100vh-4rem)] w-full">
      <div className="flex justify-between items-center py-3 px-4 border-b">
        <h1 className="text-lg font-medium">AI Chatbot</h1>
        
        {props.showIngestForm && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <Paperclip className="h-4 w-4 mr-2" />
                <span>Upload documents</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl">
              <DialogHeader>
                <DialogTitle>Upload documents</DialogTitle>
                <DialogDescription>
                  Upload documents to your documents store.
                </DialogDescription>
              </DialogHeader>
              <UploadDocumentsForm userId={props.userId} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatLayout
          content={
            <ChatMessages
              messages={chat.messages}
              emptyStateComponent={props.emptyStateComponent}
              sourcesForMessages={sourcesForMessages}
              aiEmoji={props.emoji}
            />
          }
          footer={
            <ChatInput
              placeholder={props.placeholder}
              value={chat.input}
              onChange={(e) => chat.setInput(e.target.value)}
              onSubmit={sendMessage}
              onStop={chat.stop}
              loading={chat.isLoading}
              actions={
                props.showIntermediateStepsToggle ? (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="show-intermediate-steps"
                      className="h-4 w-4"
                      defaultChecked={chat.messages.some(
                        (m) => m.role === "system",
                      )}
                      onCheckedChange={(checked) => {
                        // TODO: add support for sending a request to see intermediate steps
                      }}
                    />
                    <label
                      htmlFor="show-intermediate-steps"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Show intermediate steps
                    </label>
                  </div>
                ) : null
              }
            />
          }
        />
      </div>
    </div>
  );
}