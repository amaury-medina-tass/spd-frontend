"use client"

import { Breadcrumbs, BreadcrumbItem, Button, Tooltip } from "@heroui/react"
import { useState } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import { Table, BarChart3, Download } from "lucide-react"
import { PoaiPpaTableTab } from "./PoaiPpaTableTab"
import { PoaiPpaChartsTab } from "./PoaiPpaChartsTab"
import { requestExport } from "@/services/exports.service"
import { addToast } from "@heroui/toast"

export default function PoaiPpaPage() {
    const { canRead } = usePermissions("/financial/poai-ppa")
    const [selectedTab, setSelectedTab] = useState<string>("registro")
    const [exporting, setExporting] = useState(false)

    async function handleExport() {
        try {
            setExporting(true)
            await requestExport({ system: "SPD", type: "POAI_PPA" })
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
                <BreadcrumbItem>Financiero</BreadcrumbItem>
                <BreadcrumbItem>POAI PPA</BreadcrumbItem>
            </Breadcrumbs>

            {canRead ? (
                <>
                    {/* Selection Pills + Export Button */}
                    <div className="flex items-center justify-between">
                        <div className="flex gap-3">
                            <div
                                role="tab"
                                tabIndex={0}
                                onClick={() => setSelectedTab("registro")}
                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedTab("registro") }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${selectedTab === "registro"
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-default-100 text-default-600 hover:bg-default-200"
                                    }`}
                            >
                                <Table size={16} />
                                <span className="text-sm font-medium">Registro</span>
                            </div>

                            <div
                                role="tab"
                                tabIndex={0}
                                onClick={() => setSelectedTab("graficas")}
                                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedTab("graficas") }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${selectedTab === "graficas"
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-default-100 text-default-600 hover:bg-default-200"
                                    }`}
                            >
                                <BarChart3 size={16} />
                                <span className="text-sm font-medium">Gráficas</span>
                            </div>
                        </div>

                        <Tooltip content="Exportar datos POAI PPA a Excel">
                            <Button
                                color="primary"
                                variant="flat"
                                startContent={<Download size={16} />}
                                isLoading={exporting}
                                onPress={handleExport}
                            >
                                Exportar POAI PPA
                            </Button>
                        </Tooltip>
                    </div>

                    {/* Content based on selected tab */}
                    {selectedTab === "registro" && <PoaiPpaTableTab />}
                    {selectedTab === "graficas" && <PoaiPpaChartsTab />}
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
