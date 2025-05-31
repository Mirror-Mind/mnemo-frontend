import { NextResponse } from "next/server";
import { memory } from "@/lib/agents/agentUtils";

// Get a specific memory by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const memoryId = params.id;
  
  try {
    console.log(`[API] Fetching memory with ID: ${memoryId}`);
    
    const result = await memory.get(memoryId);
    
    if (!result) {
      return NextResponse.json(
        { error: "Memory not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: result
    }, { status: 200 });
  } catch (error) {
    console.error(`[API] Error retrieving memory:`, error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to retrieve memory", details: errorMessage },
      { status: 500 }
    );
  }
}

// Update a specific memory by ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const memoryId = params.id;
  
  try {
    const body = await request.json();
    
    // Validate the request body
    if (!body || (!body.data && !body.metadata)) {
      return NextResponse.json(
        { error: "data or metadata is required in the request body" },
        { status: 400 }
      );
    }
    
    console.log(`[API] Updating memory with ID: ${memoryId}`);
    
    // Update memory
    const updateData: any = { memory_id: memoryId };
    
    if (body.data) {
      updateData.data = body.data;
    }
    
    if (body.metadata) {
      updateData.metadata = body.metadata;
    }
    
    const result = await memory.update(memoryId, updateData.data);
    
    return NextResponse.json({
      success: true,
      message: "Memory updated successfully",
      data: result
    }, { status: 200 });
  } catch (error) {
    console.error(`[API] Error updating memory:`, error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to update memory", details: errorMessage },
      { status: 500 }
    );
  }
}

// Delete a specific memory by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const memoryId = params.id;
  
  try {
    console.log(`[API] Deleting memory with ID: ${memoryId}`);
    
    const result = await memory.delete(memoryId);
    
    return NextResponse.json({
      success: true,
      message: "Memory deleted successfully",
      data: result
    }, { status: 200 });
  } catch (error) {
    console.error(`[API] Error deleting memory:`, error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to delete memory", details: errorMessage },
      { status: 500 }
    );
  }
} 