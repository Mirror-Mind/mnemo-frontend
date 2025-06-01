"use client";

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconLoader, IconBrain, IconRefresh } from '@tabler/icons-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Dynamically import ForceGraph2D to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false });

interface Node {
  id: string;
  name: string;
  type: 'user' | 'memory';
  properties: Record<string, unknown>;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

interface Link {
  source: string | Node;
  target: string | Node;
  type: string;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

interface MemoryGraphProps {
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
}

export function MemoryGraph({ user }: MemoryGraphProps) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fgRef = useRef<unknown>(null);

  const fetchMemoryGraph = async () => {
    if (!user?.id) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/memory-graph/${encodeURIComponent(user.id)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch memory graph');
      }

      const data = await response.json();
      setGraphData(data);
      
      // Center the graph after data loads
      setTimeout(() => {
        if (fgRef.current && (fgRef.current as any).zoomToFit) {
          (fgRef.current as any).zoomToFit(400);
        }
      }, 100);
    } catch (err) {
      console.error('Error fetching memory graph:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch memory graph');
    } finally {
      setLoading(false);
    }
  };

  // Load graph on component mount and when user changes
  useEffect(() => {
    fetchMemoryGraph();
  }, [user?.id]);

  const handleRefresh = () => {
    fetchMemoryGraph();
  };

  const getNodeColor = (node: Node) => {
    switch (node.type) {
      case 'user':
        return '#3b82f6'; // Blue for user
      case 'memory':
        return '#f59e0b'; // Amber for memory
      default:
        return '#6b7280'; // Gray for unknown
    }
  };

  const getNodeSize = (node: Node) => {
    return node.type === 'user' ? 12 : 8;
  };

  const getLinkColor = (link: Link) => {
    return '#94a3b8'; // Slate color for links
  };

  const getLinkWidth = (link: Link) => {
    return link.type === 'HAS_MEMORY' ? 3 : 1;
  };

  return (
    <Card className="border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 shadow-lg h-full">
      <CardHeader className="border-b border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                <IconBrain className="h-6 w-6 text-blue-600" />
              </div>
              Memory Graph
            </CardTitle>
            <CardDescription className="text-slate-600 mt-2">
              Your personal memory network and connections (2 hops)
            </CardDescription>
          </div>
          
          {/* Refresh Button */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="text-sm text-slate-600 text-right">
                <p className="font-medium">{user.name || user.email}</p>
                <p className="text-xs text-slate-500">User ID: {user.id}</p>
              </div>
            )}
            <Button 
              variant="outline"
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <IconRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 h-[600px]">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <IconLoader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-slate-600">Loading your memory graph...</p>
              <p className="text-sm text-slate-500 mt-1">Fetching nodes within 2 hops</p>
            </div>
          </div>
        )}
        
        {!loading && !error && graphData.nodes.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <IconBrain className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">No Memory Data Found</h3>
              <p className="text-slate-500">
                No memory graph data found for your account. 
                <br />
                Start using the AI assistant to build your memory network.
              </p>
            </div>
          </div>
        )}
        
        {!loading && !error && graphData.nodes.length > 0 && (
          <div className="h-full border border-slate-200 rounded-lg bg-white">
            <ForceGraph2D
              ref={fgRef}
              graphData={graphData}
              nodeColor={getNodeColor}
              nodeRelSize={6}
              nodeLabel={(node: Node) => `${node.name}\nType: ${node.type}\nID: ${node.id}`}
              linkColor={getLinkColor}
              linkWidth={getLinkWidth}
              linkLabel={(link: Link) => `Relationship: ${link.type}`}
              width={undefined}
              height={undefined}
              backgroundColor="white"
              nodeCanvasObject={(node: Node, ctx: CanvasRenderingContext2D, globalScale: number) => {
                const label = node.name.length > 20 ? node.name.substring(0, 20) + '...' : node.name;
                const fontSize = 12/globalScale;
                const nodeSize = getNodeSize(node);
                ctx.font = `${fontSize}px Sans-Serif`;
                
                // Draw node circle
                ctx.beginPath();
                ctx.arc(node.x!, node.y!, nodeSize, 0, 2 * Math.PI, false);
                ctx.fillStyle = getNodeColor(node);
                ctx.fill();
                
                // Draw label
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'black';
                ctx.fillText(label, node.x!, node.y! + nodeSize + fontSize);
              }}
              onNodeHover={(node: Node | null) => {
                if (fgRef.current) {
                  (fgRef.current as any).canvas().style.cursor = node ? 'pointer' : 'default';
                }
              }}
              onNodeClick={(node: Node) => {
                console.log('Node clicked:', node);
                // You can add more interaction logic here
              }}
            />
          </div>
        )}
        
        {/* Graph Stats */}
        {graphData.nodes.length > 0 && (
          <div className="mt-4 flex gap-4 text-sm text-slate-600">
            <span>Nodes: {graphData.nodes.length}</span>
            <span>Connections: {graphData.links.length}</span>
            <span>Memories: {graphData.nodes.filter(n => n.type === 'memory').length}</span>
            <span>Users: {graphData.nodes.filter(n => n.type === 'user').length}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 