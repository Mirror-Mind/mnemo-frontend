"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { File, ExternalLink, AlertCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface Document {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink: string;
}

export function RecentDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setNeedsPermission(false);
      
      const response = await fetch("/api/documents");
      
      if (!response.ok) {
        let errorMessage = `Failed to fetch documents (${response.status})`;
        let errorCode = '';
        
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
          if (errorData.code) {
            errorCode = errorData.code;
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }
        
        // Check if this is a permission error
        if (errorCode === 'NO_GOOGLE_ACCOUNT' || errorCode === 'INVALID_TOKEN' || 
            errorMessage.includes("No Google account") || errorMessage.includes("reconnect")) {
          setNeedsPermission(true);
          setError("Please connect your Google account to access documents");
        } else {
          throw new Error(errorMessage);
        }
        return;
      }

      try {
        const data = await response.json();
        setDocuments(data.documents || []);
      } catch (parseError) {
        throw new Error("Invalid data format received from server");
      }
    } catch (err) {
      setError((err as Error).message || "Could not load documents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleConnectGoogle = async () => {
    try {
      setIsConnecting(true);
      await authClient.linkSocial({
        provider: "google",
        callbackURL: window.location.href,
        fetchOptions: {
          onSuccess: () => {
            // Refresh the documents data after successful connection
            fetchDocuments();
          },
          onError: (ctx) => {
            setError(ctx.error?.message || "Failed to connect Google account");
            setIsConnecting(false);
          }
        }
      });
    } catch (err: any) {
      setError(err.message || "Failed to connect Google account");
      setIsConnecting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-medium flex items-center">
          <File className="h-4 w-4 mr-2" />
          Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center py-3 text-sm text-muted-foreground">Loading...</div>
        ) : needsPermission ? (
          <div className="p-4 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
            <div>
              <p className="text-sm font-medium text-slate-700">Documents Access Needed</p>
              <p className="text-xs text-slate-500 mt-1">Please give permissions for documents to view your files</p>
            </div>
            <Button 
              size="sm" 
              onClick={handleConnectGoogle}
              disabled={isConnecting}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {isConnecting ? "Connecting..." : "Connect Google"}
            </Button>
          </div>
        ) : error ? (
          <div className="p-3 text-xs text-red-500">{error}</div>
        ) : documents.length === 0 ? (
          <div className="py-3 px-4 text-xs text-muted-foreground">No documents found</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {documents.map((doc) => (
              <div key={doc.id} className="py-2 px-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="truncate">
                    <h3 className="text-xs font-medium truncate">{doc.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(doc.modifiedTime)}
                    </p>
                  </div>
                  <a 
                    href={doc.webViewLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                    title="Open Document"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 