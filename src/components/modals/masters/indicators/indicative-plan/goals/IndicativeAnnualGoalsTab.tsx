import { IndicativePlanIndicatorGoal } from "@/types/masters/indicators"
import { get, post, patch, del, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { AnnualGoalsTab } from "@/components/modals/masters/indicators/shared/AnnualGoalsTab"

interface Props {
    indicatorId: string | null
}

const fetchGoals = (query: string) =>
    get<PaginatedData<IndicativePlanIndicatorGoal>>(`${endpoints.masters.indicativePlanIndicatorGoals}?${query}`)

const createGoal = (data: { indicatorId: string; year: number; value: number }) =>
    post(endpoints.masters.indicativePlanIndicatorGoals, data)

const updateGoal = (id: string, data: { value: number }) =>
    patch(`${endpoints.masters.indicativePlanIndicatorGoals}/${id}`, data)

const deleteGoal = (id: string) =>
    del(`${endpoints.masters.indicativePlanIndicatorGoals}/${id}`)

export function IndicativeAnnualGoalsTab({ indicatorId }: Readonly<Props>) {
    return (
        <AnnualGoalsTab<IndicativePlanIndicatorGoal>
            indicatorId={indicatorId}
            fetchGoals={fetchGoals}
            createGoal={createGoal}
            updateGoal={updateGoal}
            deleteGoal={deleteGoal}
        />
    )
}
