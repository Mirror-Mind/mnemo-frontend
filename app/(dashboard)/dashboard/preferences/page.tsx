"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  IconCheck,
  IconBell,
  IconSettings,
  IconTrendingUp,
  IconSunHigh,
  IconBolt,
  IconBook,
  IconChartLine,
  IconAlertCircle,
  IconLoader,
} from "@tabler/icons-react";
import { getUserPreferencesAction, updateUserPreferencesAction } from "../providers/actions";

export default function PreferencesPage() {
  const [preferences, setPreferences] = useState<any>({});
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const executiveCapabilities = [
    {
      id: "daily-briefings",
      label: "Daily Executive Briefings",
      icon: IconSunHigh,
      description: "Get comprehensive morning briefings with key insights",
    },
    { 
      id: "meeting-prep", 
      label: "Automated Meeting Prep", 
      icon: IconBolt,
      description: "Automatic preparation for upcoming meetings",
    },
    {
      id: "smart-reminders",
      label: "Smart Priority Reminders",
      icon: IconBell,
      description: "Intelligent reminders based on priorities",
    },
    { 
      id: "vc-updates", 
      label: "VC & Funding Intelligence", 
      icon: IconTrendingUp,
      description: "Stay updated on funding and VC activities",
    },
    {
      id: "market-insights",
      label: "Market & Competitor Insights",
      icon: IconChartLine,
      description: "Regular market analysis and competitor tracking",
    },
    {
      id: "executive-memory",
      label: "Executive Memory & Context",
      icon: IconBook,
      description: "Maintain context across conversations and meetings",
    },
  ];

  // Load preferences on component mount
  useEffect(() => {
    async function loadPreferences() {
      try {
        const result = await getUserPreferencesAction();
        if (result.success && result.data) {
          setPreferences(result.data);
        } else if (result.failure) {
          setError(result.failure);
        }
      } catch (err) {
        setError("Failed to load preferences");
      } finally {
        setLoading(false);
      }
    }
    
    loadPreferences();
  }, []);

  const handleCapabilityToggle = (capabilityId: string) => {
    setPreferences((prev: any) => ({
      ...prev,
      capabilities: {
        ...prev.capabilities,
        [capabilityId]: !prev.capabilities?.[capabilityId],
      },
    }));
  };

  const handleCommunicationChange = (field: string, value: string) => {
    setPreferences((prev: any) => ({
      ...prev,
      communicationSettings: {
        ...prev.communicationSettings,
        [field]: value,
      },
    }));
  };

  const handleFocusHoursChange = (field: string, value: string) => {
    setPreferences((prev: any) => ({
      ...prev,
      communicationSettings: {
        ...prev.communicationSettings,
        focusHours: {
          ...prev.communicationSettings?.focusHours,
          [field]: value,
        },
      },
    }));
  };

  const savePreferences = () => {
    setError(null);
    setSuccessMessage(null);
    
    startTransition(async () => {
      try {
        const result = await updateUserPreferencesAction({ preferences });
        
        if (result.success) {
          setSuccessMessage("Preferences updated successfully!");
          setTimeout(() => setSuccessMessage(null), 3000);
        } else if (result.failure) {
          setError(result.failure);
        }
      } catch (err) {
        setError("Failed to save preferences");
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50/30 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-amber-600">
          <IconLoader className="h-6 w-6 animate-spin" />
          <span className="text-lg">Loading preferences...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50/30 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 mx-auto bg-amber-50 rounded-full flex items-center justify-center border border-amber-200/50 shadow-sm">
            <IconSettings className="h-8 w-8 text-amber-600" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-800">Executive Preferences</h1>
            <p className="text-lg text-slate-600 mt-2">
              Customize your AI Executive Assistant to match your leadership style
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <IconAlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {successMessage && (
          <Alert variant="default" className="border-green-200 bg-green-50">
            <IconCheck className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        <Card className="border border-stone-200 bg-white/90 backdrop-blur-sm shadow-lg">
          <CardHeader className="border-b border-stone-100">
            <CardTitle className="text-2xl font-semibold text-slate-800">
              Executive Capabilities
            </CardTitle>
            <CardDescription className="text-slate-600 text-lg">
              Choose which AI assistant features are active for your leadership needs
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {executiveCapabilities.map((capability) => (
              <div
                key={capability.id}
                className="flex items-center justify-between p-6 border border-stone-200 rounded-xl hover:bg-stone-50 transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <capability.icon className="h-6 w-6 text-amber-600" />
                  <div>
                    <Label
                      htmlFor={capability.id}
                      className="text-lg font-medium text-slate-700 cursor-pointer"
                    >
                      {capability.label}
                    </Label>
                    <p className="text-sm text-slate-500 mt-1">{capability.description}</p>
                  </div>
                </div>
                <Checkbox 
                  id={capability.id} 
                  checked={preferences.capabilities?.[capability.id] || false}
                  onCheckedChange={() => handleCapabilityToggle(capability.id)}
                  className="h-5 w-5"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-stone-200 bg-white/90 backdrop-blur-sm shadow-lg">
          <CardHeader className="border-b border-stone-100">
            <CardTitle className="text-2xl font-semibold text-slate-800">
              Communication Preferences
            </CardTitle>
            <CardDescription className="text-slate-600 text-lg">
              Control how and when Mnemo communicates with you
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="space-y-4">
              <Label className="text-lg text-slate-700 font-medium">
                Briefing Schedule
              </Label>
              <Select 
                value={preferences.communicationSettings?.briefingSchedule || "daily-morning"}
                onValueChange={(value) => handleCommunicationChange("briefingSchedule", value)}
              >
                <SelectTrigger className="h-12 border border-slate-300 focus:border-amber-500 focus:ring-amber-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily-morning">Daily at 7:00 AM</SelectItem>
                  <SelectItem value="daily-evening">Daily at 6:00 PM</SelectItem>
                  <SelectItem value="twice-daily">
                    Twice daily (7 AM & 6 PM)
                  </SelectItem>
                  <SelectItem value="weekly">Weekly summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-lg text-slate-700 font-medium">
                Executive Focus Hours
              </Label>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm text-slate-500">
                    No interruptions from
                  </Label>
                  <Input
                    type="time"
                    value={preferences.communicationSettings?.focusHours?.start || "09:00"}
                    onChange={(e) => handleFocusHoursChange("start", e.target.value)}
                    className="h-12 border border-slate-300 focus:border-amber-500 focus:ring-amber-500 mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm text-slate-500">Until</Label>
                  <Input
                    type="time"
                    value={preferences.communicationSettings?.focusHours?.end || "11:00"}
                    onChange={(e) => handleFocusHoursChange("end", e.target.value)}
                    className="h-12 border border-slate-300 focus:border-amber-500 focus:ring-amber-500 mt-2"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-lg text-slate-700 font-medium">
                Meeting Prep Timing
              </Label>
              <Select 
                value={preferences.communicationSettings?.meetingPrepTiming || "30min"}
                onValueChange={(value) => handleCommunicationChange("meetingPrepTiming", value)}
              >
                <SelectTrigger className="h-12 border border-slate-300 focus:border-amber-500 focus:ring-amber-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15min">15 minutes before</SelectItem>
                  <SelectItem value="30min">30 minutes before</SelectItem>
                  <SelectItem value="1hour">1 hour before</SelectItem>
                  <SelectItem value="2hours">2 hours before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center pb-8">
          <Button
            onClick={savePreferences}
            disabled={isPending}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            {isPending ? (
              <>
                <IconLoader className="mr-3 h-5 w-5 animate-spin" />
                Saving Preferences...
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 