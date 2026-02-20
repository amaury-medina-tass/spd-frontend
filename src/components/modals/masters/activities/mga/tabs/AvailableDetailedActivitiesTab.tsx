import { DetailedActivitiesTab } from "./DetailedActivitiesTab"
export type { DetailedActivity } from "./DetailedActivitiesTab"

interface Props {
    mgaActivityId: string | null
}

export function AvailableDetailedActivitiesTab({ mgaActivityId }: Readonly<Props>) {
    return <DetailedActivitiesTab mgaActivityId={mgaActivityId} mode="available" />
}
