import { createIndicator } from "@/services/masters/indicators.service"
import { IndicatorFormModalBase } from "@/components/modals/masters/indicators/shared/IndicatorFormModalBase"
import { indicativeIndicatorSchema, indicativeDefaultValues, renderIndicativeFields } from "@/config/indicator-form-config"

interface CreateIndicatorModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function CreateIndicatorModal({ isOpen, onClose, onSuccess }: Readonly<CreateIndicatorModalProps>) {
    return (
        <IndicatorFormModalBase
            mode="create"
            isOpen={isOpen}
            onClose={onClose}
            onSuccess={onSuccess}
            title="Crear Indicador"
            formId="create-indicator-form"
            schema={indicativeIndicatorSchema}
            defaultValues={indicativeDefaultValues}
            createFn={createIndicator}
            renderFields={(props) => renderIndicativeFields(props)}
        />
    )
}
