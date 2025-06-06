"use client";

import React, { useState, useTransition, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  IconBrandWhatsapp,
  IconCheck,
  IconTarget,
  IconSettings,
  IconPlus,
  IconSunHigh,
  IconBolt,
  IconBook,
  IconBell,
  IconTrendingUp,
  IconChartLine,
  IconLoader,
  IconAlertCircle,
  IconX,
  IconSparkles,
} from "@tabler/icons-react";
import {
  updatePhoneNumberAction,
  updateUserPreferencesAction,
} from "@/app/(dashboard)/dashboard/providers/actions";
import { DEFAULT_PREFERENCES, UserPreferences } from "@/lib/preferences";
import { authClient } from "@/lib/auth-client";

// Onboarding Step Components
function Step1WhatsAppConnection({
  onNext,
  phoneNumber,
  setPhoneNumber,
}: {
  onNext: () => void;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
}) {
  return (
    <div className="max-w-md mx-auto text-center space-y-8">
      <div className="space-y-4">
        <div className="h-20 w-20 mx-auto bg-amber-50 rounded-full flex items-center justify-center border border-amber-200/50 shadow-sm">
          <IconBrandWhatsapp className="h-10 w-10 text-amber-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-800">
            Connect WhatsApp
          </h2>
          <p className="text-slate-600 max-w-sm mx-auto leading-relaxed">
            Enter your WhatsApp number to activate your AI Executive Assistant
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="phone" className="text-slate-700 font-medium">
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="text-center h-12 border border-slate-300 focus:border-amber-500 focus:ring-amber-500"
          />
          <p className="text-xs text-slate-500">
            Include your country code (e.g., +1 for US)
          </p>
        </div>

        <Button
          onClick={onNext}
          disabled={!phoneNumber}
          className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Connect WhatsApp
        </Button>

        <p className="text-xs text-slate-500">
          We'll send you a verification code via WhatsApp
        </p>
      </div>
    </div>
  );
}

