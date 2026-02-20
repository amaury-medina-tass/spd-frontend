"use client"

import { Breadcrumbs, BreadcrumbItem } from "@heroui/react"
import { useState } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import { PlanTypeSelector } from "@/components/tabs/PlanTypeSelector"
import { IndicativePlanIndicatorsTab } from "./IndicativePlanIndicatorsTab"
import { ActionPlanIndicatorsTab } from "./ActionPlanIndicatorsTab"

export default function MastersIndicatorsPage() {
    const { canRead } = usePermissions("/masters/indicators")
    const [selectedTab, setSelectedTab] = useState<'indicative' | 'action'>('indicative')

    return (
        <div className="grid gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Inicio</BreadcrumbItem>
                <BreadcrumbItem>Maestros</BreadcrumbItem>
                <BreadcrumbItem>Indicadores</BreadcrumbItem>
            </Breadcrumbs>

            {canRead ? (
                <>
                    <PlanTypeSelector selectedTab={selectedTab} onSelectTab={setSelectedTab} />

                    {/* Content based on selected tab */}
                    <div className="mt-2 min-w-0">
                        {selectedTab === "indicative" && <IndicativePlanIndicatorsTab />}
                        {selectedTab === "action" && <ActionPlanIndicatorsTab />}
                    </div>
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
