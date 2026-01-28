import { get, post, patch, del, PaginatedData } from "@/lib/http";
import { endpoints } from "@/lib/endpoints";
import { Role, RolePermissionsData } from "@/types/role";

export const getRoles = async (params: string) => {
    return get<PaginatedData<Role>>(`${endpoints.accessControl.roles.base}?${params}`);
};

export const getRole = async (id: string) => {
    return get<Role>(`${endpoints.accessControl.roles.base}/${id}`);
};

export const createRole = async (data: any) => {
    return post<Role>(endpoints.accessControl.roles.base, data);
};

export const updateRole = async (id: string, data: any) => {
    return patch<Role>(`${endpoints.accessControl.roles.base}/${id}`, data);
};

export const deleteRole = async (id: string) => {
    return del<void>(`${endpoints.accessControl.roles.base}/${id}`);
};

// Permissions Sub-resource
export const getRolePermissions = async (roleId: string) => {
    return get<RolePermissionsData>(`${endpoints.accessControl.roles.base}/${roleId}/permissions`);
};

export const updateRolePermissions = async (roleId: string, permissionIds: string[]) => {
    return patch(`${endpoints.accessControl.roles.base}/${roleId}/permissions`, { permissionIds });
};
