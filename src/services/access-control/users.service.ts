import { get, post, patch, del, PaginatedData } from "@/lib/http";
import { endpoints } from "@/lib/endpoints";
import { User, UserWithRoles } from "@/types/user";

export const getUsers = async (params: string) => {
    return get<PaginatedData<User>>(`${endpoints.accessControl.users}?${params}`);
};

export const getUser = async (id: string) => {
    return get<User>(`${endpoints.accessControl.users}/${id}`);
};

export const updateUser = async (id: string, data: any) => {
    return patch<User>(`${endpoints.accessControl.users}/${id}`, data);
};

export const deleteUser = async (id: string) => {
    return del<void>(`${endpoints.accessControl.users}/${id}`);
};

// Roles Sub-resource
export const getUserRoles = async (userId: string) => {
    return get<UserWithRoles>(`${endpoints.accessControl.users}/${userId}/roles`);
};

export const assignUserRole = async (userId: string, roleId: string) => {
    return post(`${endpoints.accessControl.users}/${userId}/roles`, { roleId });
};

export const removeUserRole = async (userId: string, roleId: string) => {
    return del(`${endpoints.accessControl.users}/${userId}/roles/${roleId}`);
};
