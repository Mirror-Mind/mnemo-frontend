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
    console.error("Google authentication error:", error);
    
    // Handle specific better-auth errors
    if (error.message?.includes("No account found")) {
      throw new Error("No Google account connected");
    }
    
    throw error;
  }
}

// List calendar events for a user
export async function listCalendarEvents(userId: string, maxResults: number = 10) {
  try {
    console.log(`[CALENDAR] Listing events for user: ${userId}, max: ${maxResults}`);
    
    // Get authenticated client
    const oauth2Client = await getGoogleAuthClient(userId);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Fetch events
    const events = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });
    
    
    return { 
      success: true, 
      data: events.data.items 
    };
  } catch (error: any) {
    console.error(`[CALENDAR ERROR] List events: ${error.message}`);
    
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
      error: "Failed to fetch calendar events",
      details: error.message,
      code: "CALENDAR_ERROR"
    };
  }
}

// Create a new calendar event
export async function createCalendarEvent(
  userId: string, 
  params: {
    summary: string;
    description?: string;
    start: string;
    end: string;
    attendees?: string[];
  }
) {
  try {
    console.log(`[CALENDAR] Creating event for user: ${userId}`);
    console.log(`[CALENDAR] Event details: ${JSON.stringify(params)}`);
    
    // Validate date formats
    try {
      new Date(params.start);
      new Date(params.end);
    } catch (e) {
      throw new Error("Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS+00:00)");
    }
    
    // Get authenticated client
    const oauth2Client = await getGoogleAuthClient(userId);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Format event data
    const event = {
      summary: params.summary,
      description: params.description || '',
      start: {
        dateTime: params.start,
        timeZone: 'Etc/UTC', // Use standard timezone
      },
      end: {
        dateTime: params.end,
        timeZone: 'Etc/UTC', // Use standard timezone
      },
      attendees: (params.attendees || []).map(email => ({ email })),
    };
    
    // Create event
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    
    console.log(`[CALENDAR] Event created with ID: ${response.data.id}`);
    
    return { 
      success: true, 
      data: response.data 
    };
  } catch (error: any) {
    console.error(`[CALENDAR ERROR] Create event: ${error.message}`);
    
    if (error.message.includes("No Google account")) {
      return { 
        success: false, 
        error: "No Google account connected",
        code: "NO_GOOGLE_ACCOUNT"
      };
    }
    
    if (error.message.includes("Invalid date format")) {
      return { 
        success: false, 
        error: error.message,
        code: "INVALID_DATE_FORMAT"
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
      error: "Failed to create calendar event",
      details: error.message,
      code: "CALENDAR_ERROR"
    };
  }
}

// Helper function to log tool calls
const logToolCall = (toolName: string, args: any, result: any) => {
  console.log(`[TOOL CALL] ${toolName}`);
  console.log(`[TOOL ARGS] ${JSON.stringify(args, null, 2)}`);
  console.log(`[TOOL RESPONSE] ${JSON.stringify(result, null, 2)}`);
};

// Delete a calendar event
export async function deleteCalendarEvent(
  userId: string,
  params: {
    eventId: string;
  }
) {
  try {
    console.log(`[CALENDAR] Deleting event for user: ${userId}`);
    console.log(`[CALENDAR] Event ID: ${params.eventId}`);
    
    // Get authenticated client
    const oauth2Client = await getGoogleAuthClient(userId);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Delete the event
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: params.eventId
    });
    
    console.log(`[CALENDAR] Event with ID: ${params.eventId} deleted successfully`);
    
    return { 
      success: true, 
      message: `Event successfully deleted`
    };
  } catch (error: any) {
    console.error(`[CALENDAR ERROR] Delete event: ${error.message}`);
    
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
    
    if (error.message.includes("Not Found")) {
      return { 
        success: false, 
        error: "Event not found",
        code: "EVENT_NOT_FOUND"
      };
    }
    
    return { 
      success: false, 
      error: "Failed to delete calendar event",
      details: error.message,
      code: "CALENDAR_ERROR"
    };
  }
}

