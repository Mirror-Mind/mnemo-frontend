"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { headers } from "next/headers";

const updatePhoneNumberSchema = z.object({
  phoneNumber: z.string().min(5, "Phone number is too short"),
});

// Define types based on schema and expected session
type UpdatePhoneNumberInput = z.infer<typeof updatePhoneNumberSchema>;
type AuthActionContext = {
  session: {
    user?: { id: string; [key: string]: any };
    [key: string]: any;
  } | null;
};

// Standard server action, not wrapped by auth.action
export const updatePhoneNumberAction = async (data: UpdatePhoneNumberInput) => {
  // Get session manually
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    // Use throw or return an object with an error flag
    // Returning an object is often preferred for actions called from useTransition
    return { failure: "User not authenticated" };
  }

  // Validate input data with Zod schema
  const validatedData = updatePhoneNumberSchema.safeParse(data);
  if (!validatedData.success) {
    // Combine Zod error messages or return the first one
    const errorMessage = validatedData.error.errors.map(e => e.message).join(", ");
    return { failure: `Invalid input: ${errorMessage}` };
  }

  try {
    console.log(`Attempting to update phone number for user: ${session.user.id} to ${validatedData.data.phoneNumber}`); // Log before update
    const updatedUser = await prisma.user.update({ // Assign result to variable
      where: { id: session.user.id },
      data: {
        phoneNumber: validatedData.data.phoneNumber,
        // phoneNumberVerified: false, // Verification later
      },
    });
    console.log(`Successfully updated phone number for user: ${session.user.id}. New data:`, updatedUser); // Log after update
    return { success: "Phone number updated successfully." };
  } catch (error) {
    console.error("Error updating phone number:", error);
    // Consider more specific error handling if needed
    return { failure: "Failed to update phone number." };
  }
};

// Action to remove phone number
export const removePhoneNumberAction = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return { failure: "User not authenticated" };
  }

  try {
    console.log(`Attempting to remove phone number for user: ${session.user.id}`); // Log before removal
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        phoneNumber: null,
        phoneNumberVerified: null,
      },
    });
    console.log(`Successfully removed phone number for user: ${session.user.id}`); // Log after removal
    return { success: "Phone number removed successfully." };
  } catch (error) {
    console.error("Error removing phone number:", error);
    return { failure: "Failed to remove phone number." };
  }
};

// Define types for preferences
interface UserPreferences {
  interests?: string[];
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
}

const updatePreferencesSchema = z.object({
  preferences: z.any(), // Will be stringified JSON
});

type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;

// Action to update user preferences
export const updateUserPreferencesAction = async (data: UpdatePreferencesInput) => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return { failure: "User not authenticated" };
  }

  try {
    // Stringify the preferences object
    const preferencesString = JSON.stringify(data.preferences);
    
    console.log(`Updating preferences for user: ${session.user.id}`);
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        preferences: preferencesString,
      },
    });
    
    console.log(`Successfully updated preferences for user: ${session.user.id}`);
    return { success: "Preferences updated successfully." };
  } catch (error) {
    console.error("Error updating preferences:", error);
    return { failure: "Failed to update preferences." };
  }
};

// Action to get user preferences
export const getUserPreferencesAction = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return { failure: "User not authenticated" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferences: true },
    });

    if (!user) {
      return { failure: "User not found" };
    }

    // Parse the preferences JSON or return default structure
    let preferences: UserPreferences = {};
    if (user.preferences) {
      try {
        preferences = JSON.parse(user.preferences);
      } catch (error) {
        console.error("Error parsing user preferences:", error);
        preferences = {};
      }
    }

    return { success: true, data: preferences };
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return { failure: "Failed to fetch preferences." };
  }
}; 