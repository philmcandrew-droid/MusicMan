"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Guitar,
  Piano,
  Puzzle,
  Music2,
  Lightbulb,
  CircleDot,
  Sparkles,
  Activity,
  Settings,
  HelpCircle,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "Tuner",
    icon: Activity,
    href: "/",
  },
  {
    title: "Guitar Chords",
    icon: Guitar,
    href: "/guitar-chords",
  },
  {
    title: "Piano Chords",
    icon: Piano,
    href: "/piano-chords",
  },
  {
    title: "Chord Builder",
    icon: Puzzle,
    href: "/chord-builder",
  },
  {
    title: "Song Structure",
    icon: Music2,
    href: "/song-structure",
  },
  {
    title: "Ideas",
    icon: Lightbulb,
    href: "/ideas",
  },
  {
    title: "Circle of 5ths",
    icon: CircleDot,
    href: "/circle-of-fifths",
  },
  {
    title: "AI Coach",
    icon: Sparkles,
    href: "/ai-coach",
  },
]

const footerItems = [
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
  {
    title: "Help",
    icon: HelpCircle,
    href: "/help",
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="px-4 py-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 group-hover:ring-primary/40 transition-all">
            <Music2 className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-lg tracking-tight">MusicMan</span>
            <span className="text-xs text-muted-foreground">Musician Assistant</span>
          </div>
        </Link>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={cn(
                        "h-11 px-3 transition-all duration-200",
                        isActive && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                      )}
                    >
                      <Link href={item.href}>
                        <item.icon className={cn(
                          "h-4 w-4 transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator className="mx-4" />

      <SidebarFooter className="px-2 pb-4">
        <SidebarMenu>
          {footerItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                className="h-10 px-3 text-muted-foreground hover:text-foreground"
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
