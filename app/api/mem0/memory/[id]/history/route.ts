import { NextResponse } from "next/server";
import { memory } from "@/lib/agents/agentUtils";

// Get history of changes for a specific memory by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const memoryId = params.id;
  
  try {
    console.log(`[API] Fetching history for memory with ID: ${memoryId}`);
    
    const result = await memory.history({ memory_id: memoryId });
    
    if (!result) {
      return NextResponse.json(
        { error: "Memory history not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      memoryId,
      data: result
    }, { status: 200 });
  } catch (error) {
    console.error(`[API] Error retrieving memory history:`, error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to retrieve memory history", details: errorMessage },
      { status: 500 }
    );
  }
} 