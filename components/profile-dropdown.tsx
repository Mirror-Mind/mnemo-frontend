"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconLogout, IconUserCircle } from "@tabler/icons-react";
import LogoutButton from "@/components/auth/logout-button";
import Link from "next/link";

interface ProfileDropdownProps {
  user: {
    name?: string;
    email?: string;
    image?: string | null;
  };
}

export function ProfileDropdown({ user }: ProfileDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-4 cursor-pointer w-full p-2 rounded-md transition-colors">
          <div className="relative h-9 w-9 rounded-full bg-indigo-500/20 border border-indigo-200 dark:border-indigo-900 shadow-sm">
            <div className="absolute inset-0 flex items-center justify-center text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
            </div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-900 dark:text-white">{user.name || "User"}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{user.email}</div>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-md">
        <DropdownMenuLabel className="text-gray-700 dark:text-gray-300">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        <DropdownMenuItem asChild className="focus:bg-gray-100 dark:focus:bg-gray-700 cursor-pointer">
          <Link href="/dashboard/account" className="flex items-center text-gray-700 dark:text-gray-300">
            <IconUserCircle className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
        <DropdownMenuItem className="focus:bg-gray-100 dark:focus:bg-gray-700 cursor-pointer">
          <div className="flex items-center text-gray-700 dark:text-gray-300">
            <IconLogout className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <LogoutButton />
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 