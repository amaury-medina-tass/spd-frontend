import { get, post, put, del, PaginatedData, patch } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { CreateIndicatorDTO, Indicator, IndicatorCatalogs, UpdateIndicatorDTO, ActionPlanIndicator, CreateActionPlanIndicatorDTO, UpdateActionPlanIndicatorDTO, ActionPlanIndicatorQuadrenniumGoal, ActionPlanIndicatorGoal } from "@/types/masters/indicators"

export const getIndicators = async (params: string) => {
    return await get<PaginatedData<Indicator>>(`${endpoints.masters.indicators}?${params}`)
}

export const createIndicator = async (data: CreateIndicatorDTO) => {
    return await post<Indicator>(endpoints.masters.indicators, data)
}

export const updateIndicator = async (id: string, data: UpdateIndicatorDTO) => {
    return await patch<Indicator>(`${endpoints.masters.indicators}/${id}`, data)
}

export const getIndicatorCatalogs = async () => {
    return await get<IndicatorCatalogs>(endpoints.masters.indicatorCatalogs)
}

export const deleteIndicator = async (id: string) => {
    return await del<void>(`${endpoints.masters.indicators}/${id}`)
}

// Action Plan Indicators

export const getActionPlanIndicators = async (params: string) => {
    return await get<PaginatedData<ActionPlanIndicator>>(`${endpoints.masters.actionPlanIndicators}?${params}`)
}

export const createActionPlanIndicator = async (data: CreateActionPlanIndicatorDTO) => {
    return await post<ActionPlanIndicator>(endpoints.masters.actionPlanIndicators, data)
}

export const updateActionPlanIndicator = async (id: string, data: UpdateActionPlanIndicatorDTO) => {
    return await patch<ActionPlanIndicator>(`${endpoints.masters.actionPlanIndicators}/${id}`, data)
}

export const deleteActionPlanIndicator = async (id: string) => {
    return await del<void>(`${endpoints.masters.actionPlanIndicators}/${id}`)
}

export const getActionPlanIndicatorGoals = async (params: string) => {
    return await get<PaginatedData<ActionPlanIndicatorGoal>>(`${endpoints.masters.actionPlanIndicatorGoals}?${params}`)
}

export const createActionPlanIndicatorGoal = async (data: any) => {
    return await post<ActionPlanIndicatorGoal>(endpoints.masters.actionPlanIndicatorGoals, data)
}

export const updateActionPlanIndicatorGoal = async (id: string, data: any) => {
    return await patch<ActionPlanIndicatorGoal>(`${endpoints.masters.actionPlanIndicatorGoals}/${id}`, data)
}

export const deleteActionPlanIndicatorGoal = async (id: string) => {
    return await del<void>(`${endpoints.masters.actionPlanIndicatorGoals}/${id}`)
}

export const getActionPlanIndicatorQuadrenniumGoals = async (params: string) => {
    return await get<PaginatedData<ActionPlanIndicatorQuadrenniumGoal>>(`${endpoints.masters.actionPlanIndicatorQuadrenniums}?${params}`)
}

export const createActionPlanIndicatorQuadrenniumGoal = async (data: any) => {
    return await post<ActionPlanIndicatorQuadrenniumGoal>(endpoints.masters.actionPlanIndicatorQuadrenniums, data)
}

export const updateActionPlanIndicatorQuadrenniumGoal = async (id: string, data: any) => {
    return await patch<ActionPlanIndicatorQuadrenniumGoal>(`${endpoints.masters.actionPlanIndicatorQuadrenniums}/${id}`, data)
}

export const deleteActionPlanIndicatorQuadrenniumGoal = async (id: string) => {
    return await del<void>(`${endpoints.masters.actionPlanIndicatorQuadrenniums}/${id}`)
}
