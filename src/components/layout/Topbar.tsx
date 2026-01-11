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
} from "@heroui/react"
import { ThemeToggle } from "./ThemeToggle"
import { useAuth } from "@/components/auth/useAuth"
import { useSidebar } from "@/context/SidebarContext"
import { post } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Menu, PanelLeftClose, PanelLeft, User, LogOut, ChevronDown } from "lucide-react"

export function Topbar() {
  const { me, clear } = useAuth()
  const { isOpen, isMobile, toggleSidebar } = useSidebar()

  const handleLogout = async () => {
    try {
      await post(endpoints.auth.logout)
    } catch {
      // incluso si falla, limpiamos front
    } finally {
      clear()
      window.location.href = "/login"
    }
  }

  // Get initials for avatar
  const initials = me ? `${me.first_name.charAt(0)}${me.last_name.charAt(0)}`.toUpperCase() : ""

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
          ) : isOpen ? (
            <PanelLeftClose size={20} />
          ) : (
            <PanelLeft size={20} />
          )}
        </Button>

        <span className="font-semibold">SPD</span>
      </NavbarContent>

      <NavbarContent justify="end" className="gap-2">
        <ThemeToggle />

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
