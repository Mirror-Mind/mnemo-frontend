import { NextResponse } from "next/server";
import { memory } from "@/lib/agents/agentUtils";

export async function GET(request: Request) {
  // Parse query parameters
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('query');
  const userId = url.searchParams.get('userId');
  const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit') as string) : 10;
  const threshold = url.searchParams.get('threshold') ? parseFloat(url.searchParams.get('threshold') as string) : 0.1;
  
  // Validate required parameters
  if (!searchQuery) {
    return NextResponse.json(
      { error: "Search query is required" },
      { status: 400 }
    );
  }

  if (!userId) {
    return NextResponse.json(
      { error: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    console.log(`[API] Searching Mem0 memories for userId: ${userId}, query: ${searchQuery}`);
    
    // Create search options
    const searchOptions: any = { 
      user_id: userId, 
      limit,
      threshold
    };
    
    const searchResults = await memory.search(searchQuery, searchOptions);
    
    return NextResponse.json({
      query: searchQuery,
      userId,
      threshold,
      count: searchResults?.results?.length || 0,
      data: searchResults
    }, { status: 200 });
  } catch (error) {
    console.error(`[API] Error searching memories:`, error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to search memories", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body || !body.query) {
      return NextResponse.json(
        { error: "Request body must contain a 'query' field" },
        { status: 400 }
      );
    }
    
    if (!body.userId) {
      return NextResponse.json(
        { error: "Request body must contain a 'userId' field" },
        { status: 400 }
      );
    }
    
    const { query, userId } = body;
    const limit = body.limit || 10;
    
    console.log(`[API] Advanced search for userId: ${userId}, query: ${query}`);
    
    const searchResults = await memory.search(query, { 
      userId, 
      limit 
    });
    
    return NextResponse.json({
      query,
      userId,
      count: searchResults?.results?.length || 0,
      data: searchResults
    }, { status: 200 });
  } catch (error) {
    console.error(`[API] Error in advanced search:`, error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to perform advanced search", details: errorMessage },
      { status: 500 }
    );
  }
} 