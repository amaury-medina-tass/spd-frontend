import { get, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import type {
    DashboardGlobalData,
    DashboardCdp,
    DashboardActivityBalance,
    DashboardMasterContract,
    DashboardBudgetRecord,
    DashboardProjectBudget,
    DashboardProjectExecution,
    DashboardMgaActivity,
    DashboardDetailedActivity,
    DashboardBudgetModifications,
} from "@/types/dashboard"
import type { FinancialNeed } from "@/types/financial"

export const getDashboardGlobal = async (year?: number, month?: number) => {
    const params = new URLSearchParams()
    if (year) params.set("year", year.toString())
    if (month) params.set("month", month.toString())
    const query = params.toString()
    return get<DashboardGlobalData>(`${endpoints.financial.dashboard.global}${query ? `?${query}` : ""}`)
}

export const getDashboardNeeds = async (params: string) => {
    return get<PaginatedData<FinancialNeed>>(`${endpoints.financial.dashboard.needs}?${params}`)
}

export const getCdpsByNeed = async (needId: string) => {
    return get<DashboardCdp[]>(endpoints.financial.dashboard.cdpsByNeed(needId))
}

export const getActivitiesByCdp = async (cdpId: string) => {
    return get<DashboardActivityBalance[]>(endpoints.financial.dashboard.activitiesByCdp(cdpId))
}

export const getContractsByCdp = async (cdpId: string) => {
    return get<DashboardMasterContract[]>(endpoints.financial.dashboard.contractsByCdp(cdpId))
}

export const getCdpsByContract = async (contractId: string) => {
    return get<DashboardCdp[]>(endpoints.financial.dashboard.cdpsByContract(contractId))
}

export const getBudgetRecordsByContract = async (contractId: string) => {
    return get<DashboardBudgetRecord[]>(endpoints.financial.dashboard.budgetRecordsByContract(contractId))
}

export const getProjectBudgetOverview = async () => {
    return get<DashboardProjectBudget[]>(endpoints.financial.dashboard.projectBudgetOverview)
}

export const getProjectExecution = async (params: string) => {
    return get<PaginatedData<DashboardProjectExecution>>(`${endpoints.financial.dashboard.projectExecution}?${params}`)
}

export const getMgaActivitiesByProject = async (projectId: string) => {
    return get<DashboardMgaActivity[]>(endpoints.financial.dashboard.mgaActivitiesByProject(projectId))
}

export const getDetailedByMga = async (mgaId: string) => {
    return get<DashboardDetailedActivity[]>(endpoints.financial.dashboard.detailedByMga(mgaId))
}

export const getModificationsByActivity = async (activityId: string) => {
    return get<DashboardBudgetModifications>(endpoints.financial.dashboard.modificationsByActivity(activityId))
}
