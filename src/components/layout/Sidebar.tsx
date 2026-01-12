"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/useAuth"
import { useSidebar } from "@/context/SidebarContext"
import {
  Button,
  Tooltip,
} from "@heroui/react"
import { X } from "lucide-react"
import { menuSections, MenuItem } from "@/config/navigation"

export function Sidebar() {
  const pathname = usePathname()
  const { me } = useAuth()
  const { isOpen, isMobile, closeSidebar } = useSidebar()

  // Verificar si el usuario tiene permiso READ para un módulo
  const hasReadPermission = (permissionPath?: string) => {
    if (!permissionPath) return true // Si no requiere permiso, mostrar siempre
    if (!me?.permissions) return false
    const modulePermission = me.permissions[permissionPath]
    return modulePermission?.actions?.READ?.allowed === true
  }

  // Filtrar items del menú basado en permisos
  const filterMenuItems = (items: MenuItem[]) => {
    return items.filter((item) => hasReadPermission(item.permissionPath))
  }

  // Cerrar sidebar al hacer clic en un item (solo en móvil)
  const handleItemClick = () => {
    if (isMobile) {
      closeSidebar()
    }
  }

  const renderItem = (item: MenuItem) => {
    const isActive =
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(item.href)

    const isCollapsedDesktop = !isMobile && !isOpen;

    return (
      <Tooltip
        key={item.href}
        content={item.label}
        placement="right"
        delay={0}
        closeDelay={0}
        isDisabled={!isCollapsedDesktop} // Mostrar tooltip solo cuando está colapsado en desktop
      >
        <Button
          as={Link}
          href={item.href}
          variant={isActive ? "flat" : "light"}
          color={isActive ? "primary" : "default"}
          className={`justify-start w-full ${isCollapsedDesktop ? "justify-center px-0" : ""}`}
          isIconOnly={isCollapsedDesktop}
          startContent={!isCollapsedDesktop ? item.icon : undefined} // hide startContent if iconOnly, manually render icon children
          onPress={handleItemClick}
        >
          {isCollapsedDesktop ? item.icon : item.label}
        </Button>
      </Tooltip>
    )
  }

  // Define styles based on state
  const sidebarWidth = isMobile ? "w-64" : (isOpen ? "w-64" : "w-20");
  const sidebarTransform = isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"; // Desktop always visible (just width changes), Mobile slides in/out

  // Desktop:
  // Open: w-64
  // Closed: w-20

  // Mobile:
  // Open: Translate-0 (Overlay)
  // Closed: Translate-full-negative (Hidden)

  // NOTE: Logic in SidebarContext says:
  // Mobile initial: Closed (isOpen=false)
  // Desktop initial: Open (isOpen=true)

  // If Mobile & Closed: translate-x-full (hidden)
  // If Mobile & Open: translate-x-0 (shown)

  // If Desktop & Closed: w-20
  // If Desktop & Open: w-64

  const sidebarClasses = `
    h-full bg-background flex flex-col flex-shrink-0
    border-r border-divider transition-all duration-300 ease-in-out
    ${sidebarWidth}
  `

  const mobileSidebarClasses = `
    fixed inset-y-0 left-0 z-50 w-64 bg-background
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? "translate-x-0" : "-translate-x-full"}
  `

  const content = (
    <>
      {/* Header */}
      <div className={`flex items-center transition-all duration-300 relative ${(!isMobile && !isOpen) ? "justify-center py-4" : "justify-between py-6"}`}>
        <div
          className={`
                flex flex-col items-center transition-all duration-300 w-full
                ${(isMobile || isOpen) ? "gap-2 px-2" : "gap-3"}
            `}
        >
          {/* Top Row: DAGRD + Bomberos */}
          <div className={`flex items-center justify-center transition-all duration-300 ${(isMobile || isOpen) ? "flex-row gap-6" : "flex-col gap-3"}`}>
            {/* DAGRD */}
            <div className={`relative flex-shrink-0 transition-all duration-300 ${(isMobile || isOpen) ? "w-20 h-20" : "w-8 h-8"}`}>
              <Image
                src="/images/dagrd.png"
                alt="DAGRD"
                fill
                sizes="(max-width: 768px) 80px, 80px"
                loading="eager"
                className="object-contain"
              />
            </div>

            {/* Bomberos */}
            <div className={`relative flex-shrink-0 transition-all duration-300 ${(isMobile || isOpen) ? "w-20 h-20" : "w-8 h-8"}`}>
              <Image
                src="/images/bomberos.png"
                alt="Bomberos"
                fill
                sizes="(max-width: 768px) 80px, 80px"
                className="object-contain"
              />
            </div>
          </div>

          {/* Bottom: Alcaldía */}
          <div className={`relative flex-shrink-0 transition-all duration-300 ${(isMobile || isOpen) ? "w-48 h-16" : "w-12 h-10"}`}>
            <Image
              src="/images/alcaldia.jpg"
              alt="Alcaldía"
              fill
              sizes="(max-width: 768px) 192px, 192px"
              loading="eager"
              className="object-contain"
            />
          </div>
        </div>

        {/* Botón cerrar solo visible en móvil */}
        {isMobile && (
          <Button
            isIconOnly
            variant="light"
            size="sm"
            onPress={closeSidebar}
            className="text-default-500 absolute top-4 right-2" // Absolute adjustments for better layout
          >
            <X size={20} />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-4 p-2 overflow-y-auto flex-1 overflow-x-hidden">
        {menuSections.map((section) => {
          const visibleItems = filterMenuItems(section.items)
          // No mostrar la sección si no hay items visibles
          if (visibleItems.length === 0) return null

          return (
            <div key={section.title} className="flex flex-col gap-1 w-full">
              {/* Separator for collapsed state */}
              {(!isMobile && !isOpen) && (
                <div className="w-full px-2 py-1">
                  <div className="h-px bg-divider w-full" />
                </div>
              )}

              {(isMobile || isOpen) && (
                <span className="px-2 text-xs font-semibold text-default-500 uppercase mb-1 whitespace-nowrap opacity-100 transition-opacity duration-200">
                  {section.title}
                </span>
              )}

              <div className="flex flex-col gap-1">
                {visibleItems.map((item) => renderItem(item))}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )


  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
            onClick={closeSidebar}
          />
        )}

        <aside className={mobileSidebarClasses}>
          {content}
        </aside>
      </>
    )
  }

  // Desktop
  return (
    <aside className={sidebarClasses}>
      {content}
    </aside>
  )
}
