"use client"

import { useTheme } from "next-themes"
import { Button } from "@heroui/react"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button isIconOnly variant="light" aria-label="Toggle theme">
                <Sun className="h-5 w-5" />
            </Button>
        )
    }

    return (
        <Button
            isIconOnly
            variant="light"
            aria-label="Toggle theme"
            onPress={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
            {theme === "dark" ? (
                <Sun className="h-5 w-5" />
            ) : (
                <Moon className="h-5 w-5" />
            )}
        </Button>
    )
}
