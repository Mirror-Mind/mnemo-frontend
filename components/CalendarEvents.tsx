"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ExternalLink, AlertCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime: string;
    date?: string;
  };
  end: {
    dateTime: string;
    date?: string;
  };
  htmlLink: string;
}

export function CalendarEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const fetchCalendarEvents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setNeedsPermission(false);
      
      const response = await fetch("/api/calendar");
      
      if (!response.ok) {
        let errorMessage = `Failed to fetch calendar events (${response.status})`;
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
          setError("Please connect your Google account to access calendar");
        } else {
          throw new Error(errorMessage);
        }
        return;
      }

      try {
        const data = await response.json();
        setEvents(data.events || []);
      } catch (parseError) {
        throw new Error("Invalid data format received from server");
      }
    } catch (err) {
      setError((err as Error).message || "Could not load calendar events");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarEvents();
  }, []);

  const handleConnectGoogle = async () => {
    try {
      setIsConnecting(true);
      await authClient.linkSocial({
        provider: "google",
        callbackURL: window.location.href,
        fetchOptions: {
          onSuccess: () => {
            // Refresh the calendar data after successful connection
            fetchCalendarEvents();
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
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm font-medium flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center py-3 text-sm text-muted-foreground">Loading...</div>
        ) : needsPermission ? (
          <div className="p-4 text-center space-y-3">
            <AlertCircle className="h-8 w-8 text-amber-500 mx-auto" />
            <div>
              <p className="text-sm font-medium text-slate-700">Calendar Access Needed</p>
              <p className="text-xs text-slate-500 mt-1">Please give permissions for calendar to view your events</p>
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
        ) : events.length === 0 ? (
          <div className="py-3 px-4 text-xs text-muted-foreground">No upcoming events</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {events.slice(0, 5).map((event) => (
              <div key={event.id} className="py-2 px-4 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="truncate">
                    <h3 className="text-xs font-medium truncate">{event.summary}</h3>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(event.start.dateTime || event.start.date || "")}
                    </p>
                  </div>
                  <a 
                    href={event.htmlLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700"
                    title="View in Calendar"
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