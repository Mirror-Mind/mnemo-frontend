import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as googleCalendar from "@/lib/agents/tools/googleCalendar";

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
    
    const userId = session.user.id;
    
    // Fetch calendar events directly
    const result = await googleCalendar.listCalendarEvents(userId, 10);
    
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
      events: result.data
    });
  } catch (error: any) {
    console.error("Calendar API error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch calendar events",
      message: error.message,
      code: "INTERNAL_ERROR" 
    }, { status: 500 });
  }
}

// Add POST endpoint to create events
export async function POST(request: NextRequest) {
  try {
    // Get the user session
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ 
        error: "No authenticated session",
        code: "UNAUTHENTICATED" 
      }, { status: 401 });
    }
    
    // Parse the request body
    const body = await request.json();
    const { summary, description, start, end, attendees } = body;
    
    // Validate required fields
    if (!summary || !start || !end) {
      return NextResponse.json({ 
        error: "Missing required fields",
        code: "INVALID_REQUEST",
        fields: {
          summary: !summary ? "Missing event summary" : null,
          start: !start ? "Missing event start time" : null,
          end: !end ? "Missing event end time" : null
        }
      }, { status: 400 });
    }
    
    const userId = session.user.id;
    
    // Create calendar event directly
    const result = await googleCalendar.createCalendarEvent(userId, {
      summary,
      description: description || '',
      start,
      end,
      attendees: attendees || []
    });
    
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
      
      if (result.code === "INVALID_DATE_FORMAT") {
        return NextResponse.json({ 
          error: result.error,
          code: result.code
        }, { status: 400 });
      }
      
      return NextResponse.json({ 
        error: result.error,
        details: result.details,
        code: result.code
      }, { status: 500 });
    }
    
    return NextResponse.json({
      event: result.data
    });
  } catch (error: any) {
    console.error("Calendar API error:", error);
    return NextResponse.json({ 
      error: "Failed to create calendar event",
      message: error.message,
      code: "INTERNAL_ERROR" 
    }, { status: 500 });
  }
} 