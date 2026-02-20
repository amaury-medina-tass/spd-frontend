import { updateActionPlanIndicator } from "@/services/masters/indicators.service"
import { ActionPlanIndicator } from "@/types/masters/indicators"
import { IndicatorFormModalBase } from "@/components/modals/masters/indicators/shared/IndicatorFormModalBase"
import { actionPlanIndicatorSchema, renderActionPlanFields } from "@/config/indicator-form-config"

interface EditActionPlanIndicatorModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    indicator: ActionPlanIndicator | null
}

const resetValues = (indicator: ActionPlanIndicator) => ({
    code: indicator.code,
    statisticalCode: indicator.statisticalCode,
    name: indicator.name,
    sequenceNumber: indicator.sequenceNumber,
    description: indicator.description,
    plannedQuantity: indicator.plannedQuantity,
    executionCut: indicator.executionCut,
    compliancePercentage: indicator.compliancePercentage,
    observations: indicator.observations || "",
    unitMeasureId: indicator.unitMeasureId,
})

export function EditActionPlanIndicatorModal({ isOpen, onClose, onSuccess, indicator }: Readonly<EditActionPlanIndicatorModalProps>) {
    return (
        <IndicatorFormModalBase
            mode="edit"
            isOpen={isOpen}
            onClose={onClose}
            onSuccess={onSuccess}
            indicator={indicator}
            title="Editar Indicador (Plan de Acción)"
            formId="edit-action-plan-indicator-form"
            schema={actionPlanIndicatorSchema}
            updateFn={updateActionPlanIndicator}
            resetValues={resetValues}
            renderFields={(props) => renderActionPlanFields(props, { codeDisabled: true })}
        />
    )
}
