import { ReactNode } from "react"
import {
    Home,
    Database,
    Users,
    ShieldCheck,
    Layers,
    Zap,
    ClipboardList,
} from "lucide-react"
import React from "react"

export type MenuItem = {
    label: string
    href: string
    permissionPath?: string
    icon: ReactNode
}

export type MenuSection = {
    title: string
    items: MenuItem[]
}

export const menuSections: MenuSection[] = [
    {
        title: "General",
        items: [
            { label: "Inicio", href: "/dashboard", icon: React.createElement(Home, { size: 20 }) },
            { label: "Masters", href: "/dashboard/masters", icon: React.createElement(Database, { size: 20 }) },
        ],
    },
    {
        title: "Administration",
        items: [
            {
                label: "Usuarios",
                href: "/dashboard/access-control/users",
                permissionPath: "/access-control/users",
                icon: React.createElement(Users, { size: 20 }),
            },
            {
                label: "Roles",
                href: "/dashboard/access-control/roles",
                permissionPath: "/access-control/roles",
                icon: React.createElement(ShieldCheck, { size: 20 }),
            },
            {
                label: "Módulos",
                href: "/dashboard/access-control/modules",
                permissionPath: "/access-control/modules",
                icon: React.createElement(Layers, { size: 20 }),
            },
            {
                label: "Acciones",
                href: "/dashboard/access-control/actions",
                permissionPath: "/access-control/actions",
                icon: React.createElement(Zap, { size: 20 }),
            },
            {
                label: "Auditoría",
                href: "/dashboard/audit",
                permissionPath: "/audit",
                icon: React.createElement(ClipboardList, { size: 20 }),
            },
        ],
    },
]

// Flat list of all menu items for easy access
export const allMenuItems: MenuItem[] = menuSections.flatMap((section) => section.items)

// Get all available routes with permission paths (for module selection)
export const getAvailableRoutes = () => {
    return allMenuItems
        .filter((item) => item.permissionPath)
        .map((item) => ({
            label: item.label,
            path: item.permissionPath!,
            href: item.href,
        }))
}
