import { get, PaginatedData } from "@/lib/http";
import { endpoints } from "@/lib/endpoints";
import { FinancialNeed } from "@/types/financial";

export const getFinancialNeeds = async (params: string) => {
    return get<PaginatedData<FinancialNeed>>(`${endpoints.financial.needs}?${params}`);
};

export const getFinancialNeed = async (id: string) => {
    return get<FinancialNeed>(`${endpoints.financial.needs}/${id}`);
};
