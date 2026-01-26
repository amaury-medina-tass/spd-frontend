import { get, post, put, del, PaginatedData, patch } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { CreateIndicatorDTO, Indicator, IndicatorCatalogs, UpdateIndicatorDTO, ActionPlanIndicator, CreateActionPlanIndicatorDTO, UpdateActionPlanIndicatorDTO } from "@/types/masters/indicators"

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
