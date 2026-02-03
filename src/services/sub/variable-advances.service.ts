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
