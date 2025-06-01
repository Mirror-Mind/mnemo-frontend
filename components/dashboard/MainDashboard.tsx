"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CalendarEvents } from "@/components/CalendarEvents";
import { RecentDocuments } from "@/components/RecentDocuments";
import { GmailWidget } from "@/components/ui/GmailWidget";
import { ChatWindow } from "@/components/chatbot/ChatWindow";
import { Conversation } from "@/components/conversation";
// import { RealtimeVoiceAssistant } from "@/components/voice/RealtimeVoiceAssistant";
import { MemoryGraph } from "@/components/dashboard/MemoryGraph";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  IconBrandWhatsapp,
  IconCalendar,
  IconFiles,
  IconMessageCircle,
  IconCheck,
  IconMail,
  IconSettings,
  IconPlus,
  IconClock,
  IconBell,
  IconTrendingUp,
  IconSunHigh,
  IconBolt,
  IconBook,
  IconChartLine,
  IconAlertCircle,
  IconLoader,
  IconLogout,
  IconBrandLinkedin,
  IconMicrophone,
  IconMicrophoneOff,
  IconMessage,
  IconChartBar,
  IconSparkles,
  IconX,
  IconNews,
  IconRefresh,
} from "@tabler/icons-react";
import {
  getUserPreferencesAction,
  updateUserPreferencesAction,
} from "@/app/(dashboard)/dashboard/providers/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { authClient } from "@/lib/auth-client";
import { UserPreferences } from "@/lib/preferences";

// Interface for calendar events
interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
}

// Interface for document data
interface DocumentData {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink: string;
}

// Extended interface to handle textInput field
interface ExtendedUserPreferences extends UserPreferences {
  textInput?: string;
}

