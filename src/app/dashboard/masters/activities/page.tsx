"use client"

import { Button, Breadcrumbs, BreadcrumbItem, Chip, SortDescriptor } from "@heroui/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction } from "@/components/tables/DataTable"
import { useDebounce } from "@/hooks/useDebounce"
import { usePermissions } from "@/hooks/usePermissions"
import { get, post, patch, PaginatedData, PaginationMeta } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { RefreshCw, Eye, AlertCircle, Pencil, Plus } from "lucide-react"
import { addToast } from "@heroui/toast"
import type { DetailedActivity, MGAActivity, FullDetailedActivity } from "@/types/activity"
import { getErrorMessage } from "@/lib/error-codes"
import { DetailedActivityModal } from "@/components/modals/masters/DetailedActivityModal"
import { CreateDetailedActivityModal, CreateDetailedActivityPayload } from "@/components/modals/masters/CreateDetailedActivityModal"

// Columns for Detailed Activities
const detailedActivityColumns: ColumnDef<DetailedActivity>[] = [
    { key: "code", label: "Código", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    {
        key: "project.name",
        label: "Proyecto",
        sortable: false,
        render: (activity) => activity.project?.name ?? "N/A",
    },
    {
        key: "rubric.code",
        label: "Pos. Presupuestal",
        sortable: false,
        render: (activity) => activity.rubric?.code ?? "N/A",
    },
    {
        key: "budgetCeiling",
        label: "Techo Presupuestal",
        sortable: true,
        render: (activity) => {
            const value = parseFloat(activity.budgetCeiling)
            return new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0,
            }).format(value)
        },
    },
    {
        key: "balance",
        label: "Saldo",
        sortable: true,
        render: (activity) => {
            const value = parseFloat(activity.balance)
            return new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0,
            }).format(value)
        },
    },
    { key: "cpc", label: "CPC", sortable: true },
]

// Columns for MGA Activities
const mgaActivityColumns: ColumnDef<MGAActivity>[] = [
    { key: "code", label: "Código", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    { key: "description", label: "Descripción", sortable: false },
    {
        key: "budgetCeiling",
        label: "Techo Presupuestal",
        sortable: true,
        render: (activity) => {
            const value = parseFloat(activity.budgetCeiling)
            return new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0,
            }).format(value)
        },
    },
    {
        key: "balance",
        label: "Saldo",
        sortable: true,
        render: (activity) => {
            const value = parseFloat(activity.balance)
            return new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0,
            }).format(value)
        },
    },
]

// Simulated MGA Activities Data
const simulatedMGAActivities: MGAActivity[] = [
    {
        id: "mga-001",
        code: "MGA-2024-001",
        name: "Fortalecimiento institucional",
        description: "Mejora de capacidades organizativas",
        budgetCeiling: "50000000",
        balance: "35000000",
        createAt: "2024-01-15T10:00:00.000Z",
        updateAt: "2024-01-20T15:30:00.000Z",
    },
    {
        id: "mga-002",
        code: "MGA-2024-002",
        name: "Desarrollo de infraestructura",
        description: "Construcción y mejora de instalaciones",
        budgetCeiling: "120000000",
        balance: "80000000",
        createAt: "2024-02-01T08:00:00.000Z",
        updateAt: "2024-02-10T12:00:00.000Z",
    },
    {
        id: "mga-003",
        code: "MGA-2024-003",
        name: "Capacitación y formación",
        description: "Programas de entrenamiento del personal",
        budgetCeiling: "25000000",
        balance: "20000000",
        createAt: "2024-03-01T09:00:00.000Z",
        updateAt: "2024-03-05T11:00:00.000Z",
    },
    {
        id: "mga-004",
        code: "MGA-2024-004",
        name: "Sistemas de información",
        description: "Implementación de plataformas tecnológicas",
        budgetCeiling: "75000000",
        balance: "60000000",
        createAt: "2024-03-15T14:00:00.000Z",
        updateAt: "2024-03-20T16:00:00.000Z",
    },
    {
        id: "mga-005",
        code: "MGA-2024-005",
        name: "Gestión ambiental",
        description: "Proyectos de sostenibilidad y medio ambiente",
        budgetCeiling: "40000000",
        balance: "38000000",
        createAt: "2024-04-01T10:00:00.000Z",
        updateAt: "2024-04-05T11:30:00.000Z",
    },
]

export default function MastersActivitiesPage() {
    // Permissions
    const { canRead, canCreate, canUpdate } = usePermissions("/masters/activities")

    // Tab State
    const [selectedTab, setSelectedTab] = useState<string>("detailed")

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [modalMode, setModalMode] = useState<"view" | "edit">("view")
    const [selectedActivity, setSelectedActivity] = useState<FullDetailedActivity | null>(null)
    const [saving, setSaving] = useState(false)

    // ============================================
    // DETAILED ACTIVITIES STATE & LOGIC
    // ============================================
    const [detailedItems, setDetailedItems] = useState<DetailedActivity[]>([])
    const [detailedMeta, setDetailedMeta] = useState<PaginationMeta | null>(null)
    const [detailedLoading, setDetailedLoading] = useState(true)
    const [detailedError, setDetailedError] = useState<string | null>(null)
    const [detailedPage, setDetailedPage] = useState(1)
    const [detailedSearch, setDetailedSearch] = useState("")
    const [detailedLimit, setDetailedLimit] = useState(10)
    const [detailedSortDescriptor, setDetailedSortDescriptor] = useState<SortDescriptor>({
        column: "code",
        direction: "ascending",
    })
    const [detailedSearchInput, setDetailedSearchInput] = useState("")
    const debouncedDetailedSearch = useDebounce(detailedSearchInput, 400)

    const fetchDetailedActivities = useCallback(async () => {
        setDetailedLoading(true)
        setDetailedError(null)
        try {
            const params = new URLSearchParams({
                page: detailedPage.toString(),
                limit: detailedLimit.toString(),
            })
            if (detailedSearch.trim()) {
                params.set("search", detailedSearch.trim())
            }

            if (detailedSortDescriptor.column) {
                params.set("sortBy", detailedSortDescriptor.column as string)
                params.set("sortOrder", detailedSortDescriptor.direction === "ascending" ? "ASC" : "DESC")
            }

            const result = await get<PaginatedData<DetailedActivity>>(`${endpoints.masters.detailedActivities}?${params}`)
            setDetailedItems(result.data)
            setDetailedMeta(result.meta)
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : (e.message ?? "Error al cargar actividades detalladas")
            setDetailedError(message)
        } finally {
            setDetailedLoading(false)
        }
    }, [detailedPage, detailedSearch, detailedLimit, detailedSortDescriptor])

    useEffect(() => {
        if (selectedTab === "detailed") {
            fetchDetailedActivities()
        }
    }, [fetchDetailedActivities, selectedTab])

    useEffect(() => {
        setDetailedSearch(debouncedDetailedSearch)
        setDetailedPage(1)
    }, [debouncedDetailedSearch])

    const detailedTopActions: TopAction[] = useMemo(() => {
        const actions: TopAction[] = [
            {
                key: "refresh",
                label: "Actualizar",
                icon: <RefreshCw size={16} />,
                color: "default",
                onClick: fetchDetailedActivities,
            },
        ]
        if (canCreate) {
            actions.push({
                key: "create",
                label: "Crear",
                icon: <Plus size={16} />,
                color: "primary",
                onClick: () => setIsCreateModalOpen(true),
            })
        }
        return actions
    }, [fetchDetailedActivities, canCreate])

    // View/Edit handlers
    const onViewActivity = async (activity: DetailedActivity) => {
        try {
            const fullActivity = await get<FullDetailedActivity>(`${endpoints.masters.detailedActivities}/${activity.id}`)
            setSelectedActivity(fullActivity)
            setModalMode("view")
            setIsModalOpen(true)
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al obtener detalles de la actividad"
            addToast({ title: message, color: "danger" })
        }
    }

    const onEditActivity = async (activity: DetailedActivity) => {
        try {
            const fullActivity = await get<FullDetailedActivity>(`${endpoints.masters.detailedActivities}/${activity.id}`)
            setSelectedActivity(fullActivity)
            setModalMode("edit")
            setIsModalOpen(true)
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al obtener detalles de la actividad"
            addToast({ title: message, color: "danger" })
        }
    }

    const onSaveActivity = async (data: { name: string; observations: string }) => {
        if (!selectedActivity) return
        setSaving(true)
        try {
            await patch(`${endpoints.masters.detailedActivities}/${selectedActivity.id}`, data)
            addToast({ title: "Actividad actualizada correctamente", color: "success" })
            setIsModalOpen(false)
            setSelectedActivity(null)
            fetchDetailedActivities()
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al actualizar la actividad"
            addToast({ title: message, color: "danger" })
        } finally {
            setSaving(false)
        }
    }

    const onCreateActivity = async (data: CreateDetailedActivityPayload) => {
        setSaving(true)
        try {
            await post(endpoints.masters.detailedActivities, data)
            addToast({ title: "Actividad creada correctamente", color: "success" })
            setIsCreateModalOpen(false)
            fetchDetailedActivities()
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al crear la actividad"
            addToast({ title: message, color: "danger" })
        } finally {
            setSaving(false)
        }
    }

    const detailedRowActions: RowAction<DetailedActivity>[] = useMemo(() => {
        const actions: RowAction<DetailedActivity>[] = [
            {
                key: "view",
                label: "Ver Detalles",
                icon: <Eye size={16} />,
                onClick: onViewActivity,
            },
        ]
        if (canUpdate) {
            actions.push({
                key: "edit",
                label: "Editar",
                icon: <Pencil size={16} />,
                onClick: onEditActivity,
            })
        }
        return actions
    }, [canUpdate])

    // ============================================
    // MGA ACTIVITIES STATE & LOGIC (SIMULATED)
    // ============================================
    const [mgaItems] = useState<MGAActivity[]>(simulatedMGAActivities)
    const [mgaLoading, setMgaLoading] = useState(false)
    const [mgaSearchInput, setMgaSearchInput] = useState("")
    const debouncedMgaSearch = useDebounce(mgaSearchInput, 400)
    const [mgaSortDescriptor, setMgaSortDescriptor] = useState<SortDescriptor>({
        column: "code",
        direction: "ascending",
    })

    // Filtered and sorted MGA items (client-side since it's simulated)
    const filteredMgaItems = useMemo(() => {
        let items = [...mgaItems]

        // Filter
        if (debouncedMgaSearch.trim()) {
            const search = debouncedMgaSearch.toLowerCase()
            items = items.filter(
                (item) =>
                    item.code.toLowerCase().includes(search) ||
                    item.name.toLowerCase().includes(search) ||
                    item.description.toLowerCase().includes(search)
            )
        }

        // Sort
        if (mgaSortDescriptor.column) {
            const key = mgaSortDescriptor.column as keyof MGAActivity
            items.sort((a, b) => {
                const aVal = a[key] ?? ""
                const bVal = b[key] ?? ""
                const comparison = String(aVal).localeCompare(String(bVal))
                return mgaSortDescriptor.direction === "ascending" ? comparison : -comparison
            })
        }

        return items
    }, [mgaItems, debouncedMgaSearch, mgaSortDescriptor])

    const refreshMga = useCallback(() => {
        setMgaLoading(true)
        // Simulate loading
        setTimeout(() => setMgaLoading(false), 500)
        addToast({ title: "Datos MGA actualizados (simulados)", color: "success" })
    }, [])

    const mgaTopActions: TopAction[] = useMemo(() => [
        {
            key: "refresh",
            label: "Actualizar",
            icon: <RefreshCw size={16} />,
            color: "default",
            onClick: refreshMga,
        },
    ], [refreshMga])

    return (
        <div className="grid gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Inicio</BreadcrumbItem>
                <BreadcrumbItem>Maestros</BreadcrumbItem>
                <BreadcrumbItem>Actividades</BreadcrumbItem>
            </Breadcrumbs>

            {!canRead ? (
                <div className="text-center py-16">
                    <p className="text-xl font-semibold text-danger">Acceso Denegado</p>
                    <p className="text-default-500 mt-2">No tienes permisos para ver este módulo.</p>
                </div>
            ) : (
                <>
                    {/* Selection Pills */}
                    <div className="flex gap-3">
                        <div
                            onClick={() => setSelectedTab("detailed")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${selectedTab === "detailed"
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-default-100 text-default-600 hover:bg-default-200"
                                }`}
                        >
                            <Eye size={16} />
                            <span className="text-sm font-medium">Detalladas</span>
                        </div>

                        <div
                            onClick={() => setSelectedTab("mga")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer transition-all ${selectedTab === "mga"
                                    ? "bg-primary text-white shadow-sm"
                                    : "bg-default-100 text-default-600 hover:bg-default-200"
                                }`}
                        >
                            <AlertCircle size={16} />
                            <span className="text-sm font-medium">MGA</span>
                        </div>
                    </div>

                    {/* Content based on selected tab */}
                    {selectedTab === "mga" && (
                        <div>
                            <div className="p-4 mb-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-800 flex items-center gap-2">
                                <AlertCircle size={18} className="text-warning" />
                                <span className="text-warning-600 dark:text-warning-400 text-sm font-medium">
                                    Datos simulados - El endpoint para actividades MGA aún no está disponible
                                </span>
                            </div>
                            <DataTable
                                items={filteredMgaItems}
                                columns={mgaActivityColumns}
                                isLoading={mgaLoading}
                                topActions={mgaTopActions}
                                searchValue={mgaSearchInput}
                                onSearchChange={setMgaSearchInput}
                                searchPlaceholder="Buscar actividades MGA..."
                                ariaLabel="Tabla de actividades MGA"
                                sortDescriptor={mgaSortDescriptor}
                                onSortChange={setMgaSortDescriptor}
                            />
                        </div>
                    )}

                    {selectedTab === "detailed" && (
                        <div>
                            {detailedError ? (
                                <div className="text-center py-8 text-danger">
                                    <p>{detailedError}</p>
                                    <Button variant="flat" className="mt-2" onPress={fetchDetailedActivities}>
                                        Reintentar
                                    </Button>
                                </div>
                            ) : (
                                <DataTable
                                    items={detailedItems}
                                    columns={detailedActivityColumns}
                                    isLoading={detailedLoading}
                                    rowActions={detailedRowActions}
                                    topActions={detailedTopActions}
                                    searchValue={detailedSearchInput}
                                    onSearchChange={setDetailedSearchInput}
                                    searchPlaceholder="Buscar actividades detalladas..."
                                    ariaLabel="Tabla de actividades detalladas"
                                    pagination={detailedMeta ? {
                                        page: detailedPage,
                                        totalPages: detailedMeta.totalPages,
                                        onChange: setDetailedPage,
                                        pageSize: detailedLimit,
                                        onPageSizeChange: (newLimit) => {
                                            setDetailedLimit(newLimit)
                                            setDetailedPage(1)
                                        }
                                    } : undefined}
                                    sortDescriptor={detailedSortDescriptor}
                                    onSortChange={setDetailedSortDescriptor}
                                />
                            )}
                        </div>
                    )}
                </>
            )}

            <DetailedActivityModal
                isOpen={isModalOpen}
                activity={selectedActivity}
                mode={modalMode}
                isLoading={saving}
                onClose={() => {
                    setIsModalOpen(false)
                    setSelectedActivity(null)
                }}
                onSave={onSaveActivity}
            />

            <CreateDetailedActivityModal
                isOpen={isCreateModalOpen}
                isLoading={saving}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={onCreateActivity}
            />
        </div>
    )
}
