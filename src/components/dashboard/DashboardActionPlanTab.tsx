"use client"

import { ColumnDef } from "@/components/tables/DataTable"
import { ActionPlanIndicator } from "@/types/masters/indicators"
import { getActionPlanIndicatorsByLocation } from "@/services/masters/indicators.service"
import { DashboardLocationTab, renderMatchSource } from "./DashboardLocationTab"

type ActionIndicatorWithMatch = ActionPlanIndicator & { matchSource: string }

const indicatorColumns: ColumnDef<ActionIndicatorWithMatch>[] = [
    { key: "code", label: "Código", sortable: true },
    { key: "statisticalCode", label: "Cód. Est.", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    { key: "unitMeasure", label: "Unidad", sortable: false, render: (i) => i.unitMeasure?.name || "N/A" },
    { key: "plannedQuantity", label: "Meta", sortable: false },
    {
        key: "compliancePercentage",
        label: "Cumplimiento",
        sortable: false,
        render: (i) => (
            <span className={`font-semibold ${Number(i.compliancePercentage) >= 100 ? "text-success" : "text-warning"}`}>
                {i.compliancePercentage}%
            </span>
        )
    },
    {
        key: "matchSource",
        label: "Origen",
        sortable: false,
        render: (i) => renderMatchSource(i.matchSource),
    },
]

interface DashboardActionPlanTabProps {
    communeId: string | null
    onViewVariables: (indicator: ActionIndicatorWithMatch) => void
}

export function DashboardActionPlanTab({ communeId, onViewVariables }: Readonly<DashboardActionPlanTabProps>) {
    return (
        <DashboardLocationTab<ActionIndicatorWithMatch>
            communeId={communeId}
            onViewVariables={onViewVariables}
            columns={indicatorColumns}
            fetchFn={getActionPlanIndicatorsByLocation}
            ariaLabel="Tabla de indicadores plan de acción por ubicación"
        />
    )
}
