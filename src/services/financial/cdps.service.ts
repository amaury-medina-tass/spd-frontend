import { get, post, del, PaginatedData } from "@/lib/http";
import { endpoints } from "@/lib/endpoints";
import { CdpTableRow, CdpPositionDetail, CdpDetailedActivity } from "@/types/cdp";

export const getCdps = async (params: string) => {
    return get<PaginatedData<CdpTableRow>>(`${endpoints.financial.cdpsTable}?${params}`);
};

export const getCdpPositionDetail = async (id: string) => {
    return get<CdpPositionDetail>(endpoints.financial.cdpPositionDetail(id));
};

// Detailed Activities for CDP Position
export const getCdpPositionActivities = async (positionId: string, params: string) => {
    return get<PaginatedData<CdpDetailedActivity>>(
        `${endpoints.financial.cdpPositionDetailedActivities(positionId)}?${params}`
    );
};

export const associateCdpPositionActivity = async (positionId: string, detailedActivityId: string) => {
    return post(endpoints.financial.cdpPositionDetailedActivities(positionId), { detailedActivityId });
};

export const disassociateCdpPositionActivity = async (positionId: string, detailedActivityId: string) => {
    return del(endpoints.financial.cdpPositionDetailedActivitiesRemove(positionId, detailedActivityId));
};

export const consumeCdpPositionFunds = async (positionId: string, data: { detailedActivityId: string, amount: number }) => {
    return post(endpoints.financial.cdpPositionConsume(positionId), data);
};
