import { LocationModal } from "@/components/modals/masters/shared/LocationModal"
import { getVariableLocations, associateVariableLocation, disassociateVariableLocation } from "@/services/masters/variables.service"

interface VariableLocationModalProps {
    isOpen: boolean
    onClose: () => void
    variableId: string | null
    variableCode?: string
}

export function VariableLocationModal({ isOpen, onClose, variableId, variableCode }: Readonly<VariableLocationModalProps>) {
    return (
        <LocationModal
            isOpen={isOpen}
            onClose={onClose}
            entityId={variableId}
            entityCode={variableCode}
            subtitle="Gestiona las ubicaciones asociadas a la variable"
            fetchLocations={getVariableLocations}
            associateLocation={associateVariableLocation}
            disassociateLocation={disassociateVariableLocation}
        />
    )
}

