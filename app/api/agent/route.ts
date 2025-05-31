import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage } from "ai";
import {
  convertVercelMessageToLangChainMessage,
  streamAgentResponse,
  getNormalAgentResponse
} from "@/lib/agents/agentUtils";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = session?.user?.id || body.userId || "anonymous-" + req.cookies.get("session-id")?.value || "anonymous";
    
    // Handle voice-specific parameters
    const isVoiceMode = body.voice || body.isVoiceMode || false;
    const voiceCommand = body.voiceCommand;
    const rawMessages = body.messages ?? [];
    
    // For voice mode, we might want to add special handling
    if (isVoiceMode) {
      console.log("[AGENT] Voice mode enabled for user:", userId);
      
      // If this is a voice initialization request
      if (rawMessages.length === 1 && rawMessages[0].content === 'Initialize voice session') {
        const welcomeMessage = {
          role: "assistant" as const,
          content: "Voice session initialized. I'm Mnemo, your AI Executive Assistant. How can I help you today? You can ask me about your schedule, documents, emails, or any executive tasks."
        };
        
        return NextResponse.json({ 
          message: welcomeMessage,
          voiceEnabled: true,
          suggestions: [
            "What's on my schedule today?",
            "Give me my daily briefing",
            "Show me my recent documents",
            "What are my priorities?"
          ]
        });
      }
    }
    
    const messages = rawMessages
      .filter(
        (message: VercelChatMessage) =>
          message.role === "user" || 
          message.role === "assistant" ||
          message.role === "system",
      )
      .map(convertVercelMessageToLangChainMessage);
      
    // For voice mode, we use streaming response for real-time interaction
    if (isVoiceMode && body.stream !== false) {
      return streamAgentResponse(messages, userId);
    }
    
    // For non-voice or when streaming is disabled, use regular response
    return streamAgentResponse(messages, userId);
    
  } catch (e: any) {
    console.error("[AGENT] Error processing request:", e);
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}