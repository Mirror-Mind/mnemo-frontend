import { google } from 'googleapis';
import prisma from '@/lib/prisma';
import { DynamicTool } from "@langchain/core/tools";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";
import { auth } from '@/lib/auth';

// Get Google OAuth client for a user using better-auth's getAccessToken API
async function getGoogleAuthClient(userId: string) {
  try {
    // Use better-auth's getAccessToken API which automatically refreshes expired tokens
    const { accessToken } = await auth.api.getAccessToken({
      body: {
        providerId: "google",
        userId: userId
      }
    });

    if (!accessToken) {
      throw new Error("No valid Google access token available");
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    
    // Set the access token (better-auth handles refresh automatically)
    oauth2Client.setCredentials({
      access_token: accessToken
    });

    return oauth2Client;
  } catch (error: any) {
    console.error("Google Docs authentication error:", error);
    
    // Handle specific better-auth errors
    if (error.message?.includes("No account found")) {
      throw new Error("No Google account connected");
    }
    
    throw error;
  }
}

// List Google Docs for a user
export async function listDocuments(userId: string, maxResults: number = 10) {
  try {
    console.log(`[DOCS] Listing documents for user: ${userId}, max: ${maxResults}`);
    
    // Get authenticated client
    const oauth2Client = await getGoogleAuthClient(userId);
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // Fetch documents
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.document'",
      fields: "files(id, name, createdTime, modifiedTime, webViewLink)",
      orderBy: "modifiedTime desc",
      pageSize: maxResults
    });
    
    console.log(`[DOCS] Found ${response.data.files?.length || 0} documents`);
    
    return { 
      success: true, 
      data: response.data.files 
    };
  } catch (error: any) {
    console.error(`[DOCS ERROR] List documents: ${error.message}`);
    
    if (error.message.includes("No Google account")) {
      return { 
        success: false, 
        error: "No Google account connected",
        code: "NO_GOOGLE_ACCOUNT"
      };
    }
    
    if (error.message.includes("invalid_grant") || error.message.includes("token")) {
      return { 
        success: false, 
        error: "Google authentication failed. Please reconnect your Google account.",
        code: "INVALID_TOKEN" 
      };
    }
    
    return { 
      success: false, 
      error: "Failed to fetch documents",
      details: error.message,
      code: "DOCS_ERROR"
    };
  }
}

// Get content of a specific Google Doc
export async function getDocumentContent(userId: string, documentId: string) {
  try {
    console.log(`[DOCS] Getting content for document: ${documentId}, user: ${userId}`);
    
    // Get authenticated client
    const oauth2Client = await getGoogleAuthClient(userId);
    const docs = google.docs({ version: 'v1', auth: oauth2Client });
    
    // Get document content
    const document = await docs.documents.get({
      documentId
    });
    
    console.log(`[DOCS] Retrieved document with title: ${document.data.title}`);
    
    return { 
      success: true, 
      data: document.data 
    };
  } catch (error: any) {
    console.error(`[DOCS ERROR] Get document content: ${error.message}`);
    
    if (error.message.includes("No Google account")) {
      return { 
        success: false, 
        error: "No Google account connected",
        code: "NO_GOOGLE_ACCOUNT"
      };
    }
    
    if (error.message.includes("invalid_grant") || error.message.includes("token")) {
      return { 
        success: false, 
        error: "Google authentication failed. Please reconnect your Google account.",
        code: "INVALID_TOKEN" 
      };
    }
    
    if (error.message.includes("not found") || error.message.includes("404")) {
      return { 
        success: false, 
        error: "Document not found",
        code: "DOC_NOT_FOUND" 
      };
    }
    
    return { 
      success: false, 
      error: "Failed to fetch document content",
      details: error.message,
      code: "DOCS_ERROR"
    };
  }
}

// Helper function to log tool calls
const logToolCall = (toolName: string, args: any, result: any) => {
  console.log(`[TOOL CALL] ${toolName}`);
  console.log(`[TOOL ARGS] ${JSON.stringify(args, null, 2)}`);
  console.log(`[TOOL RESPONSE] ${JSON.stringify(result, null, 2)}`);
};

// Create docs list tool
export const getDocsListTool = (getCurrentUserId: () => string) => new DynamicTool({
  name: "list_documents",
  description: "Lists recent Google Docs from the user's Drive. Accepts an optional maxResults parameter (number).",
  func: async (args: string, runManager?: CallbackManagerForToolRun): Promise<string> => {
    try {
      // Use the current user ID from the request context
      const userId = getCurrentUserId();
      console.log(`[TOOL CONTEXT] User ID: ${userId}`);
      let params = { maxResults: 10 };
      if (args && args.trim()) {
        params = JSON.parse(args);
      }
      console.log(`[TOOL EXECUTE] list_documents with params: ${JSON.stringify(params)}`);
      const result = await listDocuments(userId, params.maxResults);
      logToolCall("list_documents", params, result);
      
      if (!result.success) {
        const errorMessage = result.code === "NO_GOOGLE_ACCOUNT" 
          ? "Your Google Drive is not connected. Please connect your Google account to use document features."
          : result.code === "INVALID_TOKEN"
          ? "Your Google account needs to be reconnected. Please go to Settings and reconnect your Google account."
          : result.error || "Error listing documents";
          
        return JSON.stringify({
          success: false,
          error: errorMessage,
          code: result.code
        });
      }
      
      return JSON.stringify(result);
    } catch (error: any) {
      console.error(`[TOOL ERROR] list_documents: ${error.message}`);
      return JSON.stringify({ 
        success: false, 
        error: error.message || "Error listing documents",
        code: "INTERNAL_ERROR"
      });
    }
  }
});

// Create docs content tool
export const getDocsContentTool = (getCurrentUserId: () => string) => new DynamicTool({
  name: "get_document_content",
  description: "Retrieves the content of a Google Doc. Required parameter: documentId (string).",
  func: async (args: string, runManager?: CallbackManagerForToolRun): Promise<string> => {
    try {
      // Use the current user ID from the request context
      const userId = getCurrentUserId();
      console.log(`[TOOL CONTEXT] User ID: ${userId}`);
      const params = JSON.parse(args);
      if (!params.documentId) {
        throw new Error("Missing required field: documentId");
      }
      console.log(`[TOOL EXECUTE] get_document_content with params: ${JSON.stringify(params)}`);
      const result = await getDocumentContent(userId, params.documentId);
      logToolCall("get_document_content", params, result);
      
      if (!result.success) {
        const errorMessage = result.code === "NO_GOOGLE_ACCOUNT" 
          ? "Your Google Drive is not connected. Please connect your Google account to use document features."
          : result.code === "INVALID_TOKEN"
          ? "Your Google account needs to be reconnected. Please go to Settings and reconnect your Google account."
          : result.code === "DOC_NOT_FOUND"
          ? "The requested document was not found."
          : result.error || "Error retrieving document content";
          
        return JSON.stringify({
          success: false,
          error: errorMessage,
          code: result.code
        });
      }
      
      return JSON.stringify(result);
    } catch (error: any) {
      console.error(`[TOOL ERROR] get_document_content: ${error.message}`);
      return JSON.stringify({ 
        success: false, 
        error: error.message || "Error retrieving document content",
        code: "INTERNAL_ERROR"
      });
    }
  }
}); 