"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { TunerView } from "@/components/tuner/tuner-view"
import { Separator } from "@/components/ui/separator"

export default function Home() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        {/* Mobile header */}
        <header className="flex h-14 items-center gap-4 border-b border-border/50 px-4 lg:hidden">
          <SidebarTrigger className="-ml-2" />
          <Separator orientation="vertical" className="h-6" />
          <span className="font-semibold">MusicMan</span>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          <TunerView />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
