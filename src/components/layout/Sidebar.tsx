"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth/useAuth"
import { useSidebar } from "@/context/SidebarContext"
import {
  Button,
  Tooltip,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@heroui/react"
import { X, ChevronDown } from "lucide-react"
import { menuItems, MenuItem, MenuGroup, isMenuGroup } from "@/config/navigation"

export function Sidebar() {
  const pathname = usePathname()
  const { me } = useAuth()
  const { isOpen, isMobile, closeSidebar } = useSidebar()
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Control de Acceso"])

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

  // Toggle menu expansion
  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    )
  }

  // Cerrar sidebar al hacer clic en un item (solo en móvil)
  const handleItemClick = () => {
    if (isMobile) {
      closeSidebar()
    }
  }

  const isCollapsedDesktop = !isMobile && !isOpen

  const renderMenuItem = (item: MenuItem, isSubmenu = false) => {
    const isActive =
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(item.href)

    return (
      <Tooltip
        key={item.href}
        content={item.label}
        placement="right"
        delay={0}
        closeDelay={0}
        isDisabled={!isCollapsedDesktop || isSubmenu}
      >
        <Button
          as={Link}
          href={item.href}
          variant={isActive ? "flat" : "light"}
          color={isActive ? "primary" : "default"}
          className={`
            justify-start w-full
            ${isCollapsedDesktop && !isSubmenu ? "!justify-center !px-0 mx-auto" : ""}
            ${isSubmenu && !isCollapsedDesktop ? "pl-10 text-sm" : ""}
          `}
          isIconOnly={isCollapsedDesktop && !isSubmenu}
          startContent={(!isCollapsedDesktop || isSubmenu) ? item.icon : undefined}
          onPress={handleItemClick}
        >
          {isCollapsedDesktop && !isSubmenu ? item.icon : item.label}
        </Button>
      </Tooltip>
    )
  }

  const renderMenuGroup = (group: MenuGroup) => {
    const visibleItems = filterMenuItems(group.items)
    if (visibleItems.length === 0) return null

    const isExpanded = expandedMenus.includes(group.label)
    const hasActiveChild = visibleItems.some((item) =>
      item.href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname.startsWith(item.href)
    )

    // Collapsed desktop mode - show popover menu to the right
    if (isCollapsedDesktop) {
      return (
        <Popover
          key={group.label}
          placement="right-start"
          offset={35}
          showArrow
        >
          <PopoverTrigger>
            <Button
              variant={hasActiveChild ? "flat" : "light"}
              color={hasActiveChild ? "primary" : "default"}
              className="!justify-center !px-0 mx-auto"
              isIconOnly
            >
              {group.icon}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 overflow-hidden">
            <div className="flex flex-col min-w-[200px]">
              {/* Header con gradiente */}
              <div className="px-3 py-2.5 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-divider">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-primary/20 text-primary">
                    {group.icon}
                  </span>
                  <span className="text-sm font-semibold text-foreground">
                    {group.label}
                  </span>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-1.5 flex flex-col gap-0.5">
                {visibleItems.map((item) => {
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === "/dashboard"
                      : pathname.startsWith(item.href)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150
                        ${isActive
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-default-100 text-foreground"
                        }
                      `}
                    >
                      <span className={`
                        flex-shrink-0 p-1 rounded-md
                        ${isActive ? "bg-primary-foreground/20" : "bg-default-200/50"}
                      `}>
                        {item.icon}
                      </span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )
    }

    // Expanded mode - show full menu with submenus
    return (
      <div key={group.label} className="flex flex-col gap-1 w-full">
        <Button
          variant={hasActiveChild ? "flat" : "light"}
          color={hasActiveChild ? "primary" : "default"}
          className="justify-between w-full"
          startContent={group.icon}
          endContent={
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            />
          }
          onPress={() => toggleMenu(group.label)}
        >
          <span className="flex-1 text-left">{group.label}</span>
        </Button>

        {/* Submenu items with animated container */}
        <div
          className={`
            flex flex-col gap-1 overflow-hidden transition-all duration-200 ease-in-out
            ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}
          `}
        >
          <div className="relative pl-3 ml-3 border-l-2 border-divider">
            {visibleItems.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href)

              return (
                <Button
                  key={item.href}
                  as={Link}
                  href={item.href}
                  variant={isActive ? "flat" : "light"}
                  color={isActive ? "primary" : "default"}
                  className="justify-start w-full text-sm pl-3"
                  startContent={item.icon}
                  onPress={handleItemClick}
                >
                  {item.label}
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Define styles based on state
  const collapsedWidth = isOpen ? "w-64" : "w-20";
  const sidebarWidth = isMobile ? "w-64" : collapsedWidth;

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
            className="text-default-500 absolute top-4 right-2"
          >
            <X size={20} />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-2 p-2 overflow-y-auto flex-1 overflow-x-hidden">
        {menuItems.map((item) => {
          if (isMenuGroup(item)) {
            return renderMenuGroup(item)
          }
          return renderMenuItem(item)
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
            aria-hidden="true"
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
