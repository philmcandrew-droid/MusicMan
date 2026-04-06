"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { SettingsView } from "@/components/settings/settings-view"

export default function SettingsPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <header className="flex h-14 items-center gap-4 border-b border-border/50 px-4 lg:hidden">
          <SidebarTrigger className="-ml-2" />
          <Separator orientation="vertical" className="h-6" />
          <span className="font-semibold">MusicMan</span>
        </header>
        <main className="flex-1 overflow-hidden">
          <SettingsView />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
