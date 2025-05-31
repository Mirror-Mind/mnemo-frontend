import { NextResponse } from "next/server";
import { memory } from "@/lib/agents/agentUtils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required parameters
    if (!body || !body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: "Valid messages array is required in the request body" },
        { status: 400 }
      );
    }
    
    if (!body.userId) {
      return NextResponse.json(
        { error: "userId is required in the request body" },
        { status: 400 }
      );
    }
    
    const { messages, userId, metadata } = body;
    
    console.log(`[API] Adding new memory for userId: ${userId}`);
    
    // Add memory
    const result = await memory.add(messages, { 
      userId: userId,
      metadata: metadata || {}
    });
    
    return NextResponse.json({
      success: true,
      message: "Memory added successfully",
      memoryId: result.results?.[0]?.id || "unknown",
      userId,
      data: result
    }, { status: 201 });
  } catch (error) {
    console.error(`[API] Error adding memory:`, error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to add memory", details: errorMessage },
      { status: 500 }
    );
  }
} 