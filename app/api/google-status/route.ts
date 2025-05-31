import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    // If no session, return unauthenticated response
    if (!session?.user) {
      return NextResponse.json({ 
        authenticated: false,
        googleConnected: false,
        error: "No authenticated session" 
      });
    }

    try {
      // Use better-auth's getAccessToken API to check for valid Google tokens
      const { accessToken } = await auth.api.getAccessToken({
        body: {
          providerId: "google",
          userId: session.user.id
        }
      });

      if (!accessToken) {
        return NextResponse.json({
          authenticated: true,
          googleConnected: false,
          tokenStatus: "missing",
          error: "Google account not connected or token invalid",
          action: "connect",
          connectUrl: "/api/auth/signin/google"
        });
      }

      // Get account details for scopes
      const googleAccount = await prisma.account.findFirst({
        where: {
          userId: session.user.id,
          providerId: "google"
        }
      });

      // Return success with scopes
      return NextResponse.json({
        authenticated: true,
        googleConnected: true,
        tokenStatus: "valid",
        scopes: googleAccount?.scope?.split(" ") || []
      });

    } catch (tokenError: any) {
      // Handle specific better-auth errors
      if (tokenError.message?.includes("No account found")) {
        return NextResponse.json({
          authenticated: true,
          googleConnected: false,
          tokenStatus: "missing", 
          error: "Google account not connected",
          action: "connect",
          connectUrl: "/api/auth/signin/google"
        });
      }

      // Other token errors (expired, invalid, etc.)
      return NextResponse.json({
        authenticated: true,
        googleConnected: true,
        tokenStatus: "invalid",
        error: "Google access token is invalid or expired",
        action: "reconnect",
        connectUrl: "/api/auth/signin/google"
      });
    }
    
  } catch (error: any) {
    console.error("Google status check error:", error);
    return NextResponse.json({ 
      authenticated: false,
      googleConnected: false,
      tokenStatus: "unknown_error",
      error: "Failed to check Google status",
      errorDetails: error.message
    }, { 
      status: 500 
    });
  }
} 