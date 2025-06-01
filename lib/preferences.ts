// Utility functions for managing user preferences

export interface UserPreferences {
  interests?: string[];
  textInput?: string;
  capabilities?: {
    [key: string]: boolean;
  };
  communicationSettings?: {
    briefingSchedule?: string;
    focusHours?: {
      start?: string;
      end?: string;
    };
    meetingPrepTiming?: string;
  };
  lastUpdated?: string;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  interests: [],
  textInput: "",
  capabilities: {
    "daily-briefings": false,
    "meeting-prep": false,
    "smart-reminders": false,
    "vc-updates": false,
    "market-insights": false,
    "executive-memory": false,
  },
  communicationSettings: {
    briefingSchedule: "daily-morning",
    focusHours: {
      start: "09:00",
      end: "11:00",
    },
    meetingPrepTiming: "30min",
  },
};

export function parseUserPreferences(preferencesString: string | null): UserPreferences {
  if (!preferencesString) {
    return DEFAULT_PREFERENCES;
  }

  try {
    const parsed = JSON.parse(preferencesString);
    // Merge with defaults to ensure all fields are present
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      capabilities: {
        ...DEFAULT_PREFERENCES.capabilities,
        ...parsed.capabilities,
      },
      communicationSettings: {
        ...DEFAULT_PREFERENCES.communicationSettings,
        ...parsed.communicationSettings,
        focusHours: {
          ...DEFAULT_PREFERENCES.communicationSettings?.focusHours,
          ...parsed.communicationSettings?.focusHours,
        },
      },
    };
  } catch (error) {
    console.error("Error parsing user preferences:", error);
    return DEFAULT_PREFERENCES;
  }
}

export function stringifyUserPreferences(preferences: UserPreferences): string {
  return JSON.stringify({
    ...preferences,
    lastUpdated: new Date().toISOString(),
  });
}

export function getEnabledCapabilities(preferences: UserPreferences): string[] {
  if (!preferences.capabilities) {
    return [];
  }

  return Object.entries(preferences.capabilities)
    .filter(([_, enabled]) => enabled)
    .map(([capability, _]) => capability);
}

export function hasCapability(preferences: UserPreferences, capability: string): boolean {
  return preferences.capabilities?.[capability] === true;
}

export function updateCapability(
  preferences: UserPreferences, 
  capability: string, 
  enabled: boolean
): UserPreferences {
  return {
    ...preferences,
    capabilities: {
      ...preferences.capabilities,
      [capability]: enabled,
    },
  };
} 