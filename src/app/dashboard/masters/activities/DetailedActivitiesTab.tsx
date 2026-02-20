"use client"

import { useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction } from "@/components/tables/DataTable"
import { usePermissions } from "@/hooks/usePermissions"
import { useDataTable } from "@/hooks/useDataTable"
import { get, post, patch, del, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Eye, Pencil, Plus, Trash2, ArrowLeftRight, History } from "lucide-react"
import { buildBaseTopActions } from "@/components/tables/tableActions"
import { addToast } from "@heroui/toast"
import type { DetailedActivity, FullDetailedActivity } from "@/types/activity"
import { getErrorMessage } from "@/lib/error-codes"
import { DetailedActivityModal } from "@/components/modals/masters/activities/detailed/DetailedActivityModal"
import { CreateDetailedActivityModal, CreateDetailedActivityPayload } from "@/components/modals/masters/activities/detailed/CreateDetailedActivityModal"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { CreateBudgetModificationModal, CreateBudgetModificationPayload } from "@/components/modals/masters/activities/detailed/CreateBudgetModificationModal"
import { BudgetModificationHistoryModal } from "@/components/modals/masters/activities/detailed/BudgetModificationHistoryModal"
import { formatCurrency } from "@/lib/format-utils"
import { TableErrorView, AccessDeniedView } from "@/components/tables/TableStatusViews"

// Columns for Detailed Activities
const detailedActivityColumns: ColumnDef<DetailedActivity>[] = [
    { key: "code", label: "Código", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    {
        key: "activityDate",
        label: "Fecha",
        sortable: true,
        render: (activity) => activity.activityDate ? new Date(activity.activityDate).toLocaleDateString("es-CO") : "N/A",
    },
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
        render: (activity) => formatCurrency(activity.budgetCeiling),
    },
    {
        key: "balance",
        label: "Saldo",
        sortable: true,
        render: (activity) => formatCurrency(activity.balance),
    },
    { key: "cpc", label: "CPC", sortable: true },
]

export function DetailedActivitiesTab() {
    const { canRead, canCreate, canUpdate, canDelete, hasPermission } = usePermissions("/masters/activities")

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

    const {
        items, loading, error, searchInput, setSearchInput,
        sortDescriptor, setSortDescriptor, fetchData, exporting, handleExport, paginationProps,
    } = useDataTable<DetailedActivity>({
        fetchFn: (qs) => get<PaginatedData<DetailedActivity>>(`${endpoints.masters.detailedActivities}?${qs}`),
        defaultSort: { column: "code", direction: "ascending" },
        defaultLimit: 5,
        errorMessage: "Error al cargar actividades detalladas",
        exportConfig: { system: "SPD", type: "ACTIVITIES" },
        useErrorCodes: true,
    })

    const topActions: TopAction[] = useMemo(() => {
        const actions = buildBaseTopActions(fetchData, handleExport, exporting, "Exportar Actividades")
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
    }, [fetchData, canCreate, exporting, handleExport])

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
            fetchData()
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
            fetchData()
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
            fetchData()
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
            fetchData()
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
                onClick: (item) => { onViewActivity(item) },
            },
            {
                key: "history",
                label: "Ver Historial",
                icon: <History size={16} />,
                onClick: (item) => { onViewHistory(item) },
            },
        ]
        if (canUpdate) {
            actions.push({
                key: "edit",
                label: "Editar",
                icon: <Pencil size={16} />,
                onClick: (item) => { onEditActivity(item) },
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

    if (error) return <TableErrorView error={error} onRetry={fetchData} />
    if (!canRead) return <AccessDeniedView />

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
                pagination={paginationProps}
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
