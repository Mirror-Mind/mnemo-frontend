import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { OnboardingFlow } from "@/components/dashboard/OnboardingFlow";
import { MainDashboard } from "@/components/dashboard/MainDashboard";

export default async function Page() {
  // Get user session and data
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Get full user data from database with phoneNumber
  const user = session?.user?.id
    ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
        },
      })
    : null;

  // Check if WhatsApp is connected by checking if phoneNumber exists
  const isWhatsAppConnected = user?.phoneNumber ? true : false;

  // Show onboarding flow for new users, main dashboard for connected users
  if (!isWhatsAppConnected) {
    return <OnboardingFlow />;
  }

  return <MainDashboard user={user} />;
}
