import { get, post, patch, del, PaginatedData } from "@/lib/http";
import { endpoints } from "@/lib/endpoints";
import { MGAActivity } from "@/types/activity";

export const getMGAActivities = async (params: string) => {
    return get<PaginatedData<MGAActivity>>(`${endpoints.masters.mgaActivities}?${params}`);
};

export const getMGAActivity = async (id: string) => {
    return get<MGAActivity>(`${endpoints.masters.mgaActivities}/${id}`);
};

export const createMGAActivity = async (data: any) => {
    return post<MGAActivity>(endpoints.masters.mgaActivities, data);
};

export const updateMGAActivity = async (id: string, data: any) => {
    // Note: User prompt implied using patch for editing in MGAActivityModal
    return patch<MGAActivity>(`${endpoints.masters.mgaActivities}/${id}`, data);
};

export const deleteMGAActivity = async (id: string) => {
    // Assuming delete exists based on standard CRUD, though not explicitly seen in MGAActivitiesTab which only has view/edit/manage actions visible in snippet?
    // Wait, MGAActivitiesTab doesn't show DELETE row action in my view? 
    // Ah, line 241 implies "canDelete" and actions, but the snippet might have been truncated?
    // Actually lines 210-252 show View, Edit, Manage. No Delete.
    // However, if I am creating a service, I should include standard CRUD if endpoint exists.
    // Assuming endpoint standard. If not, this function just won't be used yet.
    return del<void>(`${endpoints.masters.mgaActivities}/${id}`);
};
