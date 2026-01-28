import { get, post, patch, del, PaginatedData } from "@/lib/http";
import { endpoints } from "@/lib/endpoints";
import { PoaiPpa, ProjectSelectItem } from "@/types/financial";

export const getPoaiPpaRecords = async (params: string) => {
    return get<PaginatedData<PoaiPpa>>(`${endpoints.financial.poaiPpa}?${params}`);
};

export const getPoaiPpaRecord = async (id: string) => {
    return get<PoaiPpa>(`${endpoints.financial.poaiPpa}/${id}`);
};

export const createPoaiPpaRecord = async (data: any) => {
    return post<PoaiPpa>(endpoints.financial.poaiPpa, data);
};

export const updatePoaiPpaRecord = async (id: string, data: any) => {
    return patch<PoaiPpa>(`${endpoints.financial.poaiPpa}/${id}`, data);
};

export const deletePoaiPpaRecord = async (id: string) => {
    return del<void>(`${endpoints.financial.poaiPpa}/${id}`);
};

export const getProjectsForSelect = async () => {
    // Used in filters. Using fixed limit as seen in component: limit=100
    // Or just expose param
    return get<{ data: ProjectSelectItem[] }>(`${endpoints.financial.projectsSelect}?limit=100`);
};
