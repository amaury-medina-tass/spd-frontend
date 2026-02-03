"use client"

import { Breadcrumbs, BreadcrumbItem } from "@heroui/react"
import { useState } from "react"
import { PieChart, ListChecks } from "lucide-react"
import { IndicativePlanSubTab } from "./IndicativePlanSubTab"
import { ActionPlanSubTab } from "./ActionPlanSubTab"

export default function SubModulePage() {
    const [selectedTab, setSelectedTab] = useState<string>("indicative")

    return (
        <div className="grid gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Inicio</BreadcrumbItem>
                <BreadcrumbItem>Dashboard</BreadcrumbItem>
                <BreadcrumbItem>Sub</BreadcrumbItem>
                <BreadcrumbItem>Indicadores</BreadcrumbItem>
            </Breadcrumbs>

            <>
                {/* Selection Pills */}
                <div className="flex gap-3">
                    <div
                        onClick={() => setSelectedTab("indicative")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${selectedTab === "indicative"
                            ? "bg-primary text-white shadow-sm"
                            : "bg-default-100 text-default-600 hover:bg-default-200"
                            }`}
                    >
                        <PieChart size={16} />
                        <span className="text-sm font-medium">Plan Indicativo</span>
                    </div>

                    <div
                        onClick={() => setSelectedTab("action")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${selectedTab === "action"
                            ? "bg-primary text-white shadow-sm"
                            : "bg-default-100 text-default-600 hover:bg-default-200"
                            }`}
                    >
                        <ListChecks size={16} />
                        <span className="text-sm font-medium">Plan de Acción</span>
                    </div>
                </div>

                {/* Content based on selected tab */}
                <div className="mt-2 min-w-0">
                    {selectedTab === "indicative" && <IndicativePlanSubTab />}
                    {selectedTab === "action" && <ActionPlanSubTab />}
                </div>
            </>
        </div>
    )
}
