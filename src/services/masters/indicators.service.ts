import { get, post, del, PaginatedData, patch } from "@/lib/http"
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

// Indicator Variables

export const getIndicatorVariables = async (id: string, params: string) => {
    return await get<PaginatedData<any>>(`${endpoints.masters.indicatorVariables(id)}?${params}`)
}

export const associateIndicatorVariable = async (id: string, variableId: string) => {
    return await post<any>(endpoints.masters.indicatorVariables(id), { variableId })
}

export const disassociateIndicatorVariable = async (id: string, variableId: string) => {
    return await del<void>(endpoints.masters.indicatorVariablesDissociate(id, variableId))
}

// Action Plan Indicator Variables

export const getActionPlanIndicatorVariables = async (id: string, params: string) => {
    return await get<PaginatedData<any>>(`${endpoints.masters.actionPlanIndicatorVariables(id)}?${params}`)
}

export const associateActionPlanIndicatorVariable = async (id: string, variableId: string) => {
    return await post<any>(endpoints.masters.actionPlanIndicatorVariables(id), { variableId })
}

export const disassociateActionPlanIndicatorVariable = async (id: string, variableId: string) => {
    return await del<void>(endpoints.masters.actionPlanIndicatorVariablesDissociate(id, variableId))
}

// Action Plan Indicator Projects

export const getActionPlanIndicatorProjects = async (id: string, params: string) => {
    return await get<PaginatedData<any>>(`${endpoints.masters.actionPlanIndicatorProjects(id)}?${params}`)
}

export const associateActionPlanIndicatorProject = async (id: string, projectId: string) => {
    return await post<any>(endpoints.masters.actionPlanIndicatorProjects(id), { projectId })
}

export const disassociateActionPlanIndicatorProject = async (id: string, projectId: string) => {
    return await del<void>(endpoints.masters.actionPlanIndicatorProjectsDissociate(id, projectId))
}

// Indicator Locations

export const getIndicativePlanIndicatorLocations = async (id: string) => {
    return await get<any[]>(endpoints.masters.indicativePlanIndicatorLocations(id))
}

export const getActionPlanIndicatorLocations = async (id: string) => {
    return await get<any[]>(endpoints.masters.actionPlanIndicatorLocations(id))
}

export const associateIndicativePlanIndicatorLocation = async (id: string, locationId: string) => {
    return await post<any>(endpoints.masters.indicativePlanIndicatorLocations(id), { locationId })
}

export const associateActionPlanIndicatorLocation = async (id: string, locationId: string) => {
    return await post<any>(endpoints.masters.actionPlanIndicatorLocations(id), { locationId })
}

export const disassociateIndicativePlanIndicatorLocation = async (id: string, locationId: string) => {
    return await del<void>(endpoints.masters.indicativePlanIndicatorLocationsDissociate(id, locationId))
}

export const disassociateActionPlanIndicatorLocation = async (id: string, locationId: string) => {
    return await del<void>(endpoints.masters.actionPlanIndicatorLocationsDissociate(id, locationId))
}

// Location-based indicator queries

export const getIndicatorsByLocation = async (communeId: string, params: string) => {
    return await get<PaginatedData<Indicator & { matchSource: string }>>(`${endpoints.masters.indicatorsByLocation(communeId)}?${params}`)
}

export const getActionPlanIndicatorsByLocation = async (communeId: string, params: string) => {
    return await get<PaginatedData<ActionPlanIndicator & { matchSource: string }>>(`${endpoints.masters.actionPlanIndicatorsByLocation(communeId)}?${params}`)
}

export const getIndicatorLocationVariables = async (indicatorId: string, type: 'indicative' | 'action', params: string) => {
    return await get<PaginatedData<any>>(`${endpoints.masters.indicatorLocationVariables(indicatorId, type)}?${params}`)
}

// Indicative Plan Indicator User Assignments

export const getIndicatorUsers = async (id: string) => {
    return await get<any[]>(endpoints.masters.indicatorUsers(id))
}

export const assignIndicatorUser = async (id: string, userId: string, userName?: string) => {
    return await post<any>(endpoints.masters.indicatorUsers(id), { userId, userName })
}

export const unassignIndicatorUser = async (id: string, userId: string) => {
    return await del<void>(endpoints.masters.indicatorUsersRemove(id, userId))
}

// Action Plan Indicator User Assignments

export const getActionPlanIndicatorUsers = async (id: string) => {
    return await get<any[]>(endpoints.masters.actionPlanIndicatorUsers(id))
}

export const assignActionPlanIndicatorUser = async (id: string, userId: string, userName?: string) => {
    return await post<any>(endpoints.masters.actionPlanIndicatorUsers(id), { userId, userName })
}

export const unassignActionPlanIndicatorUser = async (id: string, userId: string) => {
    return await del<void>(endpoints.masters.actionPlanIndicatorUsersRemove(id, userId))
}
