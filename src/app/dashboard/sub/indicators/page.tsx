"use client"

import { Breadcrumbs, BreadcrumbItem } from "@heroui/react"
import { useState } from "react"
import { PlanTypeSelector } from "@/components/tabs/PlanTypeSelector"
import { IndicativePlanSubTab } from "./IndicativePlanSubTab"
import { ActionPlanSubTab } from "./ActionPlanSubTab"

export default function SubModulePage() {
    const [selectedTab, setSelectedTab] = useState<'indicative' | 'action'>('indicative')

    return (
        <div className="grid gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Inicio</BreadcrumbItem>
                <BreadcrumbItem>Dashboard</BreadcrumbItem>
                <BreadcrumbItem>Sub</BreadcrumbItem>
                <BreadcrumbItem>Indicadores</BreadcrumbItem>
            </Breadcrumbs>

            <PlanTypeSelector selectedTab={selectedTab} onSelectTab={setSelectedTab} />

                {/* Content based on selected tab */}
                <div className="mt-2 min-w-0">
                    {selectedTab === "indicative" && <IndicativePlanSubTab />}
                    {selectedTab === "action" && <ActionPlanSubTab />}
                </div>
        </div>
    )
}
