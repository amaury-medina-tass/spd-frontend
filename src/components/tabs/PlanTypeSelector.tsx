"use client"

import { PieChart, ListChecks } from "lucide-react"

interface PlanTypeSelectorProps {
    selectedTab: string
    onSelectTab: (tab: string) => void
}

export function PlanTypeSelector({ selectedTab, onSelectTab }: Readonly<PlanTypeSelectorProps>) {
    return (
        <div className="flex gap-3">
            <div
                role="tab"
                tabIndex={0}
                onClick={() => onSelectTab("indicative")}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelectTab("indicative") }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${selectedTab === "indicative"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-default-100 text-default-600 hover:bg-default-200"
                    }`}
            >
                <PieChart size={16} />
                <span className="text-sm font-medium">Plan Indicativo</span>
            </div>

            <div
                role="tab"
                tabIndex={0}
                onClick={() => onSelectTab("action")}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelectTab("action") }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${selectedTab === "action"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-default-100 text-default-600 hover:bg-default-200"
                    }`}
            >
                <ListChecks size={16} />
                <span className="text-sm font-medium">Plan de Acción</span>
            </div>
        </div>
    )
}
