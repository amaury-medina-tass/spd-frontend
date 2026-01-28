import { get, PaginatedData } from "@/lib/http";
import { endpoints } from "@/lib/endpoints";
import { PreviousStudy } from "@/types/financial";

export const getPreviousStudies = async (params: string) => {
    return get<PaginatedData<PreviousStudy>>(`${endpoints.financial.previousStudies}?${params}`);
};

export const getPreviousStudy = async (id: string) => {
    // Assuming detail endpoint exists, similar to others.
    // If not used yet, it's fine to have it for future or consistency.
    // Based on page logic, there might be a modal that fetches detail?
    // checking `PreviousStudiesPage.tsx`, it doesn't seem to have "View Details" action?
    // Wait, columns has no actions column in snippet?
    // Let me check snippet again.
    // Ah, lines 14-46 define columns. No actions column.
    // So maybe no detail fetch used yet.
    // But I will add it for consistency.
    return get<PreviousStudy>(`${endpoints.financial.previousStudies}/${id}`);
};
