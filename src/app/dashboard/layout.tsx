"use client"

import {Sidebar} from "@/components/layout/Sidebar"
import {Topbar} from "@/components/layout/Topbar"
import {AuthGuard} from "@/components/auth/AuthGuard"

export default function DashboardLayout({children}: {children: React.ReactNode}) {
  return (
    <AuthGuard>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-col flex-1">
          <Topbar />
          <main className="p-6 overflow-auto">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}