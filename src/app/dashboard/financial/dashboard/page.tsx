"use client"

import { useCallback, useEffect, useState } from "react"
import {
    Button,
    Breadcrumbs,
    BreadcrumbItem,
    Card,
    CardBody,
    CardHeader,
    Chip,
    Progress,
    Spinner,
    Accordion,
    AccordionItem,
    Divider,
} from "@heroui/react"
import { RefreshCw, ChevronRight, Download } from "lucide-react"
import { addToast } from "@heroui/toast"
import { DataTable, ColumnDef } from "@/components/tables/DataTable"
import { GlobalKPIs } from "@/components/charts/dashboard/GlobalKPIs"
import { CdpDistributionChart } from "@/components/charts/dashboard/CdpDistributionChart"
import { ProjectBudgetChart } from "@/components/charts/dashboard/ProjectBudgetChart"
import { BudgetModificationsChart } from "@/components/charts/dashboard/BudgetModificationsChart"
import { getErrorMessage } from "@/lib/error-codes"
import { requestExport } from "@/services/exports.service"
import type { FinancialNeed } from "@/types/financial"
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
import {
    getDashboardGlobal,
    getDashboardNeeds,
    getCdpsByNeed,
    getActivitiesByCdp,
    getContractsByCdp,
    getCdpsByContract,
    getBudgetRecordsByContract,
    getProjectBudgetOverview,
    getProjectExecution,
    getMgaActivitiesByProject,
    getDetailedByMga,
    getModificationsByActivity,
} from "@/services/financial/dashboard.service"

// ─── Formatters ──────────────────────────────────────────
import { formatCurrency } from "@/lib/format-utils"

// ─── Helpers ─────────────────────────────────────────────
function getProgressColor(percentage: number): "success" | "warning" | "danger" {
    if (percentage > 70) return "success"
    if (percentage > 40) return "warning"
    return "danger"
}

