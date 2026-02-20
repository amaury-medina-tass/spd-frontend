import { useCallback } from "react"
import { LocationModal } from "@/components/modals/masters/shared/LocationModal"
import {
    associateActionPlanIndicatorLocation, associateIndicativePlanIndicatorLocation,
    getActionPlanIndicatorLocations, getIndicativePlanIndicatorLocations,
    disassociateActionPlanIndicatorLocation, disassociateIndicativePlanIndicatorLocation
} from "@/services/masters/indicators.service"

interface IndicatorLocationModalProps {
    isOpen: boolean
    onClose: () => void
    indicatorId: string | null
    type: "action" | "indicative"
}

export function IndicatorLocationModal({ isOpen, onClose, indicatorId, type }: Readonly<IndicatorLocationModalProps>) {
    const fetchLocations = useCallback(
        (id: string) => type === "action" ? getActionPlanIndicatorLocations(id) : getIndicativePlanIndicatorLocations(id),
        [type]
    )
    const associateLocation = useCallback(
        (id: string, locationId: string) => type === "action"
            ? associateActionPlanIndicatorLocation(id, locationId)
            : associateIndicativePlanIndicatorLocation(id, locationId),
        [type]
    )
    const disassociateLocation = useCallback(
        (id: string, locationId: string) => type === "action"
            ? disassociateActionPlanIndicatorLocation(id, locationId)
            : disassociateIndicativePlanIndicatorLocation(id, locationId),
        [type]
    )

    return (
        <LocationModal
            isOpen={isOpen}
            onClose={onClose}
            entityId={indicatorId}
            subtitle="Gestiona las ubicaciones asociadas"
            fetchLocations={fetchLocations}
            associateLocation={associateLocation}
            disassociateLocation={disassociateLocation}
        />
    )
}
