import { NextRequest, NextResponse } from "next/server";
import { Message as VercelChatMessage } from "ai";
import {
  convertVercelMessageToLangChainMessage,
  streamAgentResponse
} from "@/lib/agents/agentUtils";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = session?.user?.id || body.userId || "anonymous-" + req.cookies.get("session-id")?.value || "anonymous";
    const rawMessages = body.messages ?? [];
    const messages = rawMessages
      .filter(
        (message: VercelChatMessage) =>
          message.role === "user" || 
          message.role === "assistant" ||
          message.role === "system",
      )
      .map(convertVercelMessageToLangChainMessage);
    return streamAgentResponse(messages, userId);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.status ?? 500 });
  }
}