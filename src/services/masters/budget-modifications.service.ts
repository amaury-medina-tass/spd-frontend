import { get, post, PaginatedData } from "@/lib/http";
import { endpoints } from "@/lib/endpoints";
import { BudgetModification } from "@/types/activity";

export const getBudgetModifications = async (params: string) => {
    return get<PaginatedData<BudgetModification>>(`${endpoints.masters.budgetModifications}?${params}`);
};

export const createBudgetModification = async (data: any) => {
    return post<BudgetModification>(endpoints.masters.budgetModifications, data);
};
