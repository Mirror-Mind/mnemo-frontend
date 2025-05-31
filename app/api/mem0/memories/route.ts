import { NextResponse } from "next/server";
import { memory } from "@/lib/agents/agentUtils";

export async function GET(request: Request) {
  // Parse query parameters
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit') as string) : 50;
  const page = url.searchParams.get('page') ? parseInt(url.searchParams.get('page') as string) : 1;
  
  // Validate required parameters
  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    console.log(`[API] Fetching all Mem0 memories for userId: ${userId}`);
    
    const memories = await memory.getAll({
      userId: userId,
      limit,
      page
    });
    
    return NextResponse.json({
      userId,
      count: memories?.length || 0,
      page,
      limit,
      data: memories
    }, { status: 200 });
  } catch (error) {
    console.error(`[API] Error retrieving memories:`, error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to retrieve memories", details: errorMessage },
      { status: 500 }
    );
  }
} 