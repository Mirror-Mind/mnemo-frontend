"use client";

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IconLoader, IconBrain, IconRefresh, IconSearch } from '@tabler/icons-react';
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

export function MemoryGraph() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState('');
  const fgRef = useRef<unknown>(null);

  const fetchMemoryGraph = async (targetUserId: string) => {
    if (!targetUserId.trim()) {
      setError('Please enter a user ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/memory-graph/${encodeURIComponent(targetUserId)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch memory graph');
      }

      const data = await response.json();
      setGraphData(data);
      
      // Center the graph after data loads
      setTimeout(() => {
        if (fgRef.current) {
          fgRef.current.zoomToFit(400);
        }
      }, 100);
    } catch (err) {
      console.error('Error fetching memory graph:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch memory graph');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchMemoryGraph(userId);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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
              Visualize the memory map and connections for a specific user
            </CardDescription>
          </div>
        </div>
        
        {/* Search Section */}
        <div className="flex items-end gap-4 mt-4">
          <div className="flex-1">
            <Label htmlFor="userId" className="text-sm font-medium text-slate-700">
              User ID
            </Label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter user ID to visualize their memory graph"
              className="mt-1"
            />
          </div>
          <Button 
            onClick={handleSearch}
            disabled={loading || !userId.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <IconLoader className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <IconSearch className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Loading...' : 'Visualize'}
          </Button>
          {graphData.nodes.length > 0 && (
            <Button 
              variant="outline"
              onClick={() => fetchMemoryGraph(userId)}
              disabled={loading}
            >
              <IconRefresh className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
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
              <p className="text-slate-600">Loading memory graph...</p>
            </div>
          </div>
        )}
        
        {!loading && !error && graphData.nodes.length === 0 && userId && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <IconBrain className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">No Memory Data Found</h3>
              <p className="text-slate-500">
                No memory graph data found for user &quot;{userId}&quot;. 
                <br />
                Try a different user ID or check if the user has any memories stored.
              </p>
            </div>
          </div>
        )}
        
        {!loading && !error && graphData.nodes.length === 0 && !userId && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <IconBrain className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-700 mb-2">Memory Graph Visualization</h3>
              <p className="text-slate-500">
                Enter a user ID above to visualize their memory connections and relationships.
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
                  fgRef.current.canvas().style.cursor = node ? 'pointer' : 'default';
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
          </div>
        )}
      </CardContent>
    </Card>
  );
} 