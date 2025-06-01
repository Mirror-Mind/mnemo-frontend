import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as googleDocs from "@/lib/agents/tools/googleDocs";

export async function GET(request: NextRequest) {
  try {
    // Get the user session
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ 
        error: "No authenticated session",
        code: "UNAUTHENTICATED"
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
        if (result.code === "NO_GOOGLE_ACCOUNT") {
          return NextResponse.json({ 
            error: result.error,
            code: result.code
          }, { status: 400 });
        }
        
        if (result.code === "INVALID_TOKEN") {
          return NextResponse.json({ 
            error: result.error,
            code: result.code
          }, { status: 401 });
        }
        
        if (result.code === "DOC_NOT_FOUND") {
          return NextResponse.json({ 
            error: result.error,
            code: result.code
          }, { status: 404 });
        }
        
        return NextResponse.json({ 
          error: result.error,
          details: result.details,
          code: result.code
        }, { status: 500 });
      }
      
      return NextResponse.json({
        document: result.data
      });
    } else {
      const maxResults = parseInt(url.searchParams.get('maxResults') || '10');
      const result = await googleDocs.listDocuments(userId, maxResults);
      
      if (!result.success) {
        if (result.code === "NO_GOOGLE_ACCOUNT") {
          return NextResponse.json({ 
            error: result.error,
            code: result.code
          }, { status: 400 });
        }
        
        if (result.code === "INVALID_TOKEN") {
          return NextResponse.json({ 
            error: result.error,
            code: result.code
          }, { status: 401 });
        }
        
        return NextResponse.json({ 
          error: result.error,
          details: result.details,
          code: result.code
        }, { status: 500 });
      }
      
      return NextResponse.json({
        documents: result.data
      });
    }
  } catch (error: any) {
    console.error("Documents API error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch documents",
      message: error.message,
      code: "INTERNAL_ERROR" 
    }, { status: 500 });
  }
} 