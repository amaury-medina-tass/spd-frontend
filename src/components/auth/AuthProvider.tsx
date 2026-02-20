// src/components/auth/AuthProvider.tsx
"use client"

import {createContext, useCallback, useEffect, useMemo, useState} from "react"
import type {SessionMeResponse} from "@/types/auth"
import {getMe} from "@/lib/session"

type AuthContextValue = {
  me: SessionMeResponse | null
  loading: boolean
  refreshMe: () => Promise<void>
  clear: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({children}: Readonly<{children: React.ReactNode}>) {
  const [me, setMe] = useState<SessionMeResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshMe = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getMe()
      setMe(data)
    } catch {
      setMe(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    setMe(null)
  }, [])

  useEffect(() => {
    // Carga sesión al entrar (si hay cookie válida)
    refreshMe()
  }, [refreshMe])

  const value = useMemo<AuthContextValue>(
    () => ({me, loading, refreshMe, clear}),
    [me, loading, refreshMe, clear]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}