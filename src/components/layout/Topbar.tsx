"use client"

import { Navbar, NavbarBrand, NavbarContent, Button } from "@heroui/react"
import { ThemeToggle } from "./ThemeToggle"
import { LogoutButton } from "@/components/auth/LogoutButton"
import { useAuth } from "@/components/auth/useAuth"
import { useSidebar } from "@/context/SidebarContext"
import { Menu, PanelLeftClose, PanelLeft } from "lucide-react"

export function Topbar() {
  const { me } = useAuth()
  const { isOpen, isMobile, toggleSidebar } = useSidebar()

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
        <span className="text-foreground-500 text-sm hidden sm:inline">{me?.email ?? ""}</span>
      </NavbarContent>

      <NavbarContent justify="end" className="gap-2">
        <ThemeToggle />
        <LogoutButton />
      </NavbarContent>
    </Navbar>
  )
}
