// src/components/auth/AuthGuard.tsx
"use client"

import {useEffect} from "react"
import {useRouter, usePathname} from "next/navigation"
import {useAuth} from "./useAuth"

export function AuthGuard({children}: {children: React.ReactNode}) {
  const router = useRouter()
  const pathname = usePathname()
  const {me, loading} = useAuth()

  useEffect(() => {
    if (loading) return
    if (!me) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    }
  }, [loading, me, router, pathname])

  if (loading) return <div className="p-6 text-foreground-500">Loading...</div>
  if (!me) return null

  return <>{children}</>
}