import { get, PaginatedData } from "@/lib/http";
import { endpoints } from "@/lib/endpoints";
import { MasterContract } from "@/types/financial";

export const getMasterContracts = async (params: string) => {
    return get<PaginatedData<MasterContract>>(`${endpoints.financial.masterContracts}?${params}`);
};

export const getMasterContract = async (id: string) => {
    return get<MasterContract>(`${endpoints.financial.masterContracts}/${id}`);
};