// Connected Integrations Section (Always Visible)
function ConnectedIntegrations() {
  const [session, setSession] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSession() {
      try {
        const { data, error } = await authClient.getSession();
        if (error) {
          setError(error.message || "Failed to fetch session");
          return;
        }
        setSession(data);
        if (data?.user && "accounts" in data.user) {
          const userAccounts = data.user.accounts;
          setAccounts(Array.isArray(userAccounts) ? userAccounts : []);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch session data");
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, []);

  const isProviderConnected = (providerId: string) => {
    return accounts.some((account) => account.providerId === providerId);
  };

  const handleUnlinkProvider = async (provider: string) => {
    try {
      setError(null);
      setSuccessMessage(null);
      setIsDisconnecting(provider);

      const account = accounts.find((acc) => acc.providerId === provider);
      if (!account) {
        throw new Error(`No account found for provider ${provider}`);
      }

      await authClient.unlinkAccount({
        providerId: provider,
      });

      // Refresh session data
      const { data } = await authClient.getSession();
      if (data?.user && "accounts" in data.user) {
        const userAccounts = data.user.accounts;
        setAccounts(Array.isArray(userAccounts) ? userAccounts : []);
        setSuccessMessage(`Successfully disconnected ${provider}`);
      }

      setIsDisconnecting(null);
    } catch (err: any) {
      console.error("Error unlinking account:", err);
      setError(err.message || `Failed to disconnect ${provider}`);
      setIsDisconnecting(null);
    }
  };

  const handleConnectProvider = async (provider: string) => {
    try {
      await authClient.linkSocial({
        provider: provider as any,
        callbackURL: window.location.href,
        fetchOptions: {
          onSuccess: () => {
            window.location.reload();
          },
          onError: (ctx) => {
            setError(ctx.error?.message || "Failed to connect account");
          },
        },
      });
    } catch (err: any) {
      setError(err.message || `Failed to connect ${provider}`);
    }
  };

  const integrations = [
    {
      name: "WhatsApp",
      providerId: "whatsapp",
      status: session?.user?.phoneNumber ? "connected" : "available",
      icon: "💬",
      description: "Primary communication channel",
      canDisconnect: false, // WhatsApp uses phone number, handled separately
    },
    {
      name: "Google Suite",
      providerId: "google",
      status: isProviderConnected("google") ? "connected" : "available",
      icon: "📅",
      description: "Calendar, Docs & Gmail integration",
      canDisconnect: true,
    },
    {
      name: "GitHub",
      providerId: "github",
      status: isProviderConnected("github") ? "connected" : "available",
      icon: "🐙",
      description: "Development activity monitoring",
      canDisconnect: true,
    },
    {
      name: "LinkedIn",
      providerId: "linkedin",
      status: isProviderConnected("linkedin") ? "connected" : "available",
      icon: "💼",
      description: "Professional network integration",
      canDisconnect: true,
    },
    {
      name: "Slack",
      providerId: "slack",
      status: "coming-soon",
      icon: "🔧",
      description: "Team communication integration",
      canDisconnect: false,
    },
    {
      name: "Jira",
      providerId: "jira",
      status: "coming-soon",
      icon: "📋",
      description: "Project management insights",
      canDisconnect: false,
    },
  ];

  if (loading) {
    return (
      <Card className="border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-50/50 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <IconLoader className="h-6 w-6 animate-spin text-amber-600" />
            <span className="ml-2 text-slate-600">Loading integrations...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-amber-50/50 shadow-lg">
      <CardHeader className="border-b border-amber-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center border border-amber-200">
                <IconCheck className="h-6 w-6 text-amber-600" />
              </div>
              Mnemo Connected
            </CardTitle>
            <CardDescription className="text-slate-600 mt-2">
              Your AI Executive Assistant is active with these integrations
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <IconAlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert
            variant="default"
            className="mb-4 border-green-200 bg-green-50"
          >
            <IconCheck className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {successMessage}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex items-center justify-between p-4 border border-stone-200 rounded-xl bg-white/80 hover:bg-white hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{integration.icon}</span>
                <div>
                  <span className="font-semibold text-slate-800 block text-sm">
                    {integration.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    {integration.description}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {integration.status === "connected" &&
                integration.canDisconnect ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnlinkProvider(integration.providerId)}
                    disabled={isDisconnecting === integration.providerId}
                    className="w-8 h-8 p-0 border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
                  >
                    {isDisconnecting === integration.providerId ? (
                      <IconLoader className="h-3 w-3 animate-spin" />
                    ) : (
                      <IconX className="h-3 w-3" />
                    )}
                  </Button>
                ) : integration.status === "available" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleConnectProvider(integration.providerId)
                    }
                    className="border border-slate-300 text-slate-700 hover:border-amber-300 hover:text-amber-700"
                  >
                    <IconPlus className="h-3 w-3 mr-1" />
                    Connect
                  </Button>
                ) : integration.status === "coming-soon" ? (
                  <Badge
                    variant="outline"
                    className="border border-blue-300 text-blue-600 bg-blue-50"
                  >
                    Coming Soon
                  </Badge>
                ) : integration.status === "connected" &&
                  !integration.canDisconnect ? (
                  <Badge
                    variant="secondary"
                    className="bg-amber-50 text-amber-700 border border-amber-200"
                  >
                    <IconCheck className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Preferences Tab Content
function PreferencesTab() {
  const [preferences, setPreferences] = useState<ExtendedUserPreferences>({});
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentInput, setCurrentInput] = useState("");
  const [chips, setChips] = useState<string[]>([]);

  const executiveCapabilities = [
    {
      id: "daily-briefings",
      label: "Daily Executive Briefings",
      icon: IconSunHigh,
    },
    {
      id: "meeting-prep",
      label: "Automated Meeting Prep",
      icon: IconBolt,
    },
    {
      id: "smart-reminders",
      label: "Smart Priority Reminders",
      icon: IconBell,
    },
    {
      id: "vc-updates",
      label: "VC & Funding Intelligence",
      icon: IconTrendingUp,
    },
    {
      id: "market-insights",
      label: "Market & Competitor Insights",
      icon: IconChartLine,
    },
    {
      id: "executive-memory",
      label: "Executive Memory & Context",
      icon: IconBook,
    },
  ];

  const floatingChips = [
    "AI-powered insights",
    "Market trends",
    "Competitor analysis",
    "Team productivity",
    "Financial metrics",
    "Customer feedback",
    "Strategic planning",
    "Innovation tracking",
    "Risk assessment",
    "Growth opportunities",
    "Process optimization",
    "Leadership development",
  ];

  // Load preferences on component mount
  useEffect(() => {
    async function loadPreferences() {
      try {
        const result = await getUserPreferencesAction();
        if (result.success && result.data) {
          setPreferences(result.data);
          // Initialize chips from textInput if available
          if (result.data.textInput) {
            const existingChips = result.data.textInput
              .split(", ")
              .filter((chip) => chip.trim());
            setChips(existingChips);
          }
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
    setPreferences((prev: ExtendedUserPreferences) => ({
      ...prev,
      capabilities: {
        ...prev.capabilities,
        [capabilityId]: !prev.capabilities?.[capabilityId],
      },
    }));
  };

  const handleCommunicationChange = (field: string, value: string) => {
    setPreferences((prev: ExtendedUserPreferences) => ({
      ...prev,
      communicationSettings: {
        ...prev.communicationSettings,
        [field]: value,
      },
    }));
  };

  const handleFocusHoursChange = (field: string, value: string) => {
    setPreferences((prev: ExtendedUserPreferences) => ({
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

  const addChip = (chipText: string) => {
    if (chipText.trim() && !chips.includes(chipText.trim())) {
      const newChips = [...chips, chipText.trim()];
      setChips(newChips);
      setPreferences((prev: ExtendedUserPreferences) => ({
        ...prev,
        textInput: newChips.join(", "),
      }));
    }
  };

  const removeChip = (chipToRemove: string) => {
    const newChips = chips.filter((chip: string) => chip !== chipToRemove);
    setChips(newChips);
    setPreferences((prev: ExtendedUserPreferences) => ({
      ...prev,
      textInput: newChips.join(", "),
    }));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentInput.trim()) {
      addChip(currentInput);
      setCurrentInput("");
    }
  };

  const savePreferences = () => {
    setError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const result = await updateUserPreferencesAction({ preferences });

        if (result.success) {
          setSuccessMessage("Preferences updated successfully!");
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
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center space-x-2 text-amber-600">
          <IconLoader className="h-5 w-5 animate-spin" />
          <span>Loading preferences...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert variant="default" className="border-green-200 bg-green-50">
          <IconCheck className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      <Card className="border border-stone-200 bg-white shadow-sm">
        <CardHeader className="border-b border-stone-100">
          <CardTitle className="text-xl font-semibold text-slate-800">
            Executive Capabilities
          </CardTitle>
          <CardDescription className="text-slate-600">
            Manage which AI assistant features are active for your leadership
            needs
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {executiveCapabilities.map((capability) => (
            <div
              key={capability.id}
              className="flex items-center justify-between p-4 border border-stone-200 rounded-xl hover:bg-stone-50 transition-all duration-200"
            >
              <div className="flex items-center space-x-3">
                <capability.icon className="h-5 w-5 text-amber-600" />
                <Label
                  htmlFor={capability.id}
                  className="flex-1 font-medium text-slate-700 cursor-pointer"
                >
                  {capability.label}
                </Label>
              </div>
              <Checkbox
                id={capability.id}
                checked={preferences.capabilities?.[capability.id] || false}
                onCheckedChange={() => handleCapabilityToggle(capability.id)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Custom Interests Section */}
      <Card className="border border-stone-200 bg-white shadow-sm">
        <CardHeader className="border-b border-stone-100">
          <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <IconSparkles className="h-5 w-5 text-amber-600" />
            Custom Interests & Focus Areas
          </CardTitle>
          <CardDescription className="text-slate-600">
            Tell your AI assistant what specific areas, topics, or goals you
            want it to prioritize
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">
              Add your specific interests, goals, or focus areas
            </Label>
            <Input
              placeholder="Type your interests and press Enter..."
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="h-12 border border-slate-300 focus:border-amber-500 focus:ring-amber-500"
            />
            <p className="text-xs text-slate-500">
              Add custom interests, goals, or areas you want your AI assistant
              to prioritize
            </p>
          </div>

          {/* Custom Chips Display */}
          {chips.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-slate-600 font-medium">
                Your custom interests:
              </p>
              <div className="flex flex-wrap gap-2">
                {chips.map((chip, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 cursor-pointer flex items-center gap-1"
                    onClick={() => removeChip(chip)}
                  >
                    {chip}
                    <IconX className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Floating Suggestion Chips */}
          <div className="space-y-2">
            <p className="text-sm text-slate-600 font-medium">
              Quick suggestions:
            </p>
            <div className="flex flex-wrap gap-2">
              {floatingChips.map((chip, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="border border-slate-300 text-slate-600 hover:border-amber-300 hover:text-amber-700 hover:bg-amber-50 cursor-pointer transition-all duration-200"
                  onClick={() => addChip(chip)}
                >
                  <IconPlus className="h-3 w-3 mr-1" />
                  {chip}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-stone-200 bg-white shadow-sm">
        <CardHeader className="border-b border-stone-100">
          <CardTitle className="text-xl font-semibold text-slate-800">
            Communication Preferences
          </CardTitle>
          <CardDescription className="text-slate-600">
            Control how and when Mnemo communicates with you
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <Label className="text-slate-700 font-medium">
              Briefing Schedule
            </Label>
            <Select
              value={
                preferences.communicationSettings?.briefingSchedule ||
                "daily-morning"
              }
              onValueChange={(value) =>
                handleCommunicationChange("briefingSchedule", value)
              }
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

          <div className="space-y-3">
            <Label className="text-slate-700 font-medium">
              Executive Focus Hours
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-slate-500">
                  No interruptions from
                </Label>
                <Input
                  type="time"
                  value={
                    preferences.communicationSettings?.focusHours?.start ||
                    "09:00"
                  }
                  onChange={(e) =>
                    handleFocusHoursChange("start", e.target.value)
                  }
                  className="h-12 border border-slate-300 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              <div>
                <Label className="text-sm text-slate-500">Until</Label>
                <Input
                  type="time"
                  value={
                    preferences.communicationSettings?.focusHours?.end ||
                    "11:00"
                  }
                  onChange={(e) =>
                    handleFocusHoursChange("end", e.target.value)
                  }
                  className="h-12 border border-slate-300 focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-slate-700 font-medium">
              Meeting Prep Timing
            </Label>
            <Select
              value={
                preferences.communicationSettings?.meetingPrepTiming || "30min"
              }
              onValueChange={(value) =>
                handleCommunicationChange("meetingPrepTiming", value)
              }
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

      <div className="flex justify-end">
        <Button
          onClick={savePreferences}
          disabled={isPending}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {isPending ? (
            <>
              <IconLoader className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Preferences"
          )}
        </Button>
      </div>
    </div>
  );
}

// Main Dashboard Component
export function MainDashboard({ user }: { user: any }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [viewMode, setViewMode] = useState<"dashboard" | "chat">("dashboard");

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authClient.signOut();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50/30">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(120,119,198,0.05),_transparent),radial-gradient(circle_at_80%_20%,_rgba(255,206,84,0.08),_transparent)]" />

      <div className="relative container mx-auto px-6 py-8 space-y-8">
        {/* Welcome Header with Logout */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-slate-800">
              Welcome back, {user?.name?.split(" ")[0] || "there"}!
            </h1>
            <p className="text-slate-600 text-lg">
              Your AI Executive Assistant is ready to serve
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user?.email}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              {isLoggingOut ? (
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconLogout className="mr-2 h-4 w-4" />
              )}
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </div>
        </div>

        {/* Connected Integrations - Always Visible */}
        <ConnectedIntegrations />

        {/* Tabs Section */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <div className="flex justify-center">
            <TabsList className="grid w-full grid-cols-3 max-w-2xl h-12 bg-white border-2 border-stone-300 shadow-sm rounded-xl p-1">
              <TabsTrigger
                value="dashboard"
                data-tab-trigger="true"
                className="font-semibold text-slate-800 bg-transparent hover:bg-slate-100 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 border-0 outline-0"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="memory-graph"
                data-tab-trigger="true"
                className="font-semibold text-slate-800 bg-transparent hover:bg-slate-100 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 border-0 outline-0"
              >
                Memory Graph
              </TabsTrigger>
              <TabsTrigger
                value="preferences"
                data-tab-trigger="true"
                className="font-semibold text-slate-800 bg-transparent hover:bg-slate-100 data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200 border-0 outline-0"
              >
                Preferences
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard">
            {/* Main View Toggle inside Dashboard Tab */}
            <Card className="border border-amber-200 bg-white shadow-sm">
              <CardHeader className="border-b border-amber-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-semibold text-slate-800">
                      Executive Command Center
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Switch between dashboard overview and voice-enabled chat
                    </CardDescription>
                  </div>

                  {/* Main View Toggle */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <IconChartBar className="h-4 w-4 text-slate-600" />
                      <span className="text-sm text-slate-600">Dashboard</span>
                    </div>
                    <Switch
                      checked={viewMode === "chat"}
                      onCheckedChange={(checked) =>
                        setViewMode(checked ? "chat" : "dashboard")
                      }
                      className="data-[state=checked]:bg-amber-500"
                    />
                    <div className="flex items-center space-x-2">
                      <IconMicrophone className="h-4 w-4 text-slate-600" />
                      <span className="text-sm text-slate-600">Chat</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {viewMode === "dashboard" ? <DashboardView /> : <ChatView />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="memory-graph">
            <MemoryGraph user={user} />
          </TabsContent>

          <TabsContent value="preferences">
            <PreferencesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Dashboard View Component
function DashboardView() {
  return (
    <div className="space-y-6">
      {/* Activity Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <TodayScheduleCard />
        <ExecutiveDocumentsCard />
        <RecentEmailsCard />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-stone-200 bg-white shadow-sm">
          <CardHeader className="border-b border-stone-100">
            <CardTitle className="text-xl font-semibold text-slate-800">
              Executive Calendar
            </CardTitle>
            <CardDescription className="text-slate-600">
              Your upcoming schedule and commitments
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] overflow-auto p-6">
            <CalendarEvents />
          </CardContent>
        </Card>

        <Card className="border border-stone-200 bg-white shadow-sm">
          <CardHeader className="border-b border-stone-100">
            <CardTitle className="text-xl font-semibold text-slate-800">
              Recent Documents
            </CardTitle>
            <CardDescription className="text-slate-600">
              Executive materials and reports
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] overflow-auto p-6">
            <RecentDocuments />
          </CardContent>
        </Card>
      </div>

      {/* Enhanced News Section */}
      <Card className="border border-stone-200 bg-white shadow-sm">
        <CardHeader className="border-b border-stone-100">
          <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <IconNews className="h-5 w-5 text-blue-600" />
            Personalized Executive Intelligence
          </CardTitle>
          <CardDescription className="text-slate-600">
            News and insights tailored to your interests and focus areas
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <EnhancedPersonalizedNewsSection />
        </CardContent>
      </Card>
    </div>
  );
}

// Today's Schedule Card Component
function TodayScheduleCard() {
  const [eventCount, setEventCount] = useState<number | null>(null);
  const [nextEvent, setNextEvent] = useState<string>("");
  const [needsPermission, setNeedsPermission] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScheduleSummary = async () => {
      try {
        const response = await fetch("/api/calendar");

        if (!response.ok) {
          const errorData = await response.json();
          if (
            errorData.code === "NO_GOOGLE_ACCOUNT" ||
            errorData.code === "INVALID_TOKEN"
          ) {
            setNeedsPermission(true);
            return;
          }
          throw new Error(errorData.error || "Failed to fetch calendar events");
        }

        const data = await response.json();
        if (data.events && Array.isArray(data.events)) {
          const todayEvents = data.events.filter((event: CalendarEvent) => {
            const eventDate = new Date(
              event.start?.dateTime || event.start?.date || "",
            );
            const today = new Date();
            return eventDate.toDateString() === today.toDateString();
          });

          setEventCount(todayEvents.length);
          if (todayEvents.length > 0) {
            const nextEventData = todayEvents[0] as CalendarEvent;
            const startTime = nextEventData.start?.dateTime
              ? new Date(nextEventData.start.dateTime).toLocaleTimeString(
                  "en-US",
                  {
                    hour: "numeric",
                    minute: "2-digit",
                  },
                )
              : "All day";
            setNextEvent(`Next: ${nextEventData.summary} at ${startTime}`);
          }
        }
      } catch (err) {
        setError((err as Error).message);
      }
    };

    fetchScheduleSummary();
  }, []);

  const handleConnectGoogle = async () => {
    try {
      setIsConnecting(true);
      await authClient.linkSocial({
        provider: "google",
        callbackURL: window.location.href,
        fetchOptions: {
          onSuccess: () => {
            window.location.reload();
          },
          onError: (ctx) => {
            setError(ctx.error?.message || "Failed to connect Google account");
            setIsConnecting(false);
          },
        },
      });
    } catch (err: any) {
      setError(err.message || "Failed to connect Google account");
      setIsConnecting(false);
    }
  };

  if (needsPermission) {
    return (
      <Card className="border border-stone-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-200/50">
              <IconCalendar className="h-5 w-5 text-amber-600" />
            </div>
            <CardTitle className="text-base font-semibold text-slate-800">
              Today's Schedule
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-slate-600 mb-2">
            Connect for calendar access
          </p>
          <Button
            size="sm"
            onClick={handleConnectGoogle}
            disabled={isConnecting}
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
          >
            {isConnecting ? "Connecting..." : "Connect Google"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-stone-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-200/50">
            <IconCalendar className="h-5 w-5 text-amber-600" />
          </div>
          <CardTitle className="text-base font-semibold text-slate-800">
            Today's Schedule
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-800">
          {error
            ? "Error"
            : eventCount !== null
              ? `${eventCount} Meeting${eventCount !== 1 ? "s" : ""}`
              : "Loading..."}
        </div>
        <p className="text-sm text-slate-500 mt-1">
          {error ? "Failed to load" : nextEvent || "No meetings today"}
        </p>
      </CardContent>
    </Card>
  );
}

// Executive Documents Card Component
function ExecutiveDocumentsCard() {
  const [documentCount, setDocumentCount] = useState<number | null>(null);
  const [latestDocument, setLatestDocument] = useState<string>("");
  const [needsPermission, setNeedsPermission] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocumentsSummary = async () => {
      try {
        const response = await fetch("/api/documents?maxResults=50");

        if (!response.ok) {
          const errorData = await response.json();
          if (
            errorData.code === "NO_GOOGLE_ACCOUNT" ||
            errorData.code === "INVALID_TOKEN"
          ) {
            setNeedsPermission(true);
            return;
          }
          throw new Error(errorData.error || "Failed to fetch documents");
        }

        const data = await response.json();
        if (data.documents && Array.isArray(data.documents)) {
          setDocumentCount(data.documents.length);
          if (data.documents.length > 0) {
            const latest = data.documents[0];
            setLatestDocument(`Latest: ${latest.name}`);
          }
        }
      } catch (err) {
        setError((err as Error).message);
      }
    };

    fetchDocumentsSummary();
  }, []);

  const handleConnectGoogle = async () => {
    try {
      setIsConnecting(true);
      await authClient.linkSocial({
        provider: "google",
        callbackURL: window.location.href,
        fetchOptions: {
          onSuccess: () => {
            window.location.reload();
          },
          onError: (ctx) => {
            setError(ctx.error?.message || "Failed to connect Google account");
            setIsConnecting(false);
          },
        },
      });
    } catch (err: any) {
      setError(err.message || "Failed to connect Google account");
      setIsConnecting(false);
    }
  };

  if (needsPermission) {
    return (
      <Card className="border border-stone-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-200/50">
              <IconFiles className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-base font-semibold text-slate-800">
              Executive Documents
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-slate-600 mb-2">
            Connect for document access
          </p>
          <Button
            size="sm"
            onClick={handleConnectGoogle}
            disabled={isConnecting}
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
          >
            {isConnecting ? "Connecting..." : "Connect Google"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-stone-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-200/50">
            <IconFiles className="h-5 w-5 text-blue-600" />
          </div>
          <CardTitle className="text-base font-semibold text-slate-800">
            Executive Documents
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-800">
          {error
            ? "Error"
            : documentCount !== null
              ? `${documentCount} Document${documentCount !== 1 ? "s" : ""}`
              : "Loading..."}
        </div>
        <p className="text-sm text-slate-500 mt-1">
          {error ? "Failed to load" : latestDocument || "No documents found"}
        </p>
      </CardContent>
    </Card>
  );
}

// Recent Emails Card Component
function RecentEmailsCard() {
  const [emailCount, setEmailCount] = useState<number | null>(null);
  const [latestEmail, setLatestEmail] = useState<string>("");
  const [needsPermission, setNeedsPermission] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmailSummary = async () => {
      try {
        const response = await fetch("/api/gmail/recent");

        if (!response.ok) {
          const errorData = await response.json();
          if (
            errorData.code === "NO_GOOGLE_ACCOUNT" ||
            errorData.code === "INVALID_TOKEN"
          ) {
            setNeedsPermission(true);
            return;
          }
          throw new Error(errorData.error || "Failed to fetch emails");
        }

        const data = await response.json();
        if (data.emails && Array.isArray(data.emails)) {
          setEmailCount(data.emails.length);
          if (data.emails.length > 0) {
            const latest = data.emails[0];
            const senderName =
              latest.from.match(/^"?([^"<]+)"?\s*(?:<[^>]+>)?$/)?.[1]?.trim() ||
              latest.from;
            setLatestEmail(`From: ${senderName}`);
          }
        }
      } catch (err) {
        setError((err as Error).message);
      }
    };

    fetchEmailSummary();
  }, []);

  const handleConnectGoogle = async () => {
    try {
      setIsConnecting(true);
      await authClient.linkSocial({
        provider: "google",
        callbackURL: window.location.href,
        fetchOptions: {
          onSuccess: () => {
            window.location.reload();
          },
          onError: (ctx) => {
            setError(ctx.error?.message || "Failed to connect Google account");
            setIsConnecting(false);
          },
        },
      });
    } catch (err: any) {
      setError(err.message || "Failed to connect Google account");
      setIsConnecting(false);
    }
  };

  if (needsPermission) {
    return (
      <Card className="border border-stone-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-200/50">
              <IconMail className="h-5 w-5 text-rose-600" />
            </div>
            <CardTitle className="text-base font-semibold text-slate-800">
              Priority Emails
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-slate-600 mb-2">
            Connect for email access
          </p>
          <Button
            size="sm"
            onClick={handleConnectGoogle}
            disabled={isConnecting}
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
          >
            {isConnecting ? "Connecting..." : "Connect Google"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-stone-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-200/50">
            <IconMail className="h-5 w-5 text-rose-600" />
          </div>
          <CardTitle className="text-base font-semibold text-slate-800">
            Priority Emails
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-800">
          {error
            ? "Error"
            : emailCount !== null
              ? `${emailCount} Recent`
              : "Loading..."}
        </div>
        <p className="text-sm text-slate-500 mt-1">
          {error ? "Failed to load" : latestEmail || "No recent emails"}
        </p>
      </CardContent>
    </Card>
  );
}

// Personalized News Component
function PersonalizedNewsCard() {
  const [newsData, setNewsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userTopics, setUserTopics] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const defaultTopics = [
    "artificial intelligence technology breakthroughs",
    "startup funding and venture capital",
    "space exploration and discoveries",
  ];

  const fetchUserPreferences = async () => {
    try {
      const result = await getUserPreferencesAction();
      if (result.success && result.data) {
        // Get custom interests from textInput (using any type to bypass TS issue)
        const customInterests = (result.data as any).textInput
          ? (result.data as any).textInput
              .split(", ")
              .filter((topic: string) => topic.trim())
          : [];

        // Combine with enabled capabilities for more context
        const enabledCapabilities = Object.entries(
          result.data.capabilities || {},
        )
          .filter(([_, enabled]) => enabled)
          .map(([capability, _]) => capability.replace("-", " "));

        // Create topics array from custom interests, fallback to default if none
        const topics =
          customInterests.length > 0
            ? customInterests
            : [...enabledCapabilities, ...defaultTopics].slice(0, 5);

        setUserTopics(topics.length > 0 ? topics : defaultTopics);
      } else {
        setUserTopics(defaultTopics);
      }
    } catch (err) {
      console.error("Failed to load user preferences:", err);
      setUserTopics(defaultTopics);
    }
  };

  const fetchNews = async (topics: string[]) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topics }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch news");
      }

      const data = await response.json();
      if (data.success) {
        // Filter out empty or irrelevant news content
        const filteredNews = data.data.filter((item: any) => {
          const content = item.content || "";
          const hasSubstantialContent = content.length > 100;
          const hasRelevantKeywords = topics.some((topic) =>
            content.toLowerCase().includes(topic.toLowerCase().split(" ")[0]),
          );
          return (
            hasSubstantialContent &&
            (hasRelevantKeywords ||
              content.includes("significant") ||
              content.includes("important"))
          );
        });

        setNewsData(filteredNews);
      } else {
        throw new Error(data.error || "Failed to fetch news");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const initializeNews = async () => {
      await fetchUserPreferences();
    };
    initializeNews();
  }, []);

  useEffect(() => {
    if (userTopics.length > 0) {
      fetchNews(userTopics);
    }
  }, [userTopics]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUserPreferences();
    if (userTopics.length > 0) {
      await fetchNews(userTopics);
    }
  };

  if (loading && !isRefreshing) {
    return (
      <Card className="border border-stone-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-200/50">
              <IconNews className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle className="text-base font-semibold text-slate-800">
              Personalized News
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-center py-8">
          <IconLoader className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-sm text-slate-600">
            Loading your personalized news...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-stone-200 bg-white shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-200/50">
              <IconNews className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-slate-800">
                Personalized News
              </CardTitle>
              <p className="text-xs text-slate-500">
                {userTopics.length > 0
                  ? `${userTopics.length} topics`
                  : "General news"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-8 h-8 p-0"
          >
            <IconRefresh
              className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-4">
            <IconAlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600">Failed to load news</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        ) : newsData.length > 0 ? (
          <div className="space-y-4">
            {newsData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="prose prose-sm max-w-none text-slate-700">
                  <div className="text-sm leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => (
                          <h4 className="text-sm font-semibold text-slate-800 mb-2">
                            {children}
                          </h4>
                        ),
                        h2: ({ children }) => (
                          <h5 className="text-sm font-medium text-slate-700 mb-1">
                            {children}
                          </h5>
                        ),
                        h3: ({ children }) => (
                          <h6 className="text-sm font-medium text-slate-700 mb-1">
                            {children}
                          </h6>
                        ),
                        p: ({ children }) => (
                          <p className="text-sm text-slate-600 mb-2 leading-relaxed">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="text-sm text-slate-600 ml-4 mb-2 list-disc">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="text-sm text-slate-600 ml-4 mb-2 list-decimal">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => (
                          <li className="mb-1">{children}</li>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold text-slate-800">
                            {children}
                          </strong>
                        ),
                        em: ({ children }) => (
                          <em className="italic text-slate-700">{children}</em>
                        ),
                      }}
                    >
                      {item.content.split("\n\n").slice(0, 2).join("\n\n")}
                    </ReactMarkdown>
                  </div>
                </div>
                {userTopics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {userTopics.slice(0, 3).map((topic, topicIndex) => (
                      <Badge
                        key={topicIndex}
                        variant="outline"
                        className="text-xs border-blue-200 text-blue-700 bg-blue-50"
                      >
                        {topic.length > 20
                          ? `${topic.substring(0, 20)}...`
                          : topic}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-slate-600">
              No relevant news found for your topics
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Try updating your interests in preferences
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Enhanced Personalized News Section Component
function EnhancedPersonalizedNewsSection() {
  const [newsData, setNewsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userTopics, setUserTopics] = useState<string[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const defaultTopics = [
    "artificial intelligence technology breakthroughs",
    "startup funding and venture capital",
    "space exploration and discoveries",
  ];

  const fetchUserPreferences = async () => {
    try {
      const result = await getUserPreferencesAction();
      if (result.success && result.data) {
        // Get custom interests from textInput (using any type to bypass TS issue)
        const customInterests = (result.data as any).textInput
          ? (result.data as any).textInput
              .split(", ")
              .filter((topic: string) => topic.trim())
          : [];

        // Combine with enabled capabilities for more context
        const enabledCapabilities = Object.entries(
          result.data.capabilities || {},
        )
          .filter(([_, enabled]) => enabled)
          .map(([capability, _]) => capability.replace("-", " "));

        // Create topics array from custom interests, fallback to default if none
        const topics =
          customInterests.length > 0
            ? customInterests
            : [...enabledCapabilities, ...defaultTopics].slice(0, 5);

        setUserTopics(topics.length > 0 ? topics : defaultTopics);
      } else {
        setUserTopics(defaultTopics);
      }
    } catch (err) {
      console.error("Failed to load user preferences:", err);
      setUserTopics(defaultTopics);
    }
  };

  const fetchNews = async (topics: string[]) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topics }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch news");
      }

      const data = await response.json();
      if (data.success) {
        // Filter out empty or irrelevant news content
        const filteredNews = data.data.filter((item: any) => {
          const content = item.content || "";
          const hasSubstantialContent = content.length > 100;
          const hasRelevantKeywords = topics.some((topic) =>
            content.toLowerCase().includes(topic.toLowerCase().split(" ")[0]),
          );
          return (
            hasSubstantialContent &&
            (hasRelevantKeywords ||
              content.includes("significant") ||
              content.includes("important"))
          );
        });

        setNewsData(filteredNews);
      } else {
        throw new Error(data.error || "Failed to fetch news");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const initializeNews = async () => {
      await fetchUserPreferences();
    };
    initializeNews();
  }, []);

  useEffect(() => {
    if (userTopics.length > 0) {
      fetchNews(userTopics);
    }
  }, [userTopics]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchUserPreferences();
    if (userTopics.length > 0) {
      await fetchNews(userTopics);
    }
  };

  if (loading && !isRefreshing) {
    return (
      <div className="text-center py-12">
        <IconLoader className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-slate-600">
          Fetching your personalized news intelligence...
        </p>
        <p className="text-sm text-slate-500 mt-2">
          Analyzing {userTopics.length > 0 ? userTopics.length : "default"}{" "}
          topics
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <IconAlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          Failed to Load News
        </h3>
        <p className="text-slate-600 mb-4">{error}</p>
        <Button
          onClick={handleRefresh}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <IconRefresh className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Topics and Refresh */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-800">
            Your News Intelligence
          </h3>
          <div className="flex flex-wrap gap-2">
            {userTopics.slice(0, 6).map((topic, index) => (
              <Badge
                key={index}
                variant="outline"
                className="border-blue-200 text-blue-700 bg-blue-50"
              >
                {topic.length > 25 ? `${topic.substring(0, 25)}...` : topic}
              </Badge>
            ))}
            {userTopics.length > 6 && (
              <Badge
                variant="outline"
                className="border-slate-300 text-slate-600"
              >
                +{userTopics.length - 6} more
              </Badge>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <IconRefresh
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* News Content */}
      {newsData.length > 0 ? (
        <div className="space-y-4">
          {newsData.map((item, index) => (
            <div key={index} className="prose prose-slate max-w-none">
              <div className="p-6 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors duration-200">
                <div className="text-slate-700 leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h3 className="text-xl font-bold text-slate-800 mb-4 mt-6 first:mt-0">
                          {children}
                        </h3>
                      ),
                      h2: ({ children }) => (
                        <h4 className="text-lg font-semibold text-slate-800 mb-3 mt-6 first:mt-0">
                          {children}
                        </h4>
                      ),
                      h3: ({ children }) => (
                        <h5 className="text-base font-semibold text-slate-800 mb-2 mt-4 first:mt-0">
                          {children}
                        </h5>
                      ),
                      h4: ({ children }) => (
                        <h6 className="text-sm font-semibold text-slate-800 mb-2 mt-4 first:mt-0">
                          {children}
                        </h6>
                      ),
                      p: ({ children }) => (
                        <p className="mb-4 text-slate-700 leading-relaxed">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="mb-4 ml-6 list-disc text-slate-700">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-4 ml-6 list-decimal text-slate-700">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="mb-2">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-slate-800">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic text-slate-700">{children}</em>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-blue-200 pl-4 italic text-slate-600 my-4">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="bg-slate-100 px-1 py-0.5 rounded text-sm font-mono text-slate-800">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="bg-slate-100 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4">
                          {children}
                        </pre>
                      ),
                    }}
                  >
                    {item.content}
                  </ReactMarkdown>
                </div>

                {item.citations && item.citations.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">Sources:</p>
                    <div className="space-y-1">
                      {item.citations
                        .slice(0, 3)
                        .map((citation: string, cIndex: number) => (
                          <a
                            key={cIndex}
                            href={citation}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 block truncate"
                          >
                            {citation}
                          </a>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <IconNews className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            No Relevant News Found
          </h3>
          <p className="text-slate-600">
            No news articles found for your current interests. Try adjusting
            your preferences or check back later.
          </p>
        </div>
      )}
    </div>
  );
}

// Chat View Component
function ChatView() {
  const [voiceConnection, setVoiceConnection] = useState<boolean>(false);

  // Disconnect voice assistant when unmounting (switching away from chat)
  useEffect(() => {
    return () => {
      if (voiceConnection) {
        console.log(
          "ChatView unmounting, forcing voice assistant disconnect...",
        );
        // The voice assistant components will handle their own cleanup
      }
    };
  }, [voiceConnection]);

  return (
    <div className="space-y-4">
      {/* Voice Assistant Header */}
      <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div>
          <h4 className="font-medium text-slate-800">
            ElevenLabs Voice Assistant
          </h4>
          <p className="text-sm text-slate-600">
            High-quality conversational AI with natural voice
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-amber-100 text-amber-800 text-xs rounded-full font-medium">
            Premium Voice
          </div>
        </div>
      </div>

      {/* Voice Assistant Interface */}
      <div className="h-[600px] border border-stone-200 rounded-lg bg-stone-50/30 flex items-center justify-center">
        <Conversation />
      </div>
    </div>
  );
}
