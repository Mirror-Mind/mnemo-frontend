import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { listEmails } from "@/lib/agents/tools/gmail";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json(
        { error: "No authenticated session", code: "UNAUTHENTICATED" },
        { status: 401 }
      );
    }

    const result = await listEmails(session.user.id, {
      maxResults: 10,
      labelIds: ['INBOX']
    });

    if (!result.success) {
      // Handle specific error codes from listEmails if they exist
      // Based on the calendar example, we might expect codes like NO_GOOGLE_ACCOUNT or INVALID_TOKEN
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

      // Default error for other cases
      return NextResponse.json(
        { 
          error: result.error || 'Failed to fetch emails',
          code: result.code || 'EMAIL_FETCH_ERROR'
        },
        { status: 400 } // Assuming other listEmails errors are bad requests
      );
    }

    return NextResponse.json({ emails: result.data });
  } catch (error: any) {
    console.error('Error in /api/gmail/recent:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
} 