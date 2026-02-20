import { Divider } from "@heroui/react"
import { Indicator } from "@/types/masters/indicators"
import { Goal, FileText, Scale, TrendingUp, Layers, FolderKanban, Component } from "lucide-react"
import { IndicatorDetailShell } from "@/components/modals/masters/indicators/shared/IndicatorDetailShell"
import { DetailField } from "@/components/modals/masters/indicators/shared/DetailField"

interface IndicatorDetailModalProps {
    isOpen: boolean
    onClose: () => void
    indicator: Indicator | null
}

export function IndicatorDetailModal({ isOpen, onClose, indicator }: Readonly<IndicatorDetailModalProps>) {
    if (!indicator) return null

    return (
        <IndicatorDetailShell
            isOpen={isOpen}
            onClose={onClose}
            code={indicator.code}
            subtitle={indicator.indicatorType?.name || "Detalle del indicador"}
        >
            {/* Información Básica */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                <DetailField icon={Goal} label="Nombre" value={indicator.name} colSpan={2} />
                <DetailField icon={FileText} label="Descripción" value={indicator.description || "Sin descripción"} colSpan={2} valueClassName="text-small text-foreground" />
                <DetailField icon={FileText} label="Observaciones" value={indicator.observations || "Sin observaciones"} colSpan={2} valueClassName="text-small text-foreground" />
            </div>

            <Divider />

            {/* Medición */}
            <div>
                <h3 className="text-small font-semibold text-default-500 uppercase mb-4 flex items-center gap-2">
                    <Scale size={16} />
                    Medición
                </h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <DetailField icon={Scale} label="Unidad" value={indicator.unitMeasure?.name || "N/A"} />
                    <DetailField icon={TrendingUp} label="Sentido" value={indicator.direction?.name || "N/A"} />
                    <DetailField label="Línea Base" value={indicator.baseline} valueClassName="text-medium font-semibold text-foreground" />
                    <DetailField label="Avance Actual" value={`${indicator.advancePercentage}%`} valueClassName="text-medium font-bold text-primary" />
                </div>
            </div>

            <Divider />

            {/* Alineación Estratégica */}
            <div>
                <h3 className="text-small font-semibold text-default-500 uppercase mb-4 flex items-center gap-2">
                    <Layers size={16} />
                    Alineación Estratégica
                </h3>
                <div className="grid grid-cols-1 gap-y-4">
                    <DetailField icon={Layers} label="Pilar" value={`${indicator.pillarCode} - ${indicator.pillarName}`} />
                    <DetailField icon={Component} label="Componente" value={`${indicator.componentCode} - ${indicator.componentName}`} />
                    <DetailField icon={FolderKanban} label="Programa" value={`${indicator.programCode} - ${indicator.programName}`} />
                </div>
            </div>
        </IndicatorDetailShell>
    )
}
