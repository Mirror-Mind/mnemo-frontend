import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get all threads from the database
    const userThreads = await prisma.userThread.findMany({
      select: {
        userId: true,
        threadId: true,
      }
    });
    
    const threadSummary = userThreads.map(userThread => ({
      userId: userThread.userId,
      threadId: userThread.threadId,
      memoryType: 'thread'
    }));
    
    return NextResponse.json({
      message: "User thread summary",
      count: threadSummary.length,
      users: threadSummary
    }, { status: 200 });
  } catch (error) {
    console.error("[API] Error retrieving user list:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: "Failed to retrieve user list", details: errorMessage },
      { status: 500 }
    );
  }
} 