import { get, post, patch, del, PaginatedData } from "@/lib/http";
import { endpoints } from "@/lib/endpoints";
import { DetailedActivity, FullDetailedActivity } from "@/types/activity";

export const getDetailedActivities = async (params: string) => {
    return get<PaginatedData<DetailedActivity>>(`${endpoints.masters.detailedActivities}?${params}`);
};

export const getDetailedActivity = async (id: string) => {
    return get<FullDetailedActivity>(`${endpoints.masters.detailedActivities}/${id}`);
};

export const createDetailedActivity = async (data: any) => {
    return post<DetailedActivity>(endpoints.masters.detailedActivities, data);
};

export const updateDetailedActivity = async (id: string, data: any) => {
    return patch<DetailedActivity>(`${endpoints.masters.detailedActivities}/${id}`, data);
};

export const deleteDetailedActivity = async (id: string) => {
    return del<void>(`${endpoints.masters.detailedActivities}/${id}`);
};
