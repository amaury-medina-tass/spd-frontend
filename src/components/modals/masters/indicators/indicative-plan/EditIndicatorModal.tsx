import { updateIndicator } from "@/services/masters/indicators.service"
import { Indicator } from "@/types/masters/indicators"
import { IndicatorFormModalBase } from "@/components/modals/masters/indicators/shared/IndicatorFormModalBase"
import { indicativeIndicatorSchema, renderIndicativeFields } from "@/config/indicator-form-config"

interface EditIndicatorModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    indicator: Indicator | null
}

const resetValues = (indicator: Indicator) => ({
    code: indicator.code,
    name: indicator.name,
    observations: indicator.observations || "",
    advancePercentage: Number(indicator.advancePercentage),
    pillarCode: indicator.pillarCode,
    pillarName: indicator.pillarName,
    componentCode: indicator.componentCode,
    componentName: indicator.componentName,
    programCode: indicator.programCode,
    programName: indicator.programName,
    description: indicator.description,
    baseline: indicator.baseline,
    indicatorTypeId: indicator.indicatorTypeId,
    unitMeasureId: indicator.unitMeasureId,
    directionId: indicator.directionId,
})

export function EditIndicatorModal({ isOpen, onClose, onSuccess, indicator }: Readonly<EditIndicatorModalProps>) {
    return (
        <IndicatorFormModalBase
            mode="edit"
            isOpen={isOpen}
            onClose={onClose}
            onSuccess={onSuccess}
            indicator={indicator}
            title="Editar Indicador"
            formId="edit-indicator-form"
            schema={indicativeIndicatorSchema}
            updateFn={updateIndicator}
            resetValues={resetValues}
            renderFields={(props) => renderIndicativeFields(props, { codeDisabled: true, showAdvancePercentage: true })}
        />
    )
}
