import { NextResponse } from "next/server";
import { memory } from "@/lib/agents/agentUtils";

// Delete all memories for a specific user
export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId;
  
  try {
    console.log(`[API] Deleting all memories for userId: ${userId}`);
    
    const result = await memory.deleteAll({ userId: userId });
    
    return NextResponse.json({
      success: true,
      message: `All memories deleted for user: ${userId}`,
      userId,
      data: result
    }, { status: 200 });
  } catch (error) {
    console.error(`[API] Error deleting memories:`, error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to delete memories", details: errorMessage },
      { status: 500 }
    );
  }
} 