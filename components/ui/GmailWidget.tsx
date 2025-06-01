'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Mail } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { authClient } from "@/lib/auth-client";

interface Email {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  date: string;
  snippet: string;
}

export function GmailWidget() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError(null);
      setNeedsPermission(false);
      
      const response = await fetch('/api/gmail/recent');
      
      if (!response.ok) {
        let errorMessage = `Failed to fetch emails (${response.status})`;
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
          setError("Please connect your Google account to access emails");
        } else {
          throw new Error(errorMessage);
        }
        return;
      }
      
      const data = await response.json();
      if (data.emails) {
        setEmails(data.emails);
      } else {
        setError(data.error || 'Failed to fetch emails');
      }
    } catch (err) {
      setError((err as Error).message || 'Error loading emails');
      console.error('Error fetching emails:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleConnectGoogle = async () => {
    try {
      setIsConnecting(true);
      await authClient.linkSocial({
        provider: "google",
        callbackURL: window.location.href,
        fetchOptions: {
          onSuccess: () => {
            // Refresh the emails data after successful connection
            fetchEmails();
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

  // Extract sender name from email address
  const getSenderName = (from: string) => {
    const match = from.match(/^"?([^"<]+)"?\s*(?:<[^>]+>)?$/);
    return match ? match[1].trim() : from;
  };

  // Get sender initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (needsPermission) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-4 w-4 mr-2" />
            Recent Emails
          </CardTitle>
          <CardDescription>Your recent Gmail messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
            <div>
              <p className="text-sm font-medium text-slate-700">Email Access Needed</p>
              <p className="text-xs text-slate-500 mt-1">Please give permissions for emails to view your messages</p>
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
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-4 w-4 mr-2" />
            Recent Emails
          </CardTitle>
          <CardDescription>Your recent Gmail messages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="h-4 w-4 mr-2" />
          Recent Emails
        </CardTitle>
        <CardDescription>Your recent Gmail messages</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            // Loading skeletons
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-start space-x-4 mb-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))
          ) : (
            <div className="space-y-4">
              {emails.map((email) => {
                const senderName = getSenderName(email.from);
                const initials = getInitials(senderName);
                
                return (
                  <div key={email.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <Avatar className="h-10 w-10">
                      <div className="h-full w-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-medium">
                        {initials}
                      </div>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {senderName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(email.date), { addSuffix: true })}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700 font-medium truncate">
                        {email.subject}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {email.snippet}
                      </p>
                    </div>
                  </div>
                );
              })}
              {emails.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent emails found</p>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 