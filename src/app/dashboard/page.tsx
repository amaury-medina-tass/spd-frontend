"use client"

import { Card, CardBody, CardHeader } from "@heroui/react"
import { useAuth } from "@/components/auth/useAuth"

export default function DashboardHome() {
  const { me, loading } = useAuth()

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="font-semibold">Dashboard</CardHeader>
        <CardBody>
          {loading ? (
            <p className="text-foreground-500">Loading session...</p>
          ) : (
            <p className="text-foreground-500">
              Welcome {me?.email ?? "—"} 👋
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  )
}