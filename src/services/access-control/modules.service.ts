import { get, post, patch, del, PaginatedData } from "@/lib/http";
import { endpoints } from "@/lib/endpoints";
import { Module, ModuleWithActions } from "@/types/module";

export const getModules = async (params: string) => {
    return get<PaginatedData<Module>>(`${endpoints.accessControl.modules}?${params}`);
};

export const getModule = async (id: string) => {
    return get<Module>(`${endpoints.accessControl.modules}/${id}`);
};

export const createModule = async (data: any) => {
    return post<Module>(endpoints.accessControl.modules, data);
};

export const updateModule = async (id: string, data: any) => {
    return patch<Module>(`${endpoints.accessControl.modules}/${id}`, data);
};

export const deleteModule = async (id: string) => {
    return del<void>(`${endpoints.accessControl.modules}/${id}`);
};

// Actions Sub-resource
export const getModuleActions = async (moduleId: string) => {
    return get<ModuleWithActions>(`${endpoints.accessControl.modules}/${moduleId}/actions`);
};

export const assignModuleAction = async (moduleId: string, actionId: string) => {
    return post(`${endpoints.accessControl.modules}/${moduleId}/actions`, { actionId });
};

export const removeModuleAction = async (moduleId: string, actionId: string) => {
    return del(`${endpoints.accessControl.modules}/${moduleId}/actions/${actionId}`);
};
