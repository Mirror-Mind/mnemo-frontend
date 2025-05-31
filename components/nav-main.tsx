"use client";

import { type Icon } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function NavMain({
  items,
  className,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
  className?: string;
}) {
  const pathname = usePathname();
  
  return (
    <SidebarGroup>
      <SidebarGroupContent className={cn("flex flex-col", className)}>
        <SidebarMenu>
          {items.map((item) => {
            // Check if current path exactly matches the URL or is a child route
            // For "/dashboard" we need to check exact match to avoid matching all dashboard sub-routes
            const isActive = item.url === "/dashboard" 
              ? pathname === "/dashboard" 
              : pathname === item.url || pathname.startsWith(`${item.url}/`);
            
            return (
              <SidebarMenuItem key={item.title}>
                <Link href={item.url}>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    className={cn(
                      "transition-colors", 
                      isActive 
                        ? "bg-green-500/10 text-green-600 dark:text-green-400 font-medium" 
                        : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    {item.icon && <item.icon className={cn("size-5", isActive ? "text-green-500" : "")} />}
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
