import { get, post, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Commune } from "./communes.service"

export interface Location {
    id: string
    address: string
    normalizedAddress: string
    commune: Commune
    latitude?: string
    longitude?: string
}

export interface CreateLocationDTO {
    communeId: string
    address: string
    latitude?: number // Optional as per user request example showing it in creation but not explicitly required as mandatory input in description
    longitude?: number
}

export const getLocationsSelect = async (params: string) => {
    return await get<PaginatedData<Location>>(`${endpoints.masters.locationsSelect}?${params}`)
}

export const createLocation = async (data: CreateLocationDTO) => {
    return await post<Location>(endpoints.masters.locations, data)
}
