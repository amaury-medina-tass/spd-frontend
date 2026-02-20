"use client"

import { ColumnDef } from "@/components/tables/DataTable"
import { Indicator } from "@/types/masters/indicators"
import { getIndicatorsByLocation } from "@/services/masters/indicators.service"
import { DashboardLocationTab, renderMatchSource } from "./DashboardLocationTab"

type IndicatorWithMatch = Indicator & { matchSource: string }

const indicatorColumns: ColumnDef<IndicatorWithMatch>[] = [
    { key: "code", label: "Código", sortable: true },
    { key: "pillarName", label: "Pilar", sortable: false },
    { key: "programName", label: "Programa", sortable: false },
    { key: "name", label: "Nombre", sortable: true },
    {
        key: "advancePercentage",
        label: "Avance",
        sortable: false,
        render: (i) => (
            <span className={`font-semibold ${Number(i.advancePercentage) >= 100 ? "text-success" : "text-warning"}`}>
                {i.advancePercentage}%
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

interface DashboardIndicativePlanTabProps {
    communeId: string | null
    onViewVariables: (indicator: IndicatorWithMatch) => void
}

export function DashboardIndicativePlanTab({ communeId, onViewVariables }: Readonly<DashboardIndicativePlanTabProps>) {
    return (
        <DashboardLocationTab<IndicatorWithMatch>
            communeId={communeId}
            onViewVariables={onViewVariables}
            columns={indicatorColumns}
            fetchFn={getIndicatorsByLocation}
            ariaLabel="Tabla de indicadores plan indicativo por ubicación"
        />
    )
}
