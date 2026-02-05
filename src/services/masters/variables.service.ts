import { get, post, del } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"

// Variable Locations

export const getVariableLocations = async (id: string) => {
    return await get<any[]>(endpoints.masters.variableLocations(id))
}

export const associateVariableLocation = async (id: string, locationId: string) => {
    return await post<any>(endpoints.masters.variableLocations(id), { locationId })
}

export const disassociateVariableLocation = async (id: string, locationId: string) => {
    return await del<void>(endpoints.masters.variableLocationsDissociate(id, locationId))
}
