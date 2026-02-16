import {
    Home,
    Users,
    ShieldCheck,
    Layers,
    Zap,
    ClipboardList,
    Lock,
    DollarSign,
    FileText,
    FileClock,
    FileSignature,
    FolderKanban,
    Database,
    Activity,
    BarChart3,
    FileCheck,
    Variable,
    Goal,
    LayoutDashboard,
} from "lucide-react"
import React, { ReactNode } from "react"

export type MenuItem = {
    label: string
    href: string
    permissionPath?: string
    icon: ReactNode
}

export type MenuGroup = {
    label: string
    icon: ReactNode
    items: MenuItem[]
}

export const menuItems: (MenuItem | MenuGroup)[] = [
    // Inicio - Item principal
    { label: "Inicio", href: "/dashboard", icon: React.createElement(Home, { size: 20 }) },

    // Menú Control de Acceso con submenús
    {
        label: "Control de Acceso",
        icon: React.createElement(Lock, { size: 20 }),
        items: [
            {
                label: "Usuarios",
                href: "/dashboard/access-control/users",
                permissionPath: "/access-control/users",
                icon: React.createElement(Users, { size: 18 }),
            },
            {
                label: "Roles",
                href: "/dashboard/access-control/roles",
                permissionPath: "/access-control/roles",
                icon: React.createElement(ShieldCheck, { size: 18 }),
            },
            {
                label: "Módulos",
                href: "/dashboard/access-control/modules",
                permissionPath: "/access-control/modules",
                icon: React.createElement(Layers, { size: 18 }),
            },
            {
                label: "Acciones",
                href: "/dashboard/access-control/actions",
                permissionPath: "/access-control/actions",
                icon: React.createElement(Zap, { size: 18 }),
            },
        ],
    },

    // Auditoría - Item principal
    {
        label: "Auditoría",
        href: "/dashboard/audit",
        permissionPath: "/audit",
        icon: React.createElement(ClipboardList, { size: 20 }),
    },

    // Menú Financiero con submenús
    {
        label: "Financiero",
        icon: React.createElement(DollarSign, { size: 20 }),
        items: [
            {
                label: "Dashboard",
                href: "/dashboard/financial/dashboard",
                permissionPath: "/financial/dashboard",
                icon: React.createElement(LayoutDashboard, { size: 18 }),
            },
            {
                label: "Necesidades",
                href: "/dashboard/financial/needs",
                permissionPath: "/financial/needs",
                icon: React.createElement(FileText, { size: 18 }),
            },
            {
                label: "Estudios Previos",
                href: "/dashboard/financial/previous-studies",
                permissionPath: "/financial/previous-studies",
                icon: React.createElement(FileClock, { size: 18 }),
            },
            {
                label: "Proyectos",
                href: "/dashboard/financial/projects",
                permissionPath: "/financial/projects",
                icon: React.createElement(FolderKanban, { size: 18 }),
            },
            {
                label: "Contratos Marco",
                href: "/dashboard/financial/master-contracts",
                permissionPath: "/financial/master-contracts",
                icon: React.createElement(FileSignature, { size: 18 }),
            },
            {
                label: "POAI PPA",
                href: "/dashboard/financial/poai-ppa",
                permissionPath: "/financial/poai-ppa",
                icon: React.createElement(BarChart3, { size: 18 }),
            },
            {
                label: "CDPs",
                href: "/dashboard/financial/cdps",
                permissionPath: "/financial/cdps",
                icon: React.createElement(FileCheck, { size: 18 }),
            },
        ],
    },

    // Menú Maestros con submenús
    {
        label: "Maestros",
        icon: React.createElement(Database, { size: 20 }),
        items: [
            {
                label: "Actividades",
                href: "/dashboard/masters/activities",
                permissionPath: "/masters/activities",
                icon: React.createElement(Activity, { size: 18 }),
            },
            {
                label: "Variables",
                href: "/dashboard/masters/variables",
                permissionPath: "/masters/variables",
                icon: React.createElement(Variable, { size: 18 }),
            },
            {
                label: "Indicadores",
                href: "/dashboard/masters/indicators",
                permissionPath: "/masters/indicators",
                icon: React.createElement(Goal, { size: 18 }),
            },
        ],
    },

    // Sub - Item principal
    {
        label: "Sub",
        icon: React.createElement(Layers, { size: 20 }),
        items: [
            {
                label: "Indicadores",
                href: "/dashboard/sub/indicators",
                permissionPath: "/sub/indicators",
                icon: React.createElement(Goal, { size: 18 }),
            },
            {
                label: "Variables",
                href: "/dashboard/sub/variables",
                permissionPath: "/sub/variables",
                icon: React.createElement(Variable, { size: 18 }),
            },
        ],
    },
]

// Helper to check if an item is a group
export const isMenuGroup = (item: MenuItem | MenuGroup): item is MenuGroup => {
    return "items" in item
}

// Flat list of all menu items for easy access
export const allMenuItems: MenuItem[] = menuItems.flatMap((item) =>
    isMenuGroup(item) ? item.items : [item]
)

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
