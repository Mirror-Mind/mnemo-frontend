import { NextResponse } from "next/server";
import { getOrCreateThreadId } from "@/lib/agents/checkpointers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate that userId is provided
    if (!body || !body.userId) {
      return NextResponse.json(
        { error: "userId is required in the request body" },
        { status: 400 }
      );
    }
    
    const { userId } = body;
    
    // Create a new thread for this user
    const threadId = getOrCreateThreadId(userId);
    
    return NextResponse.json({
      success: true,
      message: `Thread created for user: ${userId}`,
      userId,
      threadId
    }, { status: 201 });
  } catch (error) {
    console.error(`[API] Error creating user thread:`, error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to create user thread", details: errorMessage },
      { status: 500 }
    );
  }
} 