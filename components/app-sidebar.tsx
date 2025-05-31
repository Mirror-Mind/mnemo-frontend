"use client";

import * as React from "react";
import {
  IconDashboard,
  IconSettings,
  IconUserCircle,
  IconKey,
  IconMessageChatbot,
  IconBrandWhatsapp,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { User } from "@prisma/client";
import Link from "next/link";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Orbia Assistant",
      url: "/dashboard/chatbot",
      icon: IconMessageChatbot,
    },
    {
      title: "Account",
      url: "/dashboard/account",
      icon: IconUserCircle,
    },
    {
      title: "Integrations",
      url: "/dashboard/providers",
      icon: IconKey,
    },
    {
      title: "Settings",
      url: "/dashboard/setting",
      icon: IconSettings,
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  if (!user) {
    throw new Error("AppSidebar requires a user but received undefined.");
  }
  
  // Check if the user has connected WhatsApp (has a phone number)
  const isWhatsAppConnected = user.phoneNumber ? true : false;
  
  return (
    <Sidebar 
      collapsible="offcanvas" 
      className="border-r border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm"
      {...props}
    >
      <SidebarHeader className="pb-4 pt-6">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-4 data-[slot=sidebar-menu-button]:!mx-auto"
            >
              <Link href="/dashboard" className="flex items-center justify-center">
                <IconBrandWhatsapp className="size-6 text-green-500 mr-2" />
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  <span className="text-green-500">Whats</span>Link
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} className="space-y-1 px-3" />
      </SidebarContent>
      <SidebarFooter className="border-t border-gray-200 dark:border-gray-800 py-4">
        <div className="space-y-4 px-4">
          <div className="flex items-center gap-3 rounded-md bg-gray-50 dark:bg-gray-800/80 p-3 border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 border border-green-200 dark:border-green-900">
              <IconBrandWhatsapp className="h-5 w-5 text-green-500" />
            </div>
            <div className="space-y-0.5">
              {isWhatsAppConnected ? (
                <>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">WhatsApp Connected</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Your WhatsApp is ready to use
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Connect WhatsApp</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Add your WhatsApp number to get started
                  </p>
                </>
              )}
            </div>
          </div>
          
          <div className="pt-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
            <ProfileDropdown user={user} />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
