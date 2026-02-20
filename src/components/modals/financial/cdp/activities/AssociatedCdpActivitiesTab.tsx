import { CdpActivitiesTab } from "./CdpActivitiesTab"

interface Props {
    positionId: string | null
}

export function AssociatedCdpActivitiesTab({ positionId }: Readonly<Props>) {
    return <CdpActivitiesTab positionId={positionId} mode="associated" />
}

