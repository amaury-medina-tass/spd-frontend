import { get, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"

export interface Commune {
    id: string
    code: string
    name: string
}

export const getCommunesSelect = async (params: string) => {
    return await get<PaginatedData<Commune>>(`${endpoints.masters.communesSelect}?${params}`)
}
