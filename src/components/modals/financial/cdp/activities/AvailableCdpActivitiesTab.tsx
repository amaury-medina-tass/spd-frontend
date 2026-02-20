import { CdpActivitiesTab } from "./CdpActivitiesTab"

interface Props {
    positionId: string | null
}

export function AvailableCdpActivitiesTab({ positionId }: Readonly<Props>) {
    return <CdpActivitiesTab positionId={positionId} mode="available" />
}

