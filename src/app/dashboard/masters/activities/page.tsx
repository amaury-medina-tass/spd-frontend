"use client"

import { Breadcrumbs, BreadcrumbItem } from "@heroui/react"
import { useState } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import { Eye, AlertCircle } from "lucide-react"
import { DetailedActivitiesTab } from "./DetailedActivitiesTab"
import { MGAActivitiesTab } from "./MGAActivitiesTab"

export default function MastersActivitiesPage() {
    const { canRead } = usePermissions("/masters/activities")
    const [selectedTab, setSelectedTab] = useState<string>("mga")

    return (
        <div className="grid gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Inicio</BreadcrumbItem>
                <BreadcrumbItem>Maestros</BreadcrumbItem>
                <BreadcrumbItem>Actividades</BreadcrumbItem>
            </Breadcrumbs>

            {canRead ? (
                <>
                    {/* Selection Pills */}
                    <div className="flex gap-3">
                        <div
                            role="tab"
                            tabIndex={0}
                            onClick={() => setSelectedTab("mga")}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedTab("mga") }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${selectedTab === "mga"
                                ? "bg-primary text-white shadow-sm"
                                : "bg-default-100 text-default-600 hover:bg-default-200"
                                }`}
                        >
                            <AlertCircle size={16} />
                            <span className="text-sm font-medium">MGA</span>
                        </div>

                        <div
                            role="tab"
                            tabIndex={0}
                            onClick={() => setSelectedTab("detailed")}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedTab("detailed") }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${selectedTab === "detailed"
                                ? "bg-primary text-white shadow-sm"
                                : "bg-default-100 text-default-600 hover:bg-default-200"
                                }`}
                        >
                            <Eye size={16} />
                            <span className="text-sm font-medium">Detalladas</span>
                        </div>
                    </div>

                    {/* Content based on selected tab */}
                    {selectedTab === "mga" && <MGAActivitiesTab />}
                    {selectedTab === "detailed" && <DetailedActivitiesTab />}
                </>
            ) : (
                <div className="text-center py-16">
                    <p className="text-xl font-semibold text-danger">Acceso Denegado</p>
                    <p className="text-default-500 mt-2">No tienes permisos para ver este módulo.</p>
                </div>
            )}
        </div>
    )
}
