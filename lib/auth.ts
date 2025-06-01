import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { customSession, phoneNumber } from "better-auth/plugins";
import prisma from "./prisma";

// Helper function to safely get environment variables
const getEnvVar = (key: string, defaultValue: string = '') => {
  return process.env[key] || defaultValue;
};

// Check if we're in build time (dummy values present)
const isBuildTime = process.env.OPENAI_API_KEY?.includes('dummy-build-key');

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      console.log(`Reset password URL for ${user.email}: ${url}`);
    },
  },
  socialProviders: {
    google: {
      clientId: getEnvVar('GOOGLE_CLIENT_ID', 'dummy-client-id'),
      clientSecret: getEnvVar('GOOGLE_CLIENT_SECRET', 'dummy-client-secret'),
      scope: [
        "openid",
        "email",
        "profile",
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/drive.readonly",
        "https://www.googleapis.com/auth/documents.readonly",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/gmail.modify",
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/gmail.compose"
      ],
      redirectURI: getEnvVar('BETTERAUTH_URL') ? `${getEnvVar('BETTERAUTH_URL')}/api/auth/callback/google` : "http://localhost:3000/api/auth/callback/google",
      accessType: "offline",
      prompt: "consent",
    },
    github: {
      clientId: getEnvVar('GITHUB_CLIENT_ID', 'dummy-client-id'),
      clientSecret: getEnvVar('GITHUB_CLIENT_SECRET', 'dummy-client-secret'),
      scope: [
        "repo",
        "read:org",
        "user:email",
        "read:user"  
      ],
      redirectURI: getEnvVar('BETTERAUTH_URL') ? `${getEnvVar('BETTERAUTH_URL')}/api/auth/callback/github` : "http://localhost:3000/api/auth/callback/github",
    },
    linkedin: {
      clientId: getEnvVar('LINKEDIN_CLIENT_ID', 'dummy-client-id'),
      clientSecret: getEnvVar('LINKEDIN_CLIENT_SECRET', 'dummy-client-secret'),
      scope: [
        "openid",
        "profile",
        "email"
      ],
      redirectURI: getEnvVar('BETTERAUTH_URL') ? `${getEnvVar('BETTERAUTH_URL')}/api/auth/callback/linkedin` : "http://localhost:3000/api/auth/callback/linkedin",
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "github", "linkedin"],
      allowUnlinkingAll: true
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      // Skip database operations during build time
      if (isBuildTime) {
        return {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
          },
          session
        };
      }

      // Fetch the full user record to ensure all fields, including custom ones, are available
      const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { accounts: true }, // Include accounts directly if needed
      });

      if (!fullUser) {
        // Handle case where user might not be found, though unlikely in session context
        throw new Error("User not found during session creation");
      }
      
      // Construct the session user object from the full user data
      return {
        user: {
          id: fullUser.id,
          name: fullUser.name,
          email: fullUser.email,
          emailVerified: fullUser.emailVerified,
          image: fullUser.image,
          phoneNumber: fullUser.phoneNumber,
          phoneNumberVerified: fullUser.phoneNumberVerified,
          preferences: fullUser.preferences,
          accounts: fullUser.accounts, // Use accounts fetched with the user
          // Add any other necessary fields from fullUser
        },
        session
      };
    })
  ],
  trustedOrigins: [
    'https://orbia.ishaan812.com',
    'https://mnemo.ishaan812.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
});
