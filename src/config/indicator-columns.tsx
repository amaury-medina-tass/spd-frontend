import { ColumnDef } from "@/components/tables/DataTable"
import { Indicator, ActionPlanIndicator } from "@/types/masters/indicators"

export const indicativePlanColumns: ColumnDef<Indicator>[] = [
    { key: "code", label: "Código", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    { key: "pillarName", label: "Pilar", sortable: false, render: (i) => i.pillarName },
    { key: "programName", label: "Programa", sortable: false, render: (i) => i.programName },
    {
        key: "indicatorType",
        label: "Tipo",
        sortable: false,
        render: (i) => (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-default-100 text-default-600">
                {i.indicatorType?.name || "N/A"}
            </span>
        )
    },
    { key: "unitMeasure", label: "Unidad", sortable: false, render: (i) => i.unitMeasure?.name || "N/A" },
    { key: "baseline", label: "Línea Base", sortable: false },
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
]

export const actionPlanColumns: ColumnDef<ActionPlanIndicator>[] = [
    { key: "code", label: "Código", sortable: true },
    { key: "statisticalCode", label: "Cód. Est.", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    { key: "unitMeasure", label: "Unidad", sortable: false, render: (i) => i.unitMeasure?.name || "N/A" },
    { key: "plannedQuantity", label: "Meta", sortable: false },
    { key: "executionCut", label: "Corte Ej.", sortable: false },
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
]