// Create calendar list tool
export const getCalendarListTool = (getCurrentUserId: () => string) => new DynamicTool({
  name: "list_calendar_events",
  description: "Lists upcoming events from the user's Google Calendar. Accepts an optional maxResults parameter (number).",
  func: async (args: string, runManager?: CallbackManagerForToolRun): Promise<string> => {
    try {
      // Use the current user ID from the request context
      const userId = getCurrentUserId();
      console.log(`[TOOL CONTEXT] User ID: ${userId}`);
      let params = { maxResults: 10 };
      if (args && args.trim()) {
        params = JSON.parse(args);
      }
      console.log(`[TOOL EXECUTE] list_calendar_events with params: ${JSON.stringify(params)}`);
      const result = await listCalendarEvents(userId, params.maxResults);
      if (!result.success) {
        const errorMessage = result.code === "NO_GOOGLE_ACCOUNT" 
          ? "Your Google Calendar is not connected. Please connect your Google account to use calendar features."
          : result.code === "INVALID_TOKEN"
          ? "Your Google account needs to be reconnected. Please go to Settings and reconnect your Google account."
          : result.error || "Error listing calendar events";
          
        return JSON.stringify({
          success: false,
          error: errorMessage,
          code: result.code
        });
      }
      
      return JSON.stringify(result);
    } catch (error: any) {
      console.error(`[TOOL ERROR] list_calendar_events: ${error.message}`);
      return JSON.stringify({ 
        success: false, 
        error: error.message || "Error listing calendar events",
        code: "INTERNAL_ERROR"
      });
    }
  }
});

// Create calendar event tool
export const getCalendarCreateTool = (getCurrentUserId: () => string) => new DynamicTool({
  name: "create_calendar_event",
  description: "Creates a new event in the user's Google Calendar. Required parameters: summary (string), start (ISO date string), end (ISO date string). Optional parameters: description (string), attendees (array of email strings).",
  func: async (args: string, runManager?: CallbackManagerForToolRun): Promise<string> => {
    try {
      const userId = getCurrentUserId();
      console.log(`[TOOL CONTEXT] User ID: ${userId}`);
      const params = JSON.parse(args);
      if (!params.summary || !params.start || !params.end) {
        throw new Error("Missing required fields (summary, start, end)");
      }
      console.log(`[TOOL EXECUTE] create_calendar_event with params: ${JSON.stringify(params)}`);
      const result = await createCalendarEvent(userId, {
        summary: params.summary,
        description: params.description || '',
        start: params.start,
        end: params.end,
        attendees: params.attendees || []
      });
      logToolCall("create_calendar_event", params, result);
      
      if (!result.success) {
        const errorMessage = result.code === "NO_GOOGLE_ACCOUNT" 
          ? "Your Google Calendar is not connected. Please connect your Google account to use calendar features."
          : result.code === "INVALID_TOKEN"
          ? "Your Google account needs to be reconnected. Please go to Settings and reconnect your Google account."
          : result.code === "INVALID_DATE_FORMAT"
          ? "Invalid date format. Please use ISO format (YYYY-MM-DDTHH:MM:SS+00:00)."
          : result.error || "Error creating calendar event";
          
        return JSON.stringify({
          success: false,
          error: errorMessage,
          code: result.code
        });
      }
      
      return JSON.stringify(result);
    } catch (error: any) {
      console.error(`[TOOL ERROR] create_calendar_event: ${error.message}`);
      return JSON.stringify({ 
        success: false, 
        error: error.message || "Error creating calendar event",
        code: "INTERNAL_ERROR"
      });
    }
  }
});

// Delete calendar event tool
export const getCalendarDeleteTool = (getCurrentUserId: () => string) => new DynamicTool({
  name: "delete_calendar_event",
  description: "Deletes an event from the user's Google Calendar. Required parameter: eventId (string).",
  func: async (args: string, runManager?: CallbackManagerForToolRun): Promise<string> => {
    try {
      const userId = getCurrentUserId();
      console.log(`[TOOL CONTEXT] User ID: ${userId}`);
      const params = JSON.parse(args);
      if (!params.eventId) {
        throw new Error("Missing required field (eventId)");
      }
      console.log(`[TOOL EXECUTE] delete_calendar_event with params: ${JSON.stringify(params)}`);
      const result = await deleteCalendarEvent(userId, {
        eventId: params.eventId
      });
      logToolCall("delete_calendar_event", params, result);
      
      if (!result.success) {
        const errorMessage = result.code === "NO_GOOGLE_ACCOUNT" 
          ? "Your Google Calendar is not connected. Please connect your Google account to use calendar features."
          : result.code === "INVALID_TOKEN"
          ? "Your Google account needs to be reconnected. Please go to Settings and reconnect your Google account."
          : result.code === "EVENT_NOT_FOUND"
          ? "The event you're trying to delete could not be found in your calendar."
          : result.error || "Error deleting calendar event";
          
        return JSON.stringify({
          success: false,
          error: errorMessage,
          code: result.code
        });
      }
      
      return JSON.stringify(result);
    } catch (error: any) {
      console.error(`[TOOL ERROR] delete_calendar_event: ${error.message}`);
      return JSON.stringify({ 
        success: false, 
        error: error.message || "Error deleting calendar event",
        code: "INTERNAL_ERROR"
      });
    }
  }
}); 