"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"

type SidebarContextType = {
    isOpen: boolean
    isMobile: boolean
    toggleSidebar: () => void
    closeSidebar: () => void
    openSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

const MOBILE_BREAKPOINT = 768

export function SidebarProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    const [isOpen, setIsOpen] = useState(true)
    const [isMobile, setIsMobile] = useState(false)

    // Detectar cambios en el viewport
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < MOBILE_BREAKPOINT
            setIsMobile(mobile)
            // En móvil, el sidebar inicia cerrado
            if (mobile) {
                setIsOpen(false)
            } else {
                setIsOpen(true)
            }
        }

        // Check inicial
        checkMobile()

        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    const toggleSidebar = useCallback(() => {
        setIsOpen((prev) => !prev)
    }, [])

    const closeSidebar = useCallback(() => {
        setIsOpen(false)
    }, [])

    const openSidebar = useCallback(() => {
        setIsOpen(true)
    }, [])

    const contextValue = useMemo(() => ({
        isOpen,
        isMobile,
        toggleSidebar,
        closeSidebar,
        openSidebar,
    }), [isOpen, isMobile, toggleSidebar, closeSidebar, openSidebar])

    return (
        <SidebarContext.Provider
            value={contextValue}
        >
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebar() {
    const context = useContext(SidebarContext)
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider")
    }
    return context
}
