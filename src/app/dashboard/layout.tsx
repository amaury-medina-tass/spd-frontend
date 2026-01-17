"use client"

import { Sidebar } from "@/components/layout/Sidebar"
import { Topbar } from "@/components/layout/Topbar"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { SidebarProvider } from "@/context/SidebarContext"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0">
            <Topbar />
            <main className="p-4 md:p-6 overflow-auto">{children}</main>
          </div>
        </div>
      </SidebarProvider>
    </AuthGuard>
  )
}
