import prisma from '@/lib/prisma';
import { DynamicTool } from "@langchain/core/tools";
import { CallbackManagerForToolRun } from "@langchain/core/callbacks/manager";
import { auth } from '@/lib/auth';

// Get LinkedIn access token for a user
async function getLinkedInAccessToken(userId: string) {
  try {
    // Find LinkedIn account for the user
    const account = await prisma.account.findFirst({
      where: {
        userId,
        providerId: "linkedin"
      }
    });

    if (!account) {
      throw new Error("No LinkedIn account connected");
    }
    
    if (!account.accessToken) {
      throw new Error("Missing LinkedIn access token");
    }

    return account.accessToken;
  } catch (error: any) {
    console.error("LinkedIn authentication error:", error);
    throw error;
  }
}

// Get basic profile information
export async function getBasicProfile(userId: string) {
  try {
    console.log(`[LINKEDIN] Getting basic profile for user: ${userId}`);
    
    const accessToken = await getLinkedInAccessToken(userId);
    
    // Fetch basic profile using v2 API
    const profileResponse = await fetch('https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture)', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });
    
    if (!profileResponse.ok) {
      throw new Error(`LinkedIn API error: ${profileResponse.status}`);
    }
    
    const profileData = await profileResponse.json();
    
    // Fetch email address using OpenID Connect
    const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });
    
    if (!emailResponse.ok) {
      console.warn('Could not fetch email address, continuing with basic profile');
    }
    
    const emailData = await emailResponse.json();
    const email = emailData.elements?.[0]?.['handle~']?.emailAddress;
    
    return {
      success: true,
      data: {
        id: profileData.id,
        firstName: profileData.localizedFirstName,
        lastName: profileData.localizedLastName,
        email: email || 'Email not available',
        profilePicture: profileData.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier,
      }
    };
  } catch (error: any) {
    console.error(`[LINKEDIN ERROR] Get basic profile: ${error.message}`);
    
    if (error.message.includes("No LinkedIn account")) {
      return { 
        success: false, 
        error: "No LinkedIn account connected",
        code: "NO_LINKEDIN_ACCOUNT"
      };
    }
    
    return { 
      success: false, 
      error: "Failed to fetch LinkedIn profile",
      details: error.message,
      code: "LINKEDIN_ERROR"
    };
  }
}

// Get full profile including education, experience, skills, etc.
export async function getFullProfile(userId: string) {
  try {
    console.log(`[LINKEDIN] Getting full profile for user: ${userId}`);
    
    const accessToken = await getLinkedInAccessToken(userId);
    
    // Fetch full profile with available fields
    const profileResponse = await fetch('https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture)', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });
    
    if (!profileResponse.ok) {
      throw new Error(`LinkedIn API error: ${profileResponse.status}`);
    }
    
    const profileData = await profileResponse.json();
    
    // Fetch email address using OpenID Connect
    const emailResponse = await fetch('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'X-Restli-Protocol-Version': '2.0.0',
      },
    });
    
    if (!emailResponse.ok) {
      console.warn('Could not fetch email address, continuing with basic profile');
    }
    
    const emailData = await emailResponse.json();
    const email = emailData.elements?.[0]?.['handle~']?.emailAddress;
    
    return {
      success: true,
      data: {
        id: profileData.id,
        firstName: profileData.localizedFirstName,
        lastName: profileData.localizedLastName,
        email: email || 'Email not available',
        profilePicture: profileData.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier,
      }
    };
  } catch (error: any) {
    console.error(`[LINKEDIN ERROR] Get full profile: ${error.message}`);
    
    if (error.message.includes("No LinkedIn account")) {
      return { 
        success: false, 
        error: "No LinkedIn account connected",
        code: "NO_LINKEDIN_ACCOUNT"
      };
    }
    
    return { 
      success: false, 
      error: "Failed to fetch LinkedIn profile",
      details: error.message,
      code: "LINKEDIN_ERROR"
    };
  }
}

// Helper function to log tool calls
const logToolCall = (toolName: string, args: any, result: any) => {
  console.log(`[TOOL CALL] ${toolName}`);
  console.log(`[TOOL ARGS] ${JSON.stringify(args, null, 2)}`);
  console.log(`[TOOL RESPONSE] ${JSON.stringify(result, null, 2)}`);
};

// Create LinkedIn basic profile tool
export const getLinkedInBasicProfileTool = (getCurrentUserId: () => string) => new DynamicTool({
  name: "get_linkedin_basic_profile",
  description: "Gets basic profile information from LinkedIn including name, email, and profile picture.",
  func: async (args: string, runManager?: CallbackManagerForToolRun): Promise<string> => {
    try {
      const userId = getCurrentUserId();
      console.log(`[TOOL] get_linkedin_basic_profile called for user: ${userId}`);
      
      const result = await getBasicProfile(userId);
      
      logToolCall("get_linkedin_basic_profile", args, result);
      
      if (!result.success) {
        if (result.code === "NO_LINKEDIN_ACCOUNT") {
          return "You don't have a LinkedIn account connected. Please connect your LinkedIn account in the Providers section of your dashboard.";
        }
        return `Error: ${result.error}`;
      }
      
      const profile = result.data;
      if (!profile) {
        return "Error: LinkedIn profile data is unavailable.";
      }
      return `
LinkedIn Profile:
Name: ${profile.firstName} ${profile.lastName}
Email: ${profile.email}
Profile Picture: ${profile.profilePicture || 'Not available'}
      `.trim();
    } catch (error: any) {
      console.error("[TOOL ERROR] get_linkedin_basic_profile:", error);
      return `Error getting LinkedIn profile: ${error.message}`;
    }
  },
  returnDirect: false
});

// Create LinkedIn full profile tool
export const getLinkedInFullProfileTool = (getCurrentUserId: () => string) => new DynamicTool({
  name: "get_linkedin_full_profile",
  description: "Gets detailed profile information from LinkedIn including name, email, and profile picture.",
  func: async (args: string, runManager?: CallbackManagerForToolRun): Promise<string> => {
    try {
      const userId = getCurrentUserId();
      console.log(`[TOOL] get_linkedin_full_profile called for user: ${userId}`);
      
      const result = await getFullProfile(userId);
      
      logToolCall("get_linkedin_full_profile", args, result);
      
      if (!result.success) {
        if (result.code === "NO_LINKEDIN_ACCOUNT") {
          return "You don't have a LinkedIn account connected. Please connect your LinkedIn account in the Providers section of your dashboard.";
        }
        return `Error: ${result.error}`;
      }
      
      const profile = result.data;
      if (!profile) {
        return "Error: LinkedIn profile data is unavailable.";
      }

      return `
LinkedIn Profile:
Name: ${profile.firstName} ${profile.lastName}
Email: ${profile.email}
Profile Picture: ${profile.profilePicture || 'Not available'}
      `.trim();
    } catch (error: any) {
      console.error("[TOOL ERROR] get_linkedin_full_profile:", error);
      return `Error getting LinkedIn profile: ${error.message}`;
    }
  },
  returnDirect: false
});