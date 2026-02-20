"use client";

import React from "react";
import { HeroUIProvider } from "@heroui/react";
import { ToastProvider } from "@heroui/toast";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { AuthProvider } from "@/components/auth/AuthProvider";

export default function Providers({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
            <HeroUIProvider>
                <AuthProvider>{children}</AuthProvider>
                <ToastProvider />
            </HeroUIProvider>
        </NextThemesProvider>
    );
}