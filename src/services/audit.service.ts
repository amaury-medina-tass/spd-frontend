import { get, PaginatedData } from "@/lib/http";
import { endpoints } from "@/lib/endpoints";
import { AuditLog } from "@/types/audit";

export const getAuditLogs = async (params: string) => {
    return get<PaginatedData<AuditLog>>(`${endpoints.audit}?${params}`);
};
