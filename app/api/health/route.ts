import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Basic health check - can be expanded to check database, Redis, etc.
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || "unknown",
      services: {
        app: "running"
      }
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: "unhealthy", 
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 503 }
    );
  }
} 