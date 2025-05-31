import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { RunnableConfig } from "@langchain/core/runnables";

const prisma = new PrismaClient();
const memorySaver = PostgresSaver.fromConnString(process.env.DATABASE_URL || "");

interface Checkpoint {
  channel_values: {
    messages: any[];
    [key: string]: any;
  };
  [key: string]: any;
}

type CheckpointTuple = [Checkpoint, number];

// Initialize the checkpointer tables
memorySaver.setup().catch(error => {
  console.error("[THREAD API] Error setting up PostgresSaver:", error);
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    // Ensure params is properly awaited
    const { threadId } = await params;
    if (!threadId) {
      return Response.json(
        { error: 'Thread ID is required' },
        { status: 400 }
      );
    }

    // Get the thread from our database
    const userThread = await prisma.userThread.findFirst({
      where: { threadId }
    });

    if (!userThread) {
      return Response.json(
        { error: 'Thread not found' },
        { status: 404 }
      );
    }

    // Get the checkpoint from LangGraph
    const config: RunnableConfig = {
      configurable: { thread_id: threadId },
      metadata: {},
      tags: []
    };
    
    const result = await memorySaver.getTuple(config);
    if (!result) {
      return Response.json(
        { error: 'No checkpoint found for this thread' },
        { status: 404 }
      );
    }

    const checkpoint = result.checkpoint;
    // Extract messages from the checkpoint
    const messages = checkpoint?.channel_values?.messages || [];
    if (!Array.isArray(messages)) {
      return Response.json(
        { error: 'Invalid message format in checkpoint' },
        { status: 500 }
      );
    }

    return Response.json({
      threadId,
      messageCount: messages.length,
      messages: messages
    });
  } catch (error) {
    console.error('[THREAD API] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
