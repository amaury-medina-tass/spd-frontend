import { get, PaginatedData } from "@/lib/http";
import { endpoints } from "@/lib/endpoints";
import { Project } from "@/types/financial";

export const getProjects = async (params: string) => {
    return get<PaginatedData<Project>>(`${endpoints.financial.projects}?${params}`);
};

export const getProject = async (id: string) => {
    return get<Project>(`${endpoints.financial.projects}/${id}`);
};
