"use client";

import { ChatWindow } from "@/components/chatbot/ChatWindow";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

export default function ChatbotPage() {
  const [clientId, setClientId] = useState<string>("");

  useEffect(() => {
    // Try to get existing client ID from localStorage or generate a new one
    let id = localStorage.getItem('chatbot-client-id');
    if (!id) {
      id = 'user-' + uuidv4().substring(0, 8);
      localStorage.setItem('chatbot-client-id', id);
    }
    setClientId(id);
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] w-full">
      <ChatWindow
        endpoint="/api/agent"
        emptyStateComponent={
          <div className="text-center max-w-md p-6 mx-auto">
            <div className="mb-4 bg-muted p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
              🤖
            </div>
            <h3 className="text-lg font-medium mb-2">Welcome to the AI Chatbot</h3>
            <p className="text-muted-foreground mb-4">
              Ask me anything or get started with a question!
            </p>
          </div>
        }
        placeholder="Ask me anything about weather, data, or anything else..."
        emoji="🤖"
        userId={clientId}
      />
    </div>
  );
}