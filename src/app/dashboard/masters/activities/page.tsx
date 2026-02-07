"use client"

import { Breadcrumbs, BreadcrumbItem, Button, Tooltip } from "@heroui/react"
import { useState } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import { Eye, AlertCircle, Download } from "lucide-react"
import { DetailedActivitiesTab } from "./DetailedActivitiesTab"
import { MGAActivitiesTab } from "./MGAActivitiesTab"
import { requestExport } from "@/services/exports.service"
import { addToast } from "@heroui/toast"

export default function MastersActivitiesPage() {
    const { canRead } = usePermissions("/masters/activities")
    const [selectedTab, setSelectedTab] = useState<string>("mga")
    const [exporting, setExporting] = useState(false)

    async function handleExport() {
        try {
            setExporting(true)
            await requestExport({ system: "SPD", type: "ACTIVITIES" })
            addToast({
                title: "Exportación solicitada",
                description: "Recibirás una notificación cuando el archivo esté listo para descargar.",
                color: "primary",
                timeout: 5000,
            })
        } catch {
            addToast({
                title: "Error",
                description: "No se pudo solicitar la exportación. Intenta de nuevo.",
                color: "danger",
                timeout: 5000,
            })
        } finally {
            setExporting(false)
        }
    }

    return (
        <div className="grid gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Inicio</BreadcrumbItem>
                <BreadcrumbItem>Maestros</BreadcrumbItem>
                <BreadcrumbItem>Actividades</BreadcrumbItem>
            </Breadcrumbs>

            {!canRead ? (
                <div className="text-center py-16">
                    <p className="text-xl font-semibold text-danger">Acceso Denegado</p>
                    <p className="text-default-500 mt-2">No tienes permisos para ver este módulo.</p>
                </div>
            ) : (
                <>
                    {/* Selection Pills + Export Button */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-3">
                            <div
                                onClick={() => setSelectedTab("mga")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${selectedTab === "mga"
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-default-100 text-default-600 hover:bg-default-200"
                                    }`}
                            >
                                <AlertCircle size={16} />
                                <span className="text-sm font-medium">MGA</span>
                            </div>

                            <div
                                onClick={() => setSelectedTab("detailed")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${selectedTab === "detailed"
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-default-100 text-default-600 hover:bg-default-200"
                                    }`}
                            >
                                <Eye size={16} />
                                <span className="text-sm font-medium">Detalladas</span>
                            </div>
                        </div>

                        <Tooltip content="Exportar todas las actividades a Excel">
                            <Button
                                color="success"
                                variant="flat"
                                startContent={<Download size={16} />}
                                isLoading={exporting}
                                onPress={handleExport}
                            >
                                Exportar Actividades
                            </Button>
                        </Tooltip>
                    </div>

                    {/* Content based on selected tab */}
                    {selectedTab === "mga" && <MGAActivitiesTab />}
                    {selectedTab === "detailed" && <DetailedActivitiesTab />}
                </>
            )}
        </div>
    )
}
