"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { IconMoon, IconSun, IconDeviceDesktop } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Dark mode is enforced for Mnemo. This component is now a no-op.
export function ModeToggle() {
  return null;
}
