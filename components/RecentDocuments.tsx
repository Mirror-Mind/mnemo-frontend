"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { File, ExternalLink } from "lucide-react";

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

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch("/api/documents");
        
        if (!response.ok) {
          let errorMessage = `Failed to fetch documents (${response.status})`;
          try {
            const errorData = await response.json();
            if (errorData.error) {
              errorMessage = errorData.error;
            }
          } catch (parseError) {
            console.error("Error parsing error response:", parseError);
          }
          throw new Error(errorMessage);
        }

        try {
          const data = await response.json();
          setDocuments(data.documents || []);
        } catch (parseError) {
          throw new Error("Invalid data format received from server");
        }
      } catch (err) {
        setError(err.message || "Could not load documents");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

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