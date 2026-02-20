"use client"

import Link from "next/link"
import {
  Navbar,
  NavbarContent,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
  Badge,
  Popover,
  PopoverTrigger,
  PopoverContent,
  ScrollShadow,
  Divider,
} from "@heroui/react"
import { ThemeToggle } from "./ThemeToggle"
import { useAuth } from "@/components/auth/useAuth"
import { useSidebar } from "@/context/SidebarContext"
import { useNotifications, PersistedNotification } from "@/context/NotificationContext"
import { post } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Menu, PanelLeftClose, PanelLeft, User, LogOut, Bell, CheckCheck, Download } from "lucide-react"

function formatTimeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "Ahora"
  if (diffMin < 60) return `Hace ${diffMin}m`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `Hace ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  return `Hace ${diffD}d`
}

function triggerDownload(url: string, fileName: string) {
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
}

function NotificationItem({
  notification,
  onMarkRead,
}: Readonly<{
  notification: PersistedNotification
  onMarkRead: (id: string) => void
}>) {
  const isExport = notification.event === "Files.ExportCompleted" && (notification.data as any)?.downloadUrl

  return (
    <button
      type="button"
      className={`w-full text-left px-4 py-3 cursor-pointer transition-all duration-200 bg-transparent border-none ${
        notification.is_read
          ? "opacity-60 hover:bg-default-50"
          : "hover:bg-default-100"
      }`}
      onClick={() => {
        if (!notification.is_read) onMarkRead(notification.id)
      }}
    >
      <div className="flex items-start gap-3">
        {/* Indicador de no leído */}
        <div className="pt-1.5 flex-shrink-0">
          {notification.is_read ? (
            <div className="w-2 h-2" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-primary" />
          )}
        </div>
        
        {/* Contenido de la notificación */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <p className={`text-sm leading-tight ${
              notification.is_read ? "font-normal text-foreground-600" : "font-semibold text-foreground"
            }`}>
              {notification.title}
            </p>
            <span className="text-[10px] text-foreground-400 whitespace-nowrap flex-shrink-0">
              {formatTimeAgo(notification.created_at)}
            </span>
          </div>
          <p className="text-xs text-foreground-500 leading-relaxed">
            {notification.message}
          </p>
          
          {isExport && (
            <div className="mt-3">
              <Button
                size="sm"
                variant="flat"
                color="primary"
                className="h-8 text-xs font-medium"
                startContent={<Download className="w-3.5 h-3.5" />}
                onPress={() => {
                  const data = notification.data as any
                  triggerDownload(
                    data.downloadUrl as string,
                    (data.fileName as string) || "export.xlsx"
                  )
                }}
              >
                Descargar archivo
              </Button>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

export function Topbar() {
  const { me, clear } = useAuth()
  const { isOpen, isMobile, toggleSidebar } = useSidebar()
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications()

  const handleLogout = async () => {
    try {
      await post(endpoints.auth.logout)
    } catch {
      // incluso si falla, limpiamos front
    } finally {
      clear()
      globalThis.location.href = "/login"
    }
  }

  // Get initials for avatar
  const initials = me ? `${me.first_name.charAt(0)}${me.last_name.charAt(0)}`.toUpperCase() : ""

  const sidebarToggleIcon = isOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />;
  const badgeLabel = unreadCount > 99 ? "99+" : unreadCount;

  return (
    <Navbar isBordered maxWidth="full">
      <NavbarContent justify="start" className="gap-2">
        {/* Botón toggle sidebar */}
        <Button
          isIconOnly
          variant="light"
          onPress={toggleSidebar}
          aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMobile ? (
            <Menu size={20} />
          ) : sidebarToggleIcon}
        </Button>

        <span className="font-semibold">SPD</span>
      </NavbarContent>

      <NavbarContent justify="end" className="gap-2">
        <ThemeToggle />

        {/* Notification Bell */}
        <Popover placement="bottom-end" offset={12} showArrow>
          <PopoverTrigger>
            <Button isIconOnly variant="light" aria-label="Notificaciones" className="relative">
              <Badge
                content={unreadCount > 0 ? badgeLabel : undefined}
                color="danger"
                size="sm"
                shape="circle"
                isInvisible={unreadCount === 0}
              >
                <Bell size={20} />
              </Badge>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[360px]">
            <div className="w-full">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3">
                <h3 className="text-sm font-semibold">Notificaciones</h3>
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    variant="light"
                    color="primary"
                    className="h-7 text-xs"
                    startContent={<CheckCheck className="w-3 h-3" />}
                    onPress={markAllAsRead}
                  >
                    Marcar todas como leídas
                  </Button>
                )}
              </div>
              <Divider />

              {/* Notification List */}
              <ScrollShadow className="max-h-[400px]">
                {loading && notifications.length === 0 && (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-sm text-foreground-400">Cargando...</p>
                  </div>
                )}
                {!loading && notifications.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <Bell className="w-8 h-8 text-foreground-300" />
                    <p className="text-sm text-foreground-400">No tienes notificaciones</p>
                  </div>
                )}
                {notifications.length > 0 && (
                  <div className="divide-y divide-divider">
                    {notifications.map((n) => (
                      <NotificationItem
                        key={n.id}
                        notification={n}
                        onMarkRead={markAsRead}
                      />
                    ))}
                  </div>
                )}
              </ScrollShadow>
            </div>
          </PopoverContent>
        </Popover>

        <Dropdown placement="bottom-end" offset={12}>
          <DropdownTrigger>
            <Button
              variant="light"
              className="h-auto py-1.5 px-2 gap-3"
            >
              <div className="flex flex-col items-end text-right">
                <span className="font-semibold text-sm leading-tight">
                  {me?.first_name} {me?.last_name}
                </span>
                <span className="text-xs text-foreground-500 leading-tight">
                  {me?.email}
                </span>
              </div>
              <Avatar
                name={initials}
                size="sm"
                className="bg-primary text-white"
              />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Opciones de usuario" variant="flat">
            <DropdownItem
              key="profile"
              as={Link}
              href="/dashboard/profile"
              startContent={<User className="w-4 h-4" />}
            >
              Mi Perfil
            </DropdownItem>
            <DropdownItem
              key="logout"
              color="danger"
              startContent={<LogOut className="w-4 h-4" />}
              onPress={handleLogout}
            >
              Cerrar Sesión
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </Navbar>
  )
}
