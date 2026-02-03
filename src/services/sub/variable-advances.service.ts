import { get, post, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { VariableWithAdvances, CreateVariableAdvanceDto, VariableAdvance } from "@/types/sub/variable-advances"

export const createVariableAdvance = async (dto: CreateVariableAdvanceDto) => {
    return await post<VariableAdvance>(endpoints.sub.variableAdvances.base, dto)
}

export const getVariableAdvancesByActionIndicator = async (id: string, params: string) => {
    return await get<PaginatedData<VariableWithAdvances>>(`${endpoints.sub.variableAdvances.contextual.actionIndicator(id)}?${params}`)
}

export const getVariableAdvancesByIndicativeIndicator = async (id: string, params: string) => {
    return await get<PaginatedData<VariableWithAdvances>>(`${endpoints.sub.variableAdvances.contextual.indicativeIndicator(id)}?${params}`)
}

import { IndicatorDetailedData } from "@/types/sub/indicator-dashboard"

export const getActionIndicatorDetailed = async (id: string, year: string | number, month: string | number) => {
    const params = new URLSearchParams({
        year: year.toString(),
        month: month.toString(),
    })
    return await get<IndicatorDetailedData>(`${endpoints.sub.indicatorAdvances.actionDetailed(id)}?${params.toString()}`)
}

export const getIndicativeIndicatorDetailed = async (id: string, year: string | number, month: string | number) => {
    const params = new URLSearchParams({
        year: year.toString(),
        month: month.toString(),
    })
    return await get<IndicatorDetailedData>(`${endpoints.sub.indicatorAdvances.indicativeDetailed(id)}?${params.toString()}`)
}
