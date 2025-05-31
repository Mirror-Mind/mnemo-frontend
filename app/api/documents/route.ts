import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as googleDocs from "@/lib/agents/tools/googleDocs";

export async function GET(request: NextRequest) {
  try {
    // Get the user session
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ 
        error: "No authenticated session" 
      }, { status: 401 });
    }
    
    // Parse query parameters
    const url = new URL(request.url);
    const documentId = url.searchParams.get('documentId');
    const userId = session.user.id;
    
    if (documentId) {
      // Get specific document content if documentId is provided
      const result = await googleDocs.getDocumentContent(userId, documentId);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return NextResponse.json({
        document: result.data
      });
    } else {
      const maxResults = parseInt(url.searchParams.get('maxResults') || '10');
      const result = await googleDocs.listDocuments(userId, maxResults);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      return NextResponse.json({
        documents: result.data
      });
    }
  } catch (error: any) {
    console.error("Documents API error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch documents",
      message: error.message 
    }, { 
      status: error.message?.includes("No authenticated session") ? 401 :
             error.message?.includes("No Google account") ? 400 : 500 
    });
  }
} 