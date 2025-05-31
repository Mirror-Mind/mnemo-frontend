'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from 'date-fns';

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

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await fetch('/api/gmail/recent');
        if (!response.ok) {
          throw new Error('Failed to fetch emails');
        }
        const data = await response.json();
        if (data.success) {
          setEmails(data.data);
        } else {
          setError(data.error || 'Failed to fetch emails');
        }
      } catch (err) {
        setError('Error loading emails');
        console.error('Error fetching emails:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

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

  if (error) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Recent Emails</CardTitle>
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
        <CardTitle>Recent Emails</CardTitle>
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
                const date = new Date(email.date);

                return (
                  <div key={email.id} className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10">
                      <div className="bg-primary text-primary-foreground rounded-full h-full w-full flex items-center justify-center text-sm font-medium">
                        {initials}
                      </div>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium leading-none">{senderName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(date, { addSuffix: true })}
                        </p>
                      </div>
                      <p className="text-sm font-medium">{email.subject}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{email.snippet}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
} 