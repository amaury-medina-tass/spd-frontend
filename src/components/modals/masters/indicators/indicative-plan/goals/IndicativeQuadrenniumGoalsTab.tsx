import { IndicativePlanIndicatorQuadrenniumGoal } from "@/types/masters/indicators"
import { get, post, patch, del, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { QuadrenniumGoalsTab } from "@/components/modals/masters/indicators/shared/QuadrenniumGoalsTab"

interface Props {
    indicatorId: string | null
}

const fetchGoals = async (_query: string) => {
    const params = new URLSearchParams(_query)
    const indicatorId = params.get("indicatorId")!
    const result = await get<IndicativePlanIndicatorQuadrenniumGoal[]>(
        endpoints.masters.indicativePlanIndicatorQuadrenniumsByIndicator(indicatorId)
    )
    const data = Array.isArray(result) ? result : (result as any).data || []
    return { data, meta: { total: data.length, page: 1, limit: data.length, totalPages: 1 } } as PaginatedData<IndicativePlanIndicatorQuadrenniumGoal>
}

const createGoal = (data: { indicatorId: string; startYear: number; endYear: number; value: number }) =>
    post(endpoints.masters.indicativePlanIndicatorQuadrenniums, data)

const updateGoal = (id: string, data: { value: number }) =>
    patch(`${endpoints.masters.indicativePlanIndicatorQuadrenniums}/${id}`, data)

const deleteGoal = (id: string) =>
    del(`${endpoints.masters.indicativePlanIndicatorQuadrenniums}/${id}`)

export function IndicativeQuadrenniumGoalsTab({ indicatorId }: Readonly<Props>) {
    return (
        <QuadrenniumGoalsTab<IndicativePlanIndicatorQuadrenniumGoal>
            indicatorId={indicatorId}
            fetchGoals={fetchGoals}
            createGoal={createGoal}
            updateGoal={updateGoal}
            deleteGoal={deleteGoal}
            paginated={false}
        />
    )
}
