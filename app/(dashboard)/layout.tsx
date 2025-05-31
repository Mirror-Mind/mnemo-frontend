import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { SidebarWrapper } from "@/components/SidebarWrapper";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return;
  }

  // Create a user object that matches the expected type
  const user = {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    emailVerified: session.user.emailVerified,
    image: session.user.image ?? null,
    phoneNumber: session.user.phoneNumber ?? null,
    phoneNumberVerified: session.user.phoneNumberVerified ?? null,
    // Default values for required fields that may not be in session.user
    createdAt: new Date(),
    updatedAt: new Date(),
    lang: null,
  };

  return (
    <SidebarWrapper>
      <div className="flex h-screen w-full bg-gray-50 dark:bg-gray-900">
        <AppSidebar
          user={user}
          variant="inset"
        />
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-7xl p-6">
            {children}
          </div>
        </div>
      </div>
    </SidebarWrapper>
  );
}
