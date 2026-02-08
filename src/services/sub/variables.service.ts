import { get, PaginatedData } from "@/lib/http";
import { Variable, VariableDashboardData } from "@/types/masters/variables";
import { endpoints } from "@/lib/endpoints";

export const getVariables = async (query: string = "") => {
    return get<PaginatedData<Variable>>(`/masters/variables?${query}`);
};

export const getMyVariables = async (query: string = "") => {
    return get<PaginatedData<Variable>>(`${endpoints.sub.my.variables}?${query}`);
};

export const getVariableDashboardData = async (variableId: string, year: string, month: string) => {
    const yearParam = year === 'all' ? '' : year;
    const monthParam = month === 'all' ? '' : month;
    return get<VariableDashboardData>(`/sub/variable-advances/${variableId}/details?year=${yearParam}&month=${monthParam}`);
};
