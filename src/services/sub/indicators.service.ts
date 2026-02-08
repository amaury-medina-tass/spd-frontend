import { get, PaginatedData } from "@/lib/http";
import { endpoints } from "@/lib/endpoints";
import { Indicator, ActionPlanIndicator } from "@/types/masters/indicators";

export const getMyIndicativeIndicators = async (params: string) => {
    return get<PaginatedData<Indicator>>(`${endpoints.sub.my.indicativeIndicators}?${params}`);
};

export const getMyActionPlanIndicators = async (params: string) => {
    return get<PaginatedData<ActionPlanIndicator>>(`${endpoints.sub.my.actionIndicators}?${params}`);
};