// ─── Component ───────────────────────────────────────────
export default function FinancialDashboardPage() {
    // Global state
    const [globalData, setGlobalData] = useState<DashboardGlobalData | null>(null)
    const [loadingGlobal, setLoadingGlobal] = useState(true)

    // Needs section
    const [needs, setNeeds] = useState<FinancialNeed[]>([])
    const [needsMeta, setNeedsMeta] = useState({ total: 0, page: 1, limit: 5, totalPages: 0, hasNextPage: false, hasPreviousPage: false })
    const [loadingNeeds, setLoadingNeeds] = useState(false)
    const [selectedNeedId, setSelectedNeedId] = useState<string | null>(null)
    const [cdpsByNeed, setCdpsByNeed] = useState<DashboardCdp[]>([])
    const [loadingCdpsByNeed, setLoadingCdpsByNeed] = useState(false)

    // CDP drill-down
    const [selectedCdpId, setSelectedCdpId] = useState<string | null>(null)
    const [selectedCdpNumber, setSelectedCdpNumber] = useState<string>("")
    const [activitiesByCdp, setActivitiesByCdp] = useState<DashboardActivityBalance[]>([])
    const [loadingActivities, setLoadingActivities] = useState(false)
    const [contractsByCdp, setContractsByCdp] = useState<DashboardMasterContract[]>([])
    const [loadingContracts, setLoadingContracts] = useState(false)

    // Contract drill-down
    const [selectedContractId, setSelectedContractId] = useState<string | null>(null)
    const [selectedContractNumber, setSelectedContractNumber] = useState<string>("")
    const [cdpsByContract, setCdpsByContract] = useState<DashboardCdp[]>([])
    const [loadingCdpsByContract, setLoadingCdpsByContract] = useState(false)
    const [budgetRecords, setBudgetRecords] = useState<DashboardBudgetRecord[]>([])
    const [loadingBudgetRecords, setLoadingBudgetRecords] = useState(false)

    // Projects budget
    const [projectBudget, setProjectBudget] = useState<DashboardProjectBudget[]>([])
    const [loadingProjectBudget, setLoadingProjectBudget] = useState(false)

    // Project execution
    const [projectExecution, setProjectExecution] = useState<DashboardProjectExecution[]>([])
    const [executionMeta, setExecutionMeta] = useState({ total: 0, page: 1, limit: 5, totalPages: 0, hasNextPage: false, hasPreviousPage: false })
    const [loadingExecution, setLoadingExecution] = useState(false)

    // MGA drill-down
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
    const [selectedProjectCode, setSelectedProjectCode] = useState<string>("")
    const [mgaActivities, setMgaActivities] = useState<DashboardMgaActivity[]>([])
    const [loadingMga, setLoadingMga] = useState(false)

    // Detailed activities drill-down
    const [selectedMgaId, setSelectedMgaId] = useState<string | null>(null)
    const [selectedMgaCode, setSelectedMgaCode] = useState<string>("")
    const [detailedActivities, setDetailedActivities] = useState<DashboardDetailedActivity[]>([])
    const [loadingDetailed, setLoadingDetailed] = useState(false)

    // Budget modifications
    const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)
    const [selectedActivityInfo, setSelectedActivityInfo] = useState<{ ceiling: number; balance: number }>({ ceiling: 0, balance: 0 })
    const [modifications, setModifications] = useState<DashboardBudgetModifications | null>(null)
    const [loadingModifications, setLoadingModifications] = useState(false)

    // Export State
    const [exporting, setExporting] = useState(false)

    // ─── Fetch helpers ───────────────────────────────────────
    const handleError = useCallback((err: any) => {
        const errorCode = err?.data?.errors?.code
        const msg = errorCode ? getErrorMessage(errorCode) : (err?.message ?? "Error al cargar datos")
        addToast({ title: "Error", description: msg, color: "danger" })
    }, [])

    const fetchGlobalData = useCallback(async () => {
        setLoadingGlobal(true)
        try {
            const data = await getDashboardGlobal()
            setGlobalData(data)
        } catch (e) { handleError(e) }
        finally { setLoadingGlobal(false) }
    }, [handleError])

    const fetchNeeds = useCallback(async (page = 1) => {
        setLoadingNeeds(true)
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: "5" }).toString()
            const res = await getDashboardNeeds(params)
            setNeeds(res.data)
            setNeedsMeta(res.meta)
        } catch (e) { handleError(e) }
        finally { setLoadingNeeds(false) }
    }, [handleError])

    const fetchProjectBudget = useCallback(async () => {
        setLoadingProjectBudget(true)
        try {
            const data = await getProjectBudgetOverview()
            setProjectBudget(data)
        } catch (e) { handleError(e) }
        finally { setLoadingProjectBudget(false) }
    }, [handleError])

    const fetchProjectExecution = useCallback(async (page = 1) => {
        setLoadingExecution(true)
        try {
            const params = new URLSearchParams({ page: page.toString(), limit: "5" }).toString()
            const res = await getProjectExecution(params)
            setProjectExecution(res.data)
            setExecutionMeta(res.meta)
        } catch (e) { handleError(e) }
        finally { setLoadingExecution(false) }
    }, [handleError])

    // Initial load
    useEffect(() => {
        fetchGlobalData()
        fetchNeeds()
        fetchProjectBudget()
        fetchProjectExecution()
    }, [fetchGlobalData, fetchNeeds, fetchProjectBudget, fetchProjectExecution])

    // ─── Need → CDPs ─────────────────────────────────────────
    const handleSelectNeed = useCallback(async (needId: string) => {
        setSelectedNeedId(needId)
        setSelectedCdpId(null)
        setSelectedContractId(null)
        setLoadingCdpsByNeed(true)
        try {
            const data = await getCdpsByNeed(needId)
            setCdpsByNeed(data)
        } catch (e) { handleError(e) }
        finally { setLoadingCdpsByNeed(false) }
    }, [handleError])

    // ─── CDP → Activities + Contracts ────────────────────────
    const handleSelectCdp = useCallback(async (cdpId: string, cdpNumber: string) => {
        setSelectedCdpId(cdpId)
        setSelectedCdpNumber(cdpNumber)
        setSelectedContractId(null)
        setLoadingActivities(true)
        setLoadingContracts(true)
        try {
            const [acts, conts] = await Promise.all([
                getActivitiesByCdp(cdpId),
                getContractsByCdp(cdpId),
            ])
            setActivitiesByCdp(acts)
            setContractsByCdp(conts)
        } catch (e) { handleError(e) }
        finally { setLoadingActivities(false); setLoadingContracts(false) }
    }, [handleError])

    // ─── Contract → CDPs + Budget Records ────────────────────
    const handleSelectContract = useCallback(async (contractId: string, contractNumber: string) => {
        setSelectedContractId(contractId)
        setSelectedContractNumber(contractNumber)
        setLoadingCdpsByContract(true)
        setLoadingBudgetRecords(true)
        try {
            const [cdps, brs] = await Promise.all([
                getCdpsByContract(contractId),
                getBudgetRecordsByContract(contractId),
            ])
            setCdpsByContract(cdps)
            setBudgetRecords(brs)
        } catch (e) { handleError(e) }
        finally { setLoadingCdpsByContract(false); setLoadingBudgetRecords(false) }
    }, [handleError])

    // ─── Project → MGA Activities ────────────────────────────
    const handleSelectProject = useCallback(async (projectId: string, projectCode: string) => {
        setSelectedProjectId(projectId)
        setSelectedProjectCode(projectCode)
        setSelectedMgaId(null)
        setSelectedActivityId(null)
        setLoadingMga(true)
        try {
            const data = await getMgaActivitiesByProject(projectId)
            setMgaActivities(data)
        } catch (e) { handleError(e) }
        finally { setLoadingMga(false) }
    }, [handleError])

    // ─── MGA → Detailed Activities ──────────────────────────
    const handleSelectMga = useCallback(async (mgaId: string, mgaCode: string) => {
        setSelectedMgaId(mgaId)
        setSelectedMgaCode(mgaCode)
        setSelectedActivityId(null)
        setLoadingDetailed(true)
        try {
            const data = await getDetailedByMga(mgaId)
            setDetailedActivities(data)
        } catch (e) { handleError(e) }
        finally { setLoadingDetailed(false) }
    }, [handleError])

    // ─── Activity → Modifications ───────────────────────────
    const handleSelectActivity = useCallback(async (activityId: string, ceiling: number, balance: number) => {
        setSelectedActivityId(activityId)
        setSelectedActivityInfo({ ceiling, balance })
        setLoadingModifications(true)
        try {
            const data = await getModificationsByActivity(activityId)
            setModifications(data)
        } catch (e) { handleError(e) }
        finally { setLoadingModifications(false) }
    }, [handleError])

    // ─── Refresh all ─────────────────────────────────────────
    const handleRefreshAll = () => {
        setSelectedNeedId(null)
        setSelectedCdpId(null)
        setSelectedContractId(null)
        setSelectedProjectId(null)
        setSelectedMgaId(null)
        setSelectedActivityId(null)
        fetchGlobalData()
        fetchNeeds()
        fetchProjectBudget()
        fetchProjectExecution()
    }

    // ─── Column Definitions ──────────────────────────────────
    const needColumns: ColumnDef<FinancialNeed>[] = [
        { key: "code", label: "Código", sortable: true },
        { key: "amount", label: "Monto", sortable: true, render: (n) => <span className="font-medium">{formatCurrency(Number.parseFloat(n.amount))}</span> },
        { key: "description", label: "Descripción", sortable: true, render: (n) => <span className="line-clamp-1 max-w-xs">{n.description}</span> },
        { key: "previousStudy.code", label: "Estudio", sortable: true, render: (n) => n.previousStudy?.code ?? "N/A" },
        {
            key: "previousStudy.status", label: "Estado", sortable: true, render: (n) => {
                const status = n.previousStudy?.status ?? "N/A"
                const sl = status.toLowerCase()
                let color: "success" | "warning" | "danger" | "default" = "default"
                if (sl === "aprobado" || sl === "approved") color = "success"
                else if (sl === "pendiente" || sl === "pending") color = "warning"
                else if (sl === "rechazado" || sl === "rejected") color = "danger"
                return <Chip color={color} variant="flat" size="sm">{status}</Chip>
            }
        },
    ]

    const executionColumns: ColumnDef<DashboardProjectExecution>[] = [
        { key: "code", label: "Código", sortable: true },
        { key: "name", label: "Nombre", sortable: true, render: (p) => <span className="line-clamp-1 max-w-xs">{p.name}</span> },
        { key: "dependencyName", label: "Dependencia", sortable: true },
        { key: "currentBudget", label: "Presupuesto", sortable: true, render: (p) => formatCurrency(p.currentBudget) },
        { key: "execution", label: "Ejecución", sortable: true, render: (p) => formatCurrency(p.execution) },
        {
            key: "executionPercentage", label: "% Ejecución", sortable: true, render: (p) => (
                <div className="flex items-center gap-2 min-w-[120px]">
                    <Progress size="sm" value={p.executionPercentage} color={getProgressColor(p.executionPercentage)} className="flex-1" />
                    <span className="text-xs font-medium w-10 text-right">{p.executionPercentage}%</span>
                </div>
            ),
        },
        { key: "mgaActivitiesCount", label: "Act. MGA", render: (p) => <Chip size="sm" variant="flat">{p.mgaActivitiesCount}</Chip> },
    ]

    const mgaColumns: ColumnDef<DashboardMgaActivity>[] = [
        { key: "code", label: "Código" },
        { key: "name", label: "Nombre", render: (a) => <span className="line-clamp-1 max-w-xs">{a.name}</span> },
        { key: "totalValue", label: "Valor Total", render: (a) => formatCurrency(a.totalValue) },
        {
            key: "executionPercentage", label: "% Ejecución", render: (a) => (
                <div className="flex items-center gap-2 min-w-[120px]">
                    <Progress size="sm" value={a.executionPercentage} color={getProgressColor(a.executionPercentage)} className="flex-1" />
                    <span className="text-xs font-medium w-10 text-right">{a.executionPercentage}%</span>
                </div>
            ),
        },
        { key: "detailedActivitiesCount", label: "Act. Det.", render: (a) => <Chip size="sm" variant="flat">{a.detailedActivitiesCount}</Chip> },
    ]

    const detailedColumns: ColumnDef<DashboardDetailedActivity>[] = [
        { key: "code", label: "Código" },
        { key: "name", label: "Nombre", render: (a) => <span className="line-clamp-1 max-w-xs">{a.name}</span> },
        { key: "budgetCeiling", label: "Techo", render: (a) => formatCurrency(a.budgetCeiling) },
        { key: "balance", label: "Saldo", render: (a) => formatCurrency(a.balance) },
        {
            key: "executionPercentage", label: "% Ejecución", render: (a) => (
                <div className="flex items-center gap-2 min-w-[120px]">
                    <Progress size="sm" value={a.executionPercentage} color={getProgressColor(a.executionPercentage)} className="flex-1" />
                    <span className="text-xs font-medium w-10 text-right">{a.executionPercentage}%</span>
                </div>
            ),
        },
        { key: "cdpCount", label: "CDPs", render: (a) => <Chip size="sm" variant="flat">{a.cdpCount}</Chip> },
        { key: "projectCode", label: "Proyecto" },
    ]

    // ─── Render ──────────────────────────────────────────────
    return (
        <div className="flex flex-col gap-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Breadcrumbs>
                        <BreadcrumbItem href="/dashboard">Inicio</BreadcrumbItem>
                        <BreadcrumbItem href="/dashboard/financial/dashboard">Financiero</BreadcrumbItem>
                        <BreadcrumbItem>Dashboard</BreadcrumbItem>
                    </Breadcrumbs>
                    <h1 className="text-2xl font-bold mt-2">Dashboard Financiero</h1>
                    <p className="text-default-500 text-sm">Vista general del estado financiero del sistema</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="flat"
                        color="primary"
                        startContent={<Download className="w-4 h-4" />}
                        isLoading={exporting}
                        onPress={async () => {
                            try {
                                setExporting(true)
                                await requestExport({ system: "SPD", type: "FINANCIAL_DASHBOARD" })
                                addToast({ title: "Exportación solicitada", description: "Recibirás una notificación cuando el archivo esté listo para descargar.", color: "primary", timeout: 5000 })
                            } catch {
                                addToast({ title: "Error", description: "No se pudo solicitar la exportación. Intenta de nuevo.", color: "danger", timeout: 5000 })
                            } finally {
                                setExporting(false)
                            }
                        }}
                    >
                        Exportar
                    </Button>
                    <Button
                        variant="flat"
                        startContent={<RefreshCw className="w-4 h-4" />}
                        onPress={handleRefreshAll}
                        isLoading={loadingGlobal}
                    >
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* KPIs */}
            {loadingGlobal && (
                <div className="flex justify-center py-12"><Spinner size="lg" /></div>
            )}
            {!loadingGlobal && globalData && (
                <GlobalKPIs data={globalData} />
            )}

            {/* Two-column layout: Needs + Project Budget */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SECTION: Necesidades */}
                <Card className="shadow-sm">
                    <CardHeader className="px-6 pt-6 pb-2">
                        <h2 className="text-lg font-semibold">Necesidades</h2>
                    </CardHeader>
                    <CardBody className="px-6 pb-6">
                        <DataTable
                            items={needs}
                            columns={needColumns}
                            isLoading={loadingNeeds}
                            pagination={{
                                page: needsMeta.page,
                                totalPages: needsMeta.totalPages,
                                onChange: (p: number) => void fetchNeeds(p),
                            }}
                            rowActions={[
                                {
                                    key: "view-cdps",
                                    label: "Ver CDPs",
                                    icon: <ChevronRight className="w-4 h-4" />,
                                    onClick: (need) => void handleSelectNeed(need.id),
                                },
                            ]}
                            emptyContent="No hay necesidades registradas"
                        />

                        {/* CDP Distribution Chart for selected Need */}
                        {selectedNeedId && (
                            <div className="mt-4">
                                {loadingCdpsByNeed ? (
                                    <div className="flex justify-center py-8"><Spinner /></div>
                                ) : (
                                    <>
                                        <CdpDistributionChart
                                            data={cdpsByNeed}
                                            title="Distribución de CDPs"
                                            description="CDPs asociados a la necesidad seleccionada"
                                        />
                                        {/* CDP clickable list */}
                                        {cdpsByNeed.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                <p className="text-sm font-medium text-default-600">Seleccione un CDP para ver detalles:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {cdpsByNeed.map((cdp) => (
                                                        <Button
                                                            key={cdp.id}
                                                            size="sm"
                                                            variant={selectedCdpId === cdp.id ? "solid" : "flat"}
                                                            color={selectedCdpId === cdp.id ? "primary" : "default"}
                                                            onPress={() => handleSelectCdp(cdp.id, cdp.number)}
                                                        >
                                                            CDP {cdp.number}
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Project Budget Chart */}
                {loadingProjectBudget ? (
                    <div className="flex justify-center py-12"><Spinner size="lg" /></div>
                ) : (
                    <ProjectBudgetChart data={projectBudget} />
                )}
            </div>

            {/* Activities + Contracts for selected CDP */}
            {selectedCdpId && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Activities Balance */}
                    <Card className="shadow-sm">
                        <CardHeader className="px-6 pt-6 pb-2">
                            <h2 className="text-lg font-semibold">Actividades - CDP {selectedCdpNumber}</h2>
                        </CardHeader>
                        <CardBody className="px-6 pb-6">
                            {loadingActivities && (
                                <div className="flex justify-center py-8"><Spinner /></div>
                            )}
                            {!loadingActivities && activitiesByCdp.length === 0 && (
                                <p className="text-default-400 text-center py-8">No hay actividades asociadas</p>
                            )}
                            {!loadingActivities && activitiesByCdp.length > 0 && (
                                <div className="space-y-3">
                                    {activitiesByCdp.map((act) => (
                                        <div key={act.id} className="p-3 border rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="text-sm font-medium">{act.code}</p>
                                                    <p className="text-xs text-default-500 line-clamp-1">{act.name}</p>
                                                </div>
                                                <Chip size="sm" variant="flat" color={getProgressColor(act.percentage)}>
                                                    {act.percentage}%
                                                </Chip>
                                            </div>
                                            <Progress
                                                size="sm"
                                                value={act.percentage}
                                                color={getProgressColor(act.percentage)}
                                            />
                                            <div className="flex justify-between mt-1 text-xs text-default-500">
                                                <span>Asignado: {formatCurrency(act.assignedValue)}</span>
                                                <span>Techo: {formatCurrency(act.budgetCeiling)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {/* Contracts for CDP */}
                    <Card className="shadow-sm">
                        <CardHeader className="px-6 pt-6 pb-2">
                            <h2 className="text-lg font-semibold">Contratos Marco - CDP {selectedCdpNumber}</h2>
                        </CardHeader>
                        <CardBody className="px-6 pb-6">
                            {loadingContracts && (
                                <div className="flex justify-center py-8"><Spinner /></div>
                            )}
                            {!loadingContracts && contractsByCdp.length === 0 && (
                                <p className="text-default-400 text-center py-8">No hay contratos asociados</p>
                            )}
                            {!loadingContracts && contractsByCdp.length > 0 && (
                                <div className="space-y-2">
                                    {contractsByCdp.map((c) => (
                                        <button
                                            type="button"
                                            key={c.id}
                                            className={`w-full text-left bg-transparent p-3 border rounded-lg cursor-pointer transition-colors hover:bg-default-50 ${selectedContractId === c.id ? "border-primary bg-primary-50" : ""}`}
                                            onClick={() => void handleSelectContract(c.id, c.number)}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-sm font-medium">Contrato #{c.number}</p>
                                                    <p className="text-xs text-default-500 line-clamp-1">{c.object}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">{formatCurrency(c.totalValue)}</p>
                                                    <Chip size="sm" variant="flat" color={
                                                        (c.state ?? "").toLowerCase().includes("activo") ? "success" : "default"
                                                    }>{c.state ?? "N/A"}</Chip>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            )}

            {/* Contract drill-down: CDPs pie chart + Budget records */}
            {selectedContractId && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        {loadingCdpsByContract ? (
                            <div className="flex justify-center py-8"><Spinner /></div>
                        ) : (
                            <CdpDistributionChart
                                data={cdpsByContract}
                                title={`CDPs - Contrato #${selectedContractNumber}`}
                                description="Distribución de CDPs asociados al contrato"
                            />
                        )}
                    </div>

                    {/* Budget Records */}
                    <Card className="shadow-sm">
                        <CardHeader className="px-6 pt-6 pb-2">
                            <h2 className="text-lg font-semibold">Registros Presupuestales - Contrato #{selectedContractNumber}</h2>
                        </CardHeader>
                        <CardBody className="px-6 pb-6">
                            {loadingBudgetRecords && (
                                <div className="flex justify-center py-8"><Spinner /></div>
                            )}
                            {!loadingBudgetRecords && budgetRecords.length === 0 && (
                                <p className="text-default-400 text-center py-8">No hay registros presupuestales</p>
                            )}
                            {!loadingBudgetRecords && budgetRecords.length > 0 && (
                                <div className="space-y-3">
                                    {budgetRecords.map((br) => (
                                        <div key={br.id} className="p-3 border rounded-lg">
                                            <div className="flex justify-between items-center mb-2">
                                                <p className="text-sm font-medium">RP #{br.number}</p>
                                                <Chip size="sm" variant="flat" color={getProgressColor(br.percentage)}>
                                                    {br.percentage}% ejecutado
                                                </Chip>
                                            </div>
                                            <Progress
                                                size="sm"
                                                value={br.percentage}
                                                color={getProgressColor(br.percentage)}
                                            />
                                            <div className="flex justify-between mt-1 text-xs text-default-500">
                                                <span>Valor: {formatCurrency(br.totalValue)}</span>
                                                <span>Saldo: {formatCurrency(br.balance)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                </div>
            )}

            <Divider />

            {/* SECTION: Project Execution */}
            <Card className="shadow-sm">
                <CardHeader className="px-6 pt-6 pb-2">
                    <h2 className="text-lg font-semibold">Ejecución Financiera de Proyectos</h2>
                </CardHeader>
                <CardBody className="px-6 pb-6">
                    <DataTable
                        items={projectExecution}
                        columns={executionColumns}
                        isLoading={loadingExecution}
                        pagination={{
                            page: executionMeta.page,
                            totalPages: executionMeta.totalPages,
                            onChange: (p: number) => void fetchProjectExecution(p),
                        }}
                        rowActions={[
                            {
                                key: "view-mga",
                                label: "Ver Actividades MGA",
                                icon: <ChevronRight className="w-4 h-4" />,
                                onClick: (proj) => void handleSelectProject(proj.id, proj.code),
                            },
                        ]}
                        emptyContent="No hay proyectos registrados"
                    />
                </CardBody>
            </Card>

            {/* MGA Activities for selected project */}
            {selectedProjectId && (
                <Card className="shadow-sm">
                    <CardHeader className="px-6 pt-6 pb-2">
                        <h2 className="text-lg font-semibold">Actividades MGA - Proyecto {selectedProjectCode}</h2>
                    </CardHeader>
                    <CardBody className="px-6 pb-6">
                        {loadingMga && (
                            <div className="flex justify-center py-8"><Spinner /></div>
                        )}
                        {!loadingMga && mgaActivities.length === 0 && (
                            <p className="text-default-400 text-center py-8">No hay actividades MGA</p>
                        )}
                        {!loadingMga && mgaActivities.length > 0 && (
                            <DataTable
                                items={mgaActivities}
                                columns={mgaColumns}
                                rowActions={[
                                    {                                        key: "view-detailed",                                        label: "Ver Actividades Detalladas",
                                        icon: <ChevronRight className="w-4 h-4" />,
                                        onClick: (mga) => void handleSelectMga(mga.id, mga.code),
                                    },
                                ]}
                                emptyContent="No hay actividades MGA"
                            />
                        )}
                    </CardBody>
                </Card>
            )}

            {/* Detailed Activities for selected MGA */}
            {selectedMgaId && (
                <Card className="shadow-sm">
                    <CardHeader className="px-6 pt-6 pb-2">
                        <h2 className="text-lg font-semibold">Actividades Detalladas - MGA {selectedMgaCode}</h2>
                    </CardHeader>
                    <CardBody className="px-6 pb-6">
                        {loadingDetailed && (
                            <div className="flex justify-center py-8"><Spinner /></div>
                        )}
                        {!loadingDetailed && detailedActivities.length === 0 && (
                            <p className="text-default-400 text-center py-8">No hay actividades detalladas</p>
                        )}
                        {!loadingDetailed && detailedActivities.length > 0 && (
                            <DataTable
                                items={detailedActivities}
                                columns={detailedColumns}
                                rowActions={[
                                    {                                        key: "view-modifications",                                        label: "Ver Ajustes Presupuestales",
                                        icon: <ChevronRight className="w-4 h-4" />,
                                        onClick: (act) => void handleSelectActivity(act.id, act.budgetCeiling, act.balance),
                                    },
                                ]}
                                emptyContent="No hay actividades detalladas"
                            />
                        )}
                    </CardBody>
                </Card>
            )}

            {/* Budget Modifications for selected activity */}
            {selectedActivityId && (
                <div>
                    {loadingModifications && (
                        <div className="flex justify-center py-8"><Spinner /></div>
                    )}
                    {!loadingModifications && modifications && (
                        <div className="space-y-4">
                            <BudgetModificationsChart
                                data={modifications}
                                activityBudgetCeiling={selectedActivityInfo.ceiling}
                                activityBalance={selectedActivityInfo.balance}
                            />

                            {/* Modifications detail accordion */}
                            <Card className="shadow-sm">
                                <CardBody className="px-6 py-4">
                                    <Accordion>
                                        <AccordionItem
                                            key="additions"
                                            title={`Adiciones (${modifications.additions.length}) - ${formatCurrency(modifications.totalAdditions)}`}
                                        >
                                            <div className="space-y-2">
                                                {modifications.additions.length > 0 ? modifications.additions.map((mod) => (
                                                    <div key={mod.id} className="p-3 border rounded-lg text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="font-medium text-green-600">+{formatCurrency(mod.value)}</span>
                                                            <span className="text-default-500">{mod.dateIssue ? new Date(mod.dateIssue).toLocaleDateString("es-CO") : "N/A"}</span>
                                                        </div>
                                                        {mod.description && <p className="text-default-500 mt-1">{mod.description}</p>}
                                                    </div>
                                                )) : <p className="text-default-400 text-sm">Sin adiciones registradas</p>}
                                            </div>
                                        </AccordionItem>
                                        <AccordionItem
                                            key="reductions"
                                            title={`Reducciones (${modifications.reductions.length}) - ${formatCurrency(modifications.totalReductions)}`}
                                        >
                                            <div className="space-y-2">
                                                {modifications.reductions.length > 0 ? modifications.reductions.map((mod) => (
                                                    <div key={mod.id} className="p-3 border rounded-lg text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="font-medium text-red-600">-{formatCurrency(mod.value)}</span>
                                                            <span className="text-default-500">{mod.dateIssue ? new Date(mod.dateIssue).toLocaleDateString("es-CO") : "N/A"}</span>
                                                        </div>
                                                        {mod.description && <p className="text-default-500 mt-1">{mod.description}</p>}
                                                    </div>
                                                )) : <p className="text-default-400 text-sm">Sin reducciones registradas</p>}
                                            </div>
                                        </AccordionItem>
                                        <AccordionItem
                                            key="transfers"
                                            title={`Redistribuciones (${modifications.transfers.length})`}
                                        >
                                            <div className="space-y-2">
                                                {modifications.transfers.length > 0 ? modifications.transfers.map((mod) => (
                                                    <div key={mod.id} className="p-3 border rounded-lg text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="font-medium text-amber-600">{formatCurrency(mod.value)}</span>
                                                            <span className="text-default-500">{mod.dateIssue ? new Date(mod.dateIssue).toLocaleDateString("es-CO") : "N/A"}</span>
                                                        </div>
                                                        {mod.description && <p className="text-default-500 mt-1">{mod.description}</p>}
                                                    </div>
                                                )) : <p className="text-default-400 text-sm">Sin redistribuciones registradas</p>}
                                            </div>
                                        </AccordionItem>
                                    </Accordion>
                                </CardBody>
                            </Card>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
