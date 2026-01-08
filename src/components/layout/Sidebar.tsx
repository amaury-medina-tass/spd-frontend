"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/useAuth"
import {
  Button,
  Tooltip,
} from "@heroui/react"
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Database,
  Users,
  ShieldCheck,
  Layers,
} from "lucide-react"

type MenuItem = {
  label: string
  href: string
  permissionPath?: string // Path del módulo para verificar permisos
  icon: React.ReactNode
}

type MenuSection = {
  title: string
  items: MenuItem[]
}

const menuSections: MenuSection[] = [
  {
    title: "General",
    items: [
      { label: "Home", href: "/dashboard", icon: <Home size={20} /> },
      { label: "Masters", href: "/dashboard/masters", icon: <Database size={20} /> },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        label: "Usuarios",
        href: "/dashboard/access-control/users",
        permissionPath: "/access-control/users",
        icon: <Users size={20} />,
      },
      {
        label: "Roles",
        href: "/dashboard/access-control/roles",
        permissionPath: "/access-control/roles",
        icon: <ShieldCheck size={20} />,
      },
      {
        label: "Módulos",
        href: "/dashboard/access-control/modules",
        permissionPath: "/access-control/modules",
        icon: <Layers size={20} />,
      },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { me } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)

  // Verificar si el usuario tiene permiso READ para un módulo
  const hasReadPermission = (permissionPath?: string) => {
    if (!permissionPath) return true // Si no requiere permiso, mostrar siempre
    if (!me?.permissions) return false
    const modulePermission = me.permissions[permissionPath]
    return modulePermission?.actions?.READ === true
  }

  // Filtrar items del menú basado en permisos
  const filterMenuItems = (items: MenuItem[]) => {
    return items.filter((item) => hasReadPermission(item.permissionPath))
  }

  const renderItem = (item: MenuItem) => {
    // Basic active check: exact match or starts with for nested routes if needed
    // Using simple inclusion for now as per original logic, but more strict for specific paths
    const isActive = pathname.includes(item.permissionPath || item.href)

    if (isCollapsed) {
      return (
        <Tooltip
          key={item.href}
          content={item.label}
          placement="right"
          delay={0}
          closeDelay={0}
        >
          <Button
            as={Link}
            href={item.href}
            isIconOnly
            variant={isActive ? "flat" : "light"}
            color={isActive ? "primary" : "default"}
            className="w-10 h-10"
          >
            {item.icon}
          </Button>
        </Tooltip>
      )
    }

    return (
      <Button
        key={item.href}
        as={Link}
        href={item.href}
        variant={isActive ? "flat" : "light"}
        color={isActive ? "primary" : "default"}
        className="justify-start w-full"
        startContent={item.icon}
      >
        {item.label}
      </Button>
    )
  }

  return (
    <aside
      className={`
        h-full border-r border-divider bg-background flex flex-col transition-all duration-300 ease-in-out flex-shrink-0
        ${isCollapsed ? "w-16" : "w-64"}
      `}
    >
      {/* Header with Toggle */}
      <div className={`p-4 flex items-center border-b border-divider h-16 ${isCollapsed ? "justify-center" : "justify-between"}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-lg">SPD</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">S</span>
          </div>
        )}

        {!isCollapsed && (
          <Tooltip content="Colapsar menú" placement="right">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onClick={toggleSidebar}
              className="text-default-500"
            >
              <ChevronLeft size={20} />
            </Button>
          </Tooltip>
        )}
      </div>

      {/* Collapsed Toggle Button (when collapsed, it replaces the header content essentially or sits below? 
          Actually reference puts toggle in header. Let's fix the header logic above to match reference interaction) */}
      {isCollapsed && (
        <div className="flex justify-center py-2 border-b border-divider">
          <Tooltip content="Expandir menú" placement="right">
            <Button
              isIconOnly
              variant="light"
              size="sm"
              onClick={toggleSidebar}
              className="text-default-500"
            >
              <ChevronRight size={20} />
            </Button>
          </Tooltip>
        </div>
      )}


      {/* Navigation */}
      <div className={`flex flex-col gap-4 p-2 overflow-y-auto flex-1 ${isCollapsed ? "items-center" : ""}`}>
        {menuSections.map((section) => {
          const visibleItems = filterMenuItems(section.items)
          // No mostrar la sección si no hay items visibles
          if (visibleItems.length === 0) return null

          return (
            <div key={section.title} className="flex flex-col gap-1 w-full">
              {!isCollapsed && (
                <span className="px-2 text-xs font-semibold text-default-500 uppercase mb-1">
                  {section.title}
                </span>
              )}

              <div className={`flex flex-col gap-1 ${isCollapsed ? "items-center" : ""}`}>
                {visibleItems.map((item) => renderItem(item))}
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
