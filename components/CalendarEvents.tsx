"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ExternalLink } from "lucide-react";

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

  useEffect(() => {
    const fetchCalendarEvents = async () => {
      try {
        const response = await fetch("/api/calendar");
        
        if (!response.ok) {
          let errorMessage = `Failed to fetch calendar events (${response.status})`;
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
          setEvents(data.events || []);
        } catch (parseError) {
          throw new Error("Invalid data format received from server");
        }
      } catch (err) {
        setError(err.message || "Could not load calendar events");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendarEvents();
  }, []);

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