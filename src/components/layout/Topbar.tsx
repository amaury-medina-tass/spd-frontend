"use client"

import { Navbar, NavbarBrand, NavbarContent } from "@heroui/react"
import { ThemeToggle } from "./ThemeToggle"
import { LogoutButton } from "@/components/auth/LogoutButton"
import { useAuth } from "@/components/auth/useAuth"

export function Topbar() {
  const { me } = useAuth()

  return (
    <Navbar isBordered>
      <NavbarBrand className="gap-2">
        <span className="font-semibold">SPD</span>
        <span className="text-foreground-500 text-sm">{me?.email ?? ""}</span>
      </NavbarBrand>

      <NavbarContent justify="end" className="gap-2">
        <ThemeToggle />
        <LogoutButton />
      </NavbarContent>
    </Navbar>
  )
}