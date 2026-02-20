"use client"

import { Card, CardBody, Divider } from "@heroui/react"
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    ArrowRightLeft,
    FileText,
    FileCheck,
    FileSignature,
    FolderKanban,
} from "lucide-react"
import type { DashboardGlobalData } from "@/types/dashboard"
import { formatCurrency } from "@/lib/format-utils"

type Props = {
    data: DashboardGlobalData
}

const kpis = (data: DashboardGlobalData) => [
    {
        label: "Presupuesto Inicial",
        value: formatCurrency(data.totalInitialBudget),
        icon: DollarSign,
        color: "text-blue-600",
        bg: "bg-blue-50",
    },
    {
        label: "Presupuesto Actual",
        value: formatCurrency(data.totalCurrentBudget),
        icon: DollarSign,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
    },
    {
        label: "Ejecución Total",
        value: formatCurrency(data.totalExecution),
        icon: TrendingUp,
        color: "text-violet-600",
        bg: "bg-violet-50",
    },
    {
        label: "Total Adiciones",
        value: formatCurrency(data.totalAdditions),
        icon: TrendingUp,
        color: "text-green-600",
        bg: "bg-green-50",
    },
    {
        label: "Total Reducciones",
        value: formatCurrency(data.totalReductions),
        icon: TrendingDown,
        color: "text-red-600",
        bg: "bg-red-50",
    },
    {
        label: "Redistribuciones",
        value: data.totalTransfers.toString(),
        icon: ArrowRightLeft,
        color: "text-amber-600",
        bg: "bg-amber-50",
    },
]

const counts = (data: DashboardGlobalData) => [
    { label: "Proyectos", value: data.totalProjects, icon: FolderKanban, color: "text-blue-600" },
    { label: "Necesidades", value: data.totalNeeds, icon: FileText, color: "text-emerald-600" },
    { label: "CDPs", value: data.totalCdps, icon: FileCheck, color: "text-violet-600" },
    { label: "Contratos Marco", value: data.totalContracts, icon: FileSignature, color: "text-amber-600" },
]

export function GlobalKPIs({ data }: Readonly<Props>) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {kpis(data).map((kpi) => (
                    <Card key={kpi.label} className="shadow-sm">
                        <CardBody className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`p-1.5 rounded-lg ${kpi.bg}`}>
                                    <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                                </div>
                            </div>
                            <p className="text-xs text-default-500">{kpi.label}</p>
                            <p className="text-sm font-bold mt-0.5">{kpi.value}</p>
                        </CardBody>
                    </Card>
                ))}
            </div>
            <Divider />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {counts(data).map((c) => (
                    <Card key={c.label} className="shadow-sm">
                        <CardBody className="flex flex-row items-center gap-3 p-4">
                            <c.icon className={`w-5 h-5 ${c.color}`} />
                            <div>
                                <p className="text-2xl font-bold">{c.value}</p>
                                <p className="text-xs text-default-500">{c.label}</p>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        </div>
    )
}
