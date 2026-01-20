"use client"

import { Breadcrumbs, BreadcrumbItem } from "@heroui/react"
import { useState } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import { Table, BarChart3 } from "lucide-react"
import { PoaiPpaTableTab } from "./PoaiPpaTableTab"
import { PoaiPpaChartsTab } from "./PoaiPpaChartsTab"

export default function PoaiPpaPage() {
    const { canRead } = usePermissions("/financial/poai-ppa")
    const [selectedTab, setSelectedTab] = useState<string>("registro")

    return (
        <div className="grid gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Inicio</BreadcrumbItem>
                <BreadcrumbItem>Financiero</BreadcrumbItem>
                <BreadcrumbItem>POAI PPA</BreadcrumbItem>
            </Breadcrumbs>

            {!canRead ? (
                <div className="text-center py-16">
                    <p className="text-xl font-semibold text-danger">Acceso Denegado</p>
                    <p className="text-default-500 mt-2">No tienes permisos para ver este módulo.</p>
                </div>
            ) : (
                <>
                    {/* Selection Pills */}
                    <div className="flex gap-3">
                        <div
                            onClick={() => setSelectedTab("registro")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${selectedTab === "registro"
                                ? "bg-primary text-white shadow-sm"
                                : "bg-default-100 text-default-600 hover:bg-default-200"
                                }`}
                        >
                            <Table size={16} />
                            <span className="text-sm font-medium">Registro</span>
                        </div>

                        <div
                            onClick={() => setSelectedTab("graficas")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${selectedTab === "graficas"
                                ? "bg-primary text-white shadow-sm"
                                : "bg-default-100 text-default-600 hover:bg-default-200"
                                }`}
                        >
                            <BarChart3 size={16} />
                            <span className="text-sm font-medium">Gráficas</span>
                        </div>
                    </div>

                    {/* Content based on selected tab */}
                    {selectedTab === "registro" && <PoaiPpaTableTab />}
                    {selectedTab === "graficas" && <PoaiPpaChartsTab />}
                </>
            )}
        </div>
    )
}
