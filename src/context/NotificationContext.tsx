"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, createElement } from "react"
import { io, Socket } from "socket.io-client"
import { addToast } from "@heroui/toast"
import { get, patch } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"

export interface WsNotification {
  id: string
  event: string
  title: string
  message: string
  data?: Record<string, unknown>
  timestamp: string
}

export interface PersistedNotification {
  id: string
  user_id: string
  event: string
  title: string
  message: string
  data?: Record<string, unknown>
  is_read: boolean
  created_at: string
}

interface NotificationContextValue {
  /** Whether WebSocket is connected */
  connected: boolean
  /** Persisted notifications from API */
  notifications: PersistedNotification[]
  /** Unread notification count */
  unreadCount: number
  /** Clear all local notifications */
  clearNotifications: () => void
  /** Mark a single notification as read */
  markAsRead: (id: string) => Promise<void>
  /** Mark all notifications as read */
  markAllAsRead: () => Promise<void>
  /** Refresh notifications from API */
  refreshNotifications: () => Promise<void>
  /** Whether notifications are loading */
  loading: boolean
}

const NotificationContext = createContext<NotificationContextValue>({
  connected: false,
  notifications: [],
  unreadCount: 0,
  clearNotifications: () => { },
  markAsRead: async () => { },
  markAllAsRead: async () => { },
  refreshNotifications: async () => { },
  loading: false,
})

export function useNotifications() {
  return useContext(NotificationContext)
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:8080"

interface Props {
  children: React.ReactNode
}

function triggerDownload(url: string, fileName: string) {
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
}

function handleNotificationEvent(
  data: WsNotification,
  isCancelled: () => boolean,
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>,
  setNotifications: React.Dispatch<React.SetStateAction<PersistedNotification[]>>,
) {
  setUnreadCount((prev) => prev + 1)

  get<PersistedNotification[]>(endpoints.notifications.list + "?limit=30")
    .then(notifications => {
      if (!isCancelled()) {
        setNotifications(notifications ?? [])
      }
    })
    .catch(() => {
      // Ignore errors - notifications will refresh next time panel opens
    })

  const isExportCompleted = data.event === "Files.ExportCompleted"

  let color: "success" | "warning" | "danger" | "primary" = "primary"
  if (data.event.includes("Completed") || data.event.includes("Created") || data.event.includes("Approved")) {
    color = "success"
  } else if (data.event.includes("Failed")) {
    color = "danger"
  } else if (data.event.includes("Sync")) {
    color = "warning"
  }

  if (isExportCompleted && data.data?.downloadUrl) {
    const downloadUrl = data.data.downloadUrl as string
    const fileName = (data.data.fileName as string) || "export.xlsx"

    addToast({
      title: data.title,
      description: data.message,
      color: "success",
      timeout: 15000,
      endContent: createElement(
        "button",
        {
          onClick: () => triggerDownload(downloadUrl, fileName),
          className: "ml-2 px-3 py-1 text-xs font-semibold rounded-md bg-white/20 hover:bg-white/30 text-white transition-colors whitespace-nowrap",
        },
        "Descargar"
      ),
    })
  } else {
    addToast({
      title: data.title,
      description: data.message,
      color,
      timeout: 8000,
    })
  }
}

function attachSocketListeners(
  socket: Socket,
  isCancelled: () => boolean,
  setConnected: (v: boolean) => void,
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>,
  setNotifications: React.Dispatch<React.SetStateAction<PersistedNotification[]>>,
) {
  socket.on("connect", () => {
    if (!isCancelled()) setConnected(true)
  })
  socket.on("disconnect", () => {
    if (!isCancelled()) setConnected(false)
  })
  socket.on("notification", (data: WsNotification) => {
    if (isCancelled()) return
    handleNotificationEvent(data, isCancelled, setUnreadCount, setNotifications)
  })
}

export function NotificationProvider({ children }: Readonly<Props>) {
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)
  const [notifications, setNotifications] = useState<PersistedNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const clearNotifications = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  /** Fetch notifications from API */
  const refreshNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const [notifications, unreadResult] = await Promise.all([
        get<PersistedNotification[]>(endpoints.notifications.list + "?limit=30"),
        get<{ count: number }>(endpoints.notifications.unreadCount),
      ])
      setNotifications(notifications ?? [])
      setUnreadCount(unreadResult?.count ?? 0)
    } catch (err) {
      console.error("[Notifications] Failed to fetch notifications:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  /** Mark a single notification as read */
  const markAsRead = useCallback(async (id: string) => {
    try {
      await patch(endpoints.notifications.markRead(id))
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error("[Notifications] Failed to mark as read:", err)
    }
  }, [])

  /** Mark all notifications as read */
  const markAllAsRead = useCallback(async () => {
    try {
      await patch(endpoints.notifications.readAll)
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error("[Notifications] Failed to mark all as read:", err)
    }
  }, [])

  // Fetch notifications on mount
  useEffect(() => {
    refreshNotifications()
  }, [refreshNotifications])

  // WebSocket connection
  useEffect(() => {
    let cancelled = false
    const isCancelled = () => cancelled

    async function connect() {
      let token: string | null = null
      try {
        const res = await get<{ token: string }>(endpoints.auth.wsToken)
        token = res.token
      } catch {
        return
      }

      if (cancelled || !token) return

      const socket = io(`${WS_URL}/notifications`, {
        path: "/public/socket.io",
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 2000,
        reconnectionAttempts: 10,
      })

      socketRef.current = socket
      attachSocketListeners(socket, isCancelled, setConnected, setUnreadCount, setNotifications)
    }

    connect()

    return () => {
      cancelled = true
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
      setConnected(false)
    }
  }, [])

  const contextValue = useMemo(() => ({
    connected,
    notifications,
    unreadCount,
    clearNotifications,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
    loading,
  }), [connected, notifications, unreadCount, clearNotifications, markAsRead, markAllAsRead, refreshNotifications, loading])

  return (
    <NotificationContext.Provider
      value={contextValue}
    >
      {children}
    </NotificationContext.Provider>
  )
}
