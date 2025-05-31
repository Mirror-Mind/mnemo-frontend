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
    console.error("Gmail authentication error:", error);
    
    // Handle specific better-auth errors
    if (error.message?.includes("No account found")) {
      throw new Error("No Google account connected");
    }
    
    throw error;
  }
}

// List emails from Gmail
export async function listEmails(userId: string, params: {
  maxResults?: number;
  query?: string;
  labelIds?: string[];
} = {}) {
  try {
    console.log(`[GMAIL] Listing emails for user: ${userId}`);
    
    // Get authenticated client
    const oauth2Client = await getGoogleAuthClient(userId);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Fetch emails
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: params.maxResults || 10,
      q: params.query,
      labelIds: params.labelIds
    });
    
    // Get full message details for each email
    const messages = await Promise.all(
      (response.data.messages || []).map(async (message) => {
        const fullMessage = await gmail.users.messages.get({
          userId: 'me',
          id: message.id!
        });
        
        // Extract headers
        const headers = fullMessage.data.payload?.headers;
        const subject = headers?.find(h => h.name === 'Subject')?.value || '';
        const from = headers?.find(h => h.name === 'From')?.value || '';
        const date = headers?.find(h => h.name === 'Date')?.value || '';
        
        return {
          id: message.id,
          threadId: message.threadId,
          subject,
          from,
          date,
          snippet: fullMessage.data.snippet
        };
      })
    );
    
    return { 
      success: true, 
      data: messages
    };
  } catch (error: any) {
    console.error(`[GMAIL ERROR] List emails: ${error.message}`);
    
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
      error: "Failed to fetch emails",
      details: error.message,
      code: "GMAIL_ERROR"
    };
  }
}

// Read a specific email
export async function readEmail(userId: string, params: {
  messageId: string;
}) {
  try {
    console.log(`[GMAIL] Reading email for user: ${userId}, messageId: ${params.messageId}`);
    
    // Get authenticated client
    const oauth2Client = await getGoogleAuthClient(userId);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Get full message
    const message = await gmail.users.messages.get({
      userId: 'me',
      id: params.messageId,
      format: 'full'
    });
    
    // Extract headers
    const headers = message.data.payload?.headers;
    const subject = headers?.find(h => h.name === 'Subject')?.value || '';
    const from = headers?.find(h => h.name === 'From')?.value || '';
    const to = headers?.find(h => h.name === 'To')?.value || '';
    const date = headers?.find(h => h.name === 'Date')?.value || '';
    
    // Extract body
    let body = '';
    if (message.data.payload?.body?.data) {
      body = Buffer.from(message.data.payload.body.data, 'base64').toString();
    } else if (message.data.payload?.parts) {
      const textPart = message.data.payload.parts.find(part => part.mimeType === 'text/plain');
      if (textPart?.body?.data) {
        body = Buffer.from(textPart.body.data, 'base64').toString();
      }
    }
    
    return { 
      success: true, 
      data: {
        id: message.data.id,
        threadId: message.data.threadId,
        subject,
        from,
        to,
        date,
        body,
        snippet: message.data.snippet
      }
    };
  } catch (error: any) {
    console.error(`[GMAIL ERROR] Read email: ${error.message}`);
    
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
      error: "Failed to read email",
      details: error.message,
      code: "GMAIL_ERROR"
    };
  }
}

// Send an email
export async function sendEmail(userId: string, params: {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}) {
  try {
    console.log(`[GMAIL] Sending email for user: ${userId}`);
    
    // Get authenticated client
    const oauth2Client = await getGoogleAuthClient(userId);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    // Construct email
    const emailLines = [];
    emailLines.push(`To: ${params.to}`);
    if (params.cc) emailLines.push(`Cc: ${params.cc}`);
    if (params.bcc) emailLines.push(`Bcc: ${params.bcc}`);
    emailLines.push(`Subject: ${params.subject}`);
    emailLines.push('');
    emailLines.push(params.body);
    
    const email = emailLines.join('\r\n').trim();
    const base64Email = Buffer.from(email).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
    // Send email
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: base64Email
      }
    });
    
    console.log(`[GMAIL] Email sent with ID: ${response.data.id}`);
    
    return { 
      success: true, 
      data: {
        messageId: response.data.id,
        threadId: response.data.threadId
      }
    };
  } catch (error: any) {
    console.error(`[GMAIL ERROR] Send email: ${error.message}`);
    
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
      error: "Failed to send email",
      details: error.message,
      code: "GMAIL_ERROR"
    };
  }
}

// Create Gmail list tool
export const getGmailListTool = (getCurrentUserId: () => string) => new DynamicTool({
  name: "list_gmail_messages",
  description: "Lists emails from the user's Gmail inbox. Optional parameters: maxResults (number), query (string for search), labelIds (array of label IDs).",
  func: async (args: string, runManager?: CallbackManagerForToolRun): Promise<string> => {
    try {
      const userId = getCurrentUserId();
      console.log(`[TOOL CONTEXT] User ID: ${userId}`);
      let params = {};
      if (args && args.trim()) {
        params = JSON.parse(args);
      }
      console.log(`[TOOL EXECUTE] list_gmail_messages with params: ${JSON.stringify(params)}`);
      const result = await listEmails(userId, params);
      
      if (!result.success) {
        const errorMessage = result.code === "NO_GOOGLE_ACCOUNT" 
          ? "Your Gmail account is not connected. Please connect your Google account to use Gmail features."
          : result.code === "INVALID_TOKEN"
          ? "Your Google account needs to be reconnected. Please go to Settings and reconnect your Google account."
          : result.error || "Error listing emails";
          
        return JSON.stringify({
          success: false,
          error: errorMessage,
          code: result.code
        });
      }
      
      return JSON.stringify(result);
    } catch (error: any) {
      console.error(`[TOOL ERROR] list_gmail_messages: ${error.message}`);
      return JSON.stringify({ 
        success: false, 
        error: error.message || "Error listing emails",
        code: "INTERNAL_ERROR"
      });
    }
  }
});

// Create Gmail read tool
export const getGmailReadTool = (getCurrentUserId: () => string) => new DynamicTool({
  name: "read_gmail_message",
  description: "Reads a specific email message from Gmail. Required parameter: messageId (string).",
  func: async (args: string, runManager?: CallbackManagerForToolRun): Promise<string> => {
    try {
      const userId = getCurrentUserId();
      console.log(`[TOOL CONTEXT] User ID: ${userId}`);
      const params = JSON.parse(args);
      if (!params.messageId) {
        throw new Error("Missing required field (messageId)");
      }
      console.log(`[TOOL EXECUTE] read_gmail_message with params: ${JSON.stringify(params)}`);
      const result = await readEmail(userId, {
        messageId: params.messageId
      });
      
      if (!result.success) {
        const errorMessage = result.code === "NO_GOOGLE_ACCOUNT" 
          ? "Your Gmail account is not connected. Please connect your Google account to use Gmail features."
          : result.code === "INVALID_TOKEN"
          ? "Your Google account needs to be reconnected. Please go to Settings and reconnect your Google account."
          : result.error || "Error reading email";
          
        return JSON.stringify({
          success: false,
          error: errorMessage,
          code: result.code
        });
      }
      
      return JSON.stringify(result);
    } catch (error: any) {
      console.error(`[TOOL ERROR] read_gmail_message: ${error.message}`);
      return JSON.stringify({ 
        success: false, 
        error: error.message || "Error reading email",
        code: "INTERNAL_ERROR"
      });
    }
  }
});

// Create Gmail send tool
export const getGmailSendTool = (getCurrentUserId: () => string) => new DynamicTool({
  name: "send_gmail_message",
  description: "Sends an email using Gmail. Required parameters: to (string), subject (string), body (string). Optional parameters: cc (string), bcc (string).",
  func: async (args: string, runManager?: CallbackManagerForToolRun): Promise<string> => {
    try {
      const userId = getCurrentUserId();
      console.log(`[TOOL CONTEXT] User ID: ${userId}`);
      const params = JSON.parse(args);
      if (!params.to || !params.subject || !params.body) {
        throw new Error("Missing required fields (to, subject, body)");
      }
      console.log(`[TOOL EXECUTE] send_gmail_message with params: ${JSON.stringify(params)}`);
      const result = await sendEmail(userId, {
        to: params.to,
        subject: params.subject,
        body: params.body,
        cc: params.cc,
        bcc: params.bcc
      });
      
      if (!result.success) {
        const errorMessage = result.code === "NO_GOOGLE_ACCOUNT" 
          ? "Your Gmail account is not connected. Please connect your Google account to use Gmail features."
          : result.code === "INVALID_TOKEN"
          ? "Your Google account needs to be reconnected. Please go to Settings and reconnect your Google account."
          : result.error || "Error sending email";
          
        return JSON.stringify({
          success: false,
          error: errorMessage,
          code: result.code
        });
      }
      
      return JSON.stringify(result);
    } catch (error: any) {
      console.error(`[TOOL ERROR] send_gmail_message: ${error.message}`);
      return JSON.stringify({ 
        success: false, 
        error: error.message || "Error sending email",
        code: "INTERNAL_ERROR"
      });
    }
  }
}); 