"use client"

import { Button, SortDescriptor } from "@heroui/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction } from "@/components/tables/DataTable"
import { useDebounce } from "@/hooks/useDebounce"
import { usePermissions } from "@/hooks/usePermissions"
import { get, post, patch, del, PaginatedData, PaginationMeta } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { RefreshCw, Eye, Pencil, Plus, Trash2, ArrowLeftRight } from "lucide-react"
import { addToast } from "@heroui/toast"
import type { DetailedActivity, FullDetailedActivity } from "@/types/activity"
import { getErrorMessage } from "@/lib/error-codes"
import { DetailedActivityModal } from "@/components/modals/masters/DetailedActivityModal"
import { CreateDetailedActivityModal, CreateDetailedActivityPayload } from "@/components/modals/masters/CreateDetailedActivityModal"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { CreateBudgetModificationModal, CreateBudgetModificationPayload } from "@/components/modals/masters/CreateBudgetModificationModal"
import { BudgetModificationHistoryModal } from "@/components/modals/masters/BudgetModificationHistoryModal"
import { History } from "lucide-react"

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

export function DetailedActivitiesTab() {
    const { canCreate, canUpdate, canDelete, hasPermission } = usePermissions("/masters/activities")

    // Explicit permission for budget modification
    const canModifyBudget = hasPermission("BUDGET_MODIFICATION")

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [activityToDelete, setActivityToDelete] = useState<DetailedActivity | null>(null)
    const [modalMode, setModalMode] = useState<"view" | "edit">("view")
    const [selectedActivity, setSelectedActivity] = useState<FullDetailedActivity | null>(null)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // Modification Modal State
    const [isModificationModalOpen, setIsModificationModalOpen] = useState(false)
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
    const [activityForModification, setActivityForModification] = useState<DetailedActivity | null>(null)

    // Table State
    const [items, setItems] = useState<DetailedActivity[]>([])
    const [meta, setMeta] = useState<PaginationMeta | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [limit, setLimit] = useState(10)
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "code",
        direction: "ascending",
    })
    const [searchInput, setSearchInput] = useState("")
    const debouncedSearch = useDebounce(searchInput, 400)

    const fetchActivities = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            })
            if (search.trim()) {
                params.set("search", search.trim())
            }

            if (sortDescriptor.column) {
                params.set("sortBy", sortDescriptor.column as string)
                params.set("sortOrder", sortDescriptor.direction === "ascending" ? "ASC" : "DESC")
            }

            const result = await get<PaginatedData<DetailedActivity>>(`${endpoints.masters.detailedActivities}?${params}`)
            setItems(result.data)
            setMeta(result.meta)
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : (e.message ?? "Error al cargar actividades detalladas")
            setError(message)
        } finally {
            setLoading(false)
        }
    }, [page, search, limit, sortDescriptor])

    useEffect(() => {
        fetchActivities()
    }, [fetchActivities])

    useEffect(() => {
        setSearch(debouncedSearch)
        setPage(1)
    }, [debouncedSearch])

    const topActions: TopAction[] = useMemo(() => {
        const actions: TopAction[] = [
            {
                key: "refresh",
                label: "Actualizar",
                icon: <RefreshCw size={16} />,
                color: "default",
                onClick: fetchActivities,
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
    }, [fetchActivities, canCreate])

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
            fetchActivities()
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
            fetchActivities()
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al crear la actividad"
            addToast({ title: message, color: "danger" })
        } finally {
            setSaving(false)
        }
    }

    const onDeleteActivity = (activity: DetailedActivity) => {
        setActivityToDelete(activity)
        setIsDeleteModalOpen(true)
    }

    const confirmDeleteActivity = async () => {
        if (!activityToDelete) return
        setDeleting(true)
        try {
            await del(`${endpoints.masters.detailedActivities}/${activityToDelete.id}`)
            addToast({ title: "Actividad eliminada correctamente", color: "success" })
            setIsDeleteModalOpen(false)
            setActivityToDelete(null)
            fetchActivities()
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al eliminar la actividad"
            addToast({ title: message, color: "danger" })
        } finally {
            setDeleting(false)
        }
    }

    const onModifyActivity = (activity: DetailedActivity) => {
        setActivityForModification(activity)
        setIsModificationModalOpen(true)
    }

    const onViewHistory = (activity: DetailedActivity) => {
        setActivityForModification(activity)
        setIsHistoryModalOpen(true)
    }

    const onCreateModification = async (data: CreateBudgetModificationPayload) => {
        setSaving(true)
        try {
            await post(endpoints.masters.budgetModifications, data)
            addToast({ title: "Modificación creada correctamente", color: "success" })
            setIsModificationModalOpen(false)
            setActivityForModification(null)
            fetchActivities()
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al crear la modificación"
            addToast({ title: message, color: "danger" })
        } finally {
            setSaving(false)
        }
    }

    const rowActions: RowAction<DetailedActivity>[] = useMemo(() => {
        const actions: RowAction<DetailedActivity>[] = [
            {
                key: "view",
                label: "Ver Detalles",
                icon: <Eye size={16} />,
                onClick: onViewActivity,
            },
            {
                key: "history",
                label: "Ver Historial",
                icon: <History size={16} />,
                onClick: onViewHistory,
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
        if (canModifyBudget) {
            actions.push({
                key: "modification",
                label: "Modificar Presupuesto",
                icon: <ArrowLeftRight size={16} />,
                color: "warning",
                onClick: onModifyActivity,
            })
        }
        if (canDelete) {
            actions.push({
                key: "delete",
                label: "Eliminar",
                icon: <Trash2 size={16} />,
                color: "danger",
                onClick: onDeleteActivity,
            })
        }
        return actions
    }, [canUpdate, canDelete, canModifyBudget])

    if (error) {
        return (
            <div className="text-center py-8 text-danger">
                <p>{error}</p>
                <Button variant="flat" className="mt-2" onPress={fetchActivities}>
                    Reintentar
                </Button>
            </div>
        )
    }

    return (
        <>
            <DataTable
                items={items}
                columns={detailedActivityColumns}
                isLoading={loading}
                rowActions={rowActions}
                topActions={topActions}
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                searchPlaceholder="Buscar actividades detalladas..."
                ariaLabel="Tabla de actividades detalladas"
                pagination={meta ? {
                    page: page,
                    totalPages: meta.totalPages,
                    onChange: setPage,
                    pageSize: limit,
                    onPageSizeChange: (newLimit) => {
                        setLimit(newLimit)
                        setPage(1)
                    }
                } : undefined}
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
            />

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

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false)
                    setActivityToDelete(null)
                }}
                onConfirm={confirmDeleteActivity}
                title="Eliminar Actividad"
                description={`¿Estás seguro de eliminar la actividad "${activityToDelete?.name}"? Esta acción no se puede deshacer.`}
                isLoading={deleting}
                confirmText="Eliminar"
                confirmColor="danger"
            />

            {activityForModification && (
                <CreateBudgetModificationModal
                    isOpen={isModificationModalOpen}
                    isLoading={saving}
                    detailedActivityId={activityForModification.id}
                    detailedActivityName={activityForModification.name}
                    onClose={() => {
                        setIsModificationModalOpen(false)
                        setActivityForModification(null)
                    }}
                    onSave={onCreateModification}
                />
            )}

            {activityForModification && (
                <BudgetModificationHistoryModal
                    isOpen={isHistoryModalOpen}
                    detailedActivityId={activityForModification.id}
                    detailedActivityName={activityForModification.name}
                    onClose={() => {
                        setIsHistoryModalOpen(false)
                        setActivityForModification(null)
                    }}
                />
            )}
        </>
    )
}
