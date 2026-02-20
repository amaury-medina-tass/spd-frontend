import { Divider } from "@heroui/react"
import { ActionPlanIndicator } from "@/types/masters/indicators"
import { Goal, FileText, Scale, TrendingUp, Hash, Calendar } from "lucide-react"
import { IndicatorDetailShell } from "@/components/modals/masters/indicators/shared/IndicatorDetailShell"
import { DetailField } from "@/components/modals/masters/indicators/shared/DetailField"

interface ActionPlanIndicatorDetailModalProps {
    isOpen: boolean
    onClose: () => void
    indicator: ActionPlanIndicator | null
}

export function ActionPlanIndicatorDetailModal({ isOpen, onClose, indicator }: Readonly<ActionPlanIndicatorDetailModalProps>) {
    if (!indicator) return null

    return (
        <IndicatorDetailShell
            isOpen={isOpen}
            onClose={onClose}
            code={indicator.code}
            subtitle={`Cód. Estadístico: ${indicator.statisticalCode}`}
        >
            {/* Información Básica */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <DetailField icon={Goal} label="Nombre" value={indicator.name} colSpan={2} />
                <DetailField icon={Hash} label="No. Secuencia" value={indicator.sequenceNumber} />
                <DetailField icon={Scale} label="Unidad" value={indicator.unitMeasure?.name || "N/A"} />
                <DetailField icon={FileText} label="Descripción" value={indicator.description || "Sin descripción"} colSpan={2} valueClassName="text-small text-foreground" />
                <DetailField icon={FileText} label="Observaciones" value={indicator.observations || "Sin observaciones"} colSpan={2} valueClassName="text-small text-foreground" />
            </div>

            <Divider />

            {/* Metas y Ejecución */}
            <div>
                <h3 className="text-small font-semibold text-default-500 uppercase mb-4 flex items-center gap-2">
                    <TrendingUp size={16} />
                    Metas y Ejecución
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <DetailField icon={Goal} label="Meta Planeada" value={indicator.plannedQuantity} />
                    <DetailField icon={Calendar} label="Corte Ejecución" value={indicator.executionCut} />
                    <DetailField
                        label="Cumplimiento"
                        value={`${indicator.compliancePercentage}%`}
                        valueClassName={`text-medium font-bold ${Number(indicator.compliancePercentage) >= 100 ? "text-success" : "text-warning"}`}
                    />
                </div>
            </div>
        </IndicatorDetailShell>
    )
}
