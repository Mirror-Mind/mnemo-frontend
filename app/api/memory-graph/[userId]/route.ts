import { NextRequest, NextResponse } from 'next/server';
import { neo4jService } from '@/lib/neo4j';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const graphData = await neo4jService.getMemoryGraphForUser(userId);
    
    return NextResponse.json(graphData);
  } catch (error) {
    console.error('Error fetching memory graph:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memory graph' },
      { status: 500 }
    );
  }
} 