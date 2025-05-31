"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconPalette, IconSun, IconMoon, IconDeviceDesktop } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

export default function Page() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Orbia Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Change the appearance of Orbia to your preferred theme.
        </p>
      </div>
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Choose your preferred theme.</CardDescription>
          </CardHeader>
          <CardContent>
            <Label className="mb-2 flex items-center gap-2"><IconPalette size={18}/> Theme</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-40 flex items-center justify-between">
                  {theme === "light" && <><IconSun size={16}/> Light</>}
                  {theme === "dark" && <><IconMoon size={16}/> Dark</>}
                  {theme === "system" && <><IconDeviceDesktop size={16}/> System</>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme("light")}> <IconSun size={16} className="mr-2"/> Light</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}> <IconMoon size={16} className="mr-2"/> Dark</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}> <IconDeviceDesktop size={16} className="mr-2"/> System</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
