import { createActionPlanIndicator } from "@/services/masters/indicators.service"
import { IndicatorFormModalBase } from "@/components/modals/masters/indicators/shared/IndicatorFormModalBase"
import { actionPlanIndicatorSchema, actionPlanDefaultValues, renderActionPlanFields } from "@/config/indicator-form-config"

interface CreateActionPlanIndicatorModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function CreateActionPlanIndicatorModal({ isOpen, onClose, onSuccess }: Readonly<CreateActionPlanIndicatorModalProps>) {
    return (
        <IndicatorFormModalBase
            mode="create"
            isOpen={isOpen}
            onClose={onClose}
            onSuccess={onSuccess}
            title="Crear Indicador (Plan de Acción)"
            formId="create-action-plan-indicator-form"
            schema={actionPlanIndicatorSchema}
            defaultValues={actionPlanDefaultValues}
            createFn={createActionPlanIndicator}
            renderFields={(props) => renderActionPlanFields(props)}
        />
    )
}