function Step2InterestSelection({
  onNext,
  interests,
  setInterests,
  customWants,
  setCustomWants,
}: {
  onNext: () => void;
  interests: string[];
  setInterests: (interests: string[]) => void;
  customWants: string;
  setCustomWants: (wants: string) => void;
}) {
  const [currentInput, setCurrentInput] = useState("");
  const [chips, setChips] = useState<string[]>([]);

  const availableInterests = [
    {
      id: "daily-briefings",
      label: "Daily Executive Briefings",
      icon: IconSunHigh,
    },
    { id: "meeting-prep", label: "Automated Meeting Prep", icon: IconBolt },
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
  ];

  const toggleInterest = (interestId: string) => {
    setInterests(
      interests.includes(interestId)
        ? interests.filter((id) => id !== interestId)
        : [...interests, interestId],
    );
  };

  const addChip = (chipText: string) => {
    if (chipText.trim() && !chips.includes(chipText.trim())) {
      const newChips = [...chips, chipText.trim()];
      setChips(newChips);
      setCustomWants(newChips.join(", "));
    }
  };

  const removeChip = (chipToRemove: string) => {
    const newChips = chips.filter(chip => chip !== chipToRemove);
    setChips(newChips);
    setCustomWants(newChips.join(", "));
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && currentInput.trim()) {
      addChip(currentInput);
      setCurrentInput("");
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="h-20 w-20 mx-auto bg-amber-50 rounded-full flex items-center justify-center border border-amber-200/50 shadow-sm">
          <IconTarget className="h-10 w-10 text-amber-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-800">
            Executive Preferences
          </h2>
          <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
            Choose the capabilities that matter most to your leadership style
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {availableInterests.map((interest) => (
          <div
            key={interest.id}
            onClick={() => toggleInterest(interest.id)}
            className="flex items-center space-x-4 p-4 border border-slate-200 rounded-xl hover:bg-stone-50 hover:border-amber-200 cursor-pointer transition-all duration-200"
          >
            <Checkbox
              id={interest.id}
              checked={interests.includes(interest.id)}
              onChange={() => {}} // Controlled by parent click
            />
            <interest.icon className="h-6 w-6 text-amber-600" />
            <Label
              htmlFor={interest.id}
              className="flex-1 cursor-pointer font-medium text-slate-700"
            >
              {interest.label}
            </Label>
          </div>
        ))}
      </div>

      {/* Custom Interests Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-slate-700 font-medium flex items-center gap-2">
            <IconSparkles className="h-4 w-4 text-amber-600" />
            Tell us what else you want your assistant to focus on
          </Label>
          <Input
            placeholder="Type your interests and press Enter..."
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            className="h-12 border border-slate-300 focus:border-amber-500 focus:ring-amber-500"
          />
          <p className="text-xs text-slate-500">
            Add custom interests, goals, or areas you want your AI assistant to prioritize
          </p>
        </div>

        {/* Custom Chips Display */}
        {chips.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-slate-600 font-medium">Your custom interests:</p>
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
          <p className="text-sm text-slate-600 font-medium">Quick suggestions:</p>
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
      </div>

      <Button
        onClick={onNext}
        className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        Continue Setup
      </Button>
    </div>
  );
}

function Step3Integrations({ onComplete }: { onComplete: () => void }) {
  const [session, setSession] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
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
        if (data?.user && 'accounts' in data.user) {
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
    return accounts.some(account => account.providerId === providerId);
  };

  const handleConnectProvider = async (provider: string) => {
    try {
      setError(null);
      setSuccessMessage(null);
      setIsConnecting(provider);
      
      await authClient.linkSocial({
        provider: provider as any,
        callbackURL: window.location.href,
        fetchOptions: {
          onSuccess: () => {
            setSuccessMessage(`Successfully connected ${provider}`);
            setIsConnecting(null);
            // Refresh session data
            authClient.getSession().then(({ data }) => {
              if (data?.user && 'accounts' in data.user) {
                const userAccounts = data.user.accounts;
                setAccounts(Array.isArray(userAccounts) ? userAccounts : []);
              }
            });
          },
          onError: (ctx) => {
            setError(ctx.error?.message || `Failed to connect ${provider}`);
            setIsConnecting(null);
          }
        }
      });
    } catch (err: any) {
      setError(err.message || `Failed to connect ${provider}`);
      setIsConnecting(null);
    }
  };

  const integrations = [
    {
      id: "calendar",
      name: "Google Suite",
      providerId: "google",
      description: "Google Suite integration",
      icon: "📅",
      connected: isProviderConnected("google"),
      canConnect: true,
    },
    {
      id: "github",
      name: "GitHub",
      providerId: "github",
      description: "Code repository and development updates",
      icon: "🐙",
      connected: isProviderConnected("github"),
      canConnect: true,
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      providerId: "linkedin",
      description: "Professional network integration",
      icon: "💼",
      connected: isProviderConnected("linkedin"),
      canConnect: true,
    },
    {
      id: "slack",
      name: "Slack",
      providerId: "slack",
      description: "Team communication and workspace integration",
      icon: "💬",
      connected: false,
      canConnect: false,
    },
    {
      id: "jira",
      name: "Jira",
      providerId: "jira",
      description: "Project management and development tracking",
      icon: "🔧",
      connected: false,
      canConnect: false,
    },
  ];

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="h-20 w-20 mx-auto bg-amber-50 rounded-full flex items-center justify-center border border-amber-200/50 shadow-sm">
            <IconSettings className="h-10 w-10 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-800">
              Connect Your Executive Stack
            </h2>
            <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
              Loading available integrations...
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <IconLoader className="h-6 w-6 animate-spin text-amber-600" />
          <span className="ml-2 text-slate-600">Loading integrations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="h-20 w-20 mx-auto bg-amber-50 rounded-full flex items-center justify-center border border-amber-200/50 shadow-sm">
          <IconSettings className="h-10 w-10 text-amber-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-slate-800">
            Connect Your Executive Stack
          </h2>
          <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
            Integrate with tools your business already depends on (optional)
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="border border-red-200 bg-red-50">
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

      <div className="space-y-4">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-sm hover:bg-stone-50 transition-all duration-200"
          >
            <div className="flex items-center space-x-4">
              <span className="text-3xl">{integration.icon}</span>
              <div>
                <div className="font-semibold text-slate-800">
                  {integration.name}
                </div>
                <div className="text-sm text-slate-500">
                  {integration.description}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {integration.connected ? (
                <Badge
                  variant="secondary"
                  className="bg-amber-50 text-amber-700 border border-amber-200"
                >
                  <IconCheck className="h-3 w-3 mr-1" />
                  Connected
                </Badge>
              ) : integration.canConnect ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConnectProvider(integration.providerId)}
                  disabled={isConnecting === integration.providerId}
                  className="border border-slate-300 hover:border-amber-300"
                >
                  {isConnecting === integration.providerId ? (
                    <IconLoader className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <IconPlus className="h-4 w-4 mr-1" />
                  )}
                  {isConnecting === integration.providerId ? "Connecting..." : "Connect"}
                </Button>
              ) : (
                <Badge
                  variant="outline"
                  className="border border-blue-300 text-blue-600 bg-blue-50"
                >
                  Coming Soon
                </Badge>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={onComplete}
          className="flex-1 h-12 border border-slate-300 text-slate-700 hover:bg-stone-50 font-medium rounded-xl"
        >
          Skip for Now
        </Button>
        <Button
          onClick={onComplete}
          className="flex-1 h-12 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          Launch Mnemo
        </Button>
      </div>
    </div>
  );
}

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [customWants, setCustomWants] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const nextStep = () => setCurrentStep((prev) => prev + 1);

  const complete = async () => {
    if (!phoneNumber) {
      setError("Phone number is required");
      return;
    }

    startTransition(async () => {
      try {
        // Save phone number
        const phoneResult = await updatePhoneNumberAction({ phoneNumber });

        if (phoneResult?.failure) {
          setError(phoneResult.failure);
          return;
        }

        // Always save preferences with complete structure including textInput
        const preferences: UserPreferences = {
          ...DEFAULT_PREFERENCES,
          interests,
          textInput: customWants, // Store custom wants in textInput field
          capabilities: {
            ...DEFAULT_PREFERENCES.capabilities,
            ...interests.reduce(
              (acc, interest) => {
                acc[interest] = true;
                return acc;
              },
              {} as { [key: string]: boolean },
            ),
          },
        };

        const prefsResult = await updateUserPreferencesAction({ preferences });

        if (prefsResult?.failure) {
          setError(`Failed to save preferences: ${prefsResult.failure}`);
          return;
        }

        // Success - redirect to dashboard
        window.location.href = "/dashboard";
      } catch (err) {
        setError("Failed to complete setup. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-amber-50/30 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(120,119,198,0.05),_transparent),radial-gradient(circle_at_80%_20%,_rgba(255,206,84,0.08),_transparent)]" />

      <Card className="w-full max-w-3xl bg-white/90 backdrop-blur-sm border border-stone-200 shadow-2xl relative">
        <CardHeader className="text-center pb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 ${
                    step <= currentStep
                      ? "bg-amber-500 text-white border-amber-500 shadow-lg"
                      : "bg-white text-slate-400 border-slate-200"
                  }`}
                >
                  {step < currentStep ? (
                    <IconCheck className="h-5 w-5" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div
                    className={`h-1 w-16 mx-3 rounded-full transition-all duration-300 ${
                      step < currentStep ? "bg-amber-500" : "bg-slate-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <CardTitle className="text-4xl font-bold text-slate-800">
            Welcome to Mnemo
          </CardTitle>
          <CardDescription className="text-lg text-slate-600 max-w-md mx-auto">
            Your AI Executive Assistant setup in 3 simple steps
          </CardDescription>
        </CardHeader>

        <CardContent className="py-8">
          {error && (
            <Alert
              variant="destructive"
              className="mb-6 border border-red-200 bg-red-50"
            >
              <IconAlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {currentStep === 1 && (
            <Step1WhatsAppConnection
              onNext={nextStep}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
            />
          )}
          {currentStep === 2 && (
            <Step2InterestSelection
              onNext={nextStep}
              interests={interests}
              setInterests={setInterests}
              customWants={customWants}
              setCustomWants={setCustomWants}
            />
          )}
          {currentStep === 3 && <Step3Integrations onComplete={complete} />}

          {isPending && (
            <div className="flex items-center justify-center mt-6">
              <div className="flex items-center space-x-2 text-amber-600">
                <IconLoader className="h-5 w-5 animate-spin" />
                <span className="font-medium">
                  Setting up your assistant...
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
