"use client"

import { useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction } from "@/components/tables/DataTable"
import { usePermissions } from "@/hooks/usePermissions"
import { useDataTable } from "@/hooks/useDataTable"
import { get } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Eye, Link2, Plus, Pencil } from "lucide-react"
import { buildBaseTopActions } from "@/components/tables/tableActions"
import { addToast } from "@heroui/toast"
import type { MGAActivity } from "@/types/activity"
import { getErrorMessage } from "@/lib/error-codes"
import { MGAActivityModal } from "@/components/modals/masters/activities/mga/MGAActivityModal"
import { CreateMGAActivityModal } from "@/components/modals/masters/activities/mga/CreateMGAActivityModal"
import { ManageDetailedActivitiesModal } from "@/components/modals/masters/activities/mga/ManageDetailedActivitiesModal"
import { getMGAActivities } from "@/services/masters/mga-activities.service"
import { formatCurrency } from "@/lib/format-utils"
import { TableErrorView, AccessDeniedView } from "@/components/tables/TableStatusViews"

// Columns for MGA Activities
const mgaActivityColumns: ColumnDef<MGAActivity>[] = [
    { key: "code", label: "Código", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    {
        key: "activityDate",
        label: "Fecha",
        sortable: true,
        render: (activity) => activity.activityDate ? new Date(activity.activityDate).toLocaleDateString("es-CO") : "N/A",
    },
    {
        key: "value",
        label: "Valor",
        sortable: true,
        render: (activity) => (
            <span className="font-medium whitespace-nowrap">
                {activity.value ? formatCurrency(activity.value) : formatCurrency(0)}
            </span>
        ),
    },
    {
        key: "balance",
        label: "Saldo",
        sortable: true,
        render: (activity) => (
            <span className={`font-medium whitespace-nowrap ${(activity.balance || 0) > 0 ? "text-success-600 dark:text-success-400" : "text-default-500"
                }`}>
                {activity.balance ? formatCurrency(activity.balance) : formatCurrency(0)}
            </span>
        ),
    },
    {
        key: "project.code",
        label: "Cód. Proyecto",
        sortable: false,
        render: (activity) => activity.project?.code ?? "N/A",
    },
    {
        key: "project.name",
        label: "Proyecto",
        sortable: false,
        render: (activity) => activity.project?.name ?? "N/A",
    },
    {
        key: "product.productCode",
        label: "Cód. Producto",
        sortable: false,
        render: (activity) => activity.product?.productCode ?? "N/A",
    },
    {
        key: "product.productName",
        label: "Producto",
        sortable: false,
        render: (activity) => activity.product?.productName ?? "N/A",
    },
    {
        key: "observations",
        label: "Observaciones",
        sortable: false,
        render: (activity) => (
            <span className="line-clamp-1 max-w-[200px]" title={activity.observations || ""}>
                {activity.observations || "—"}
            </span>
        ),
    },
    {
        key: "detailedActivitiesCount",
        label: "Act. Detalladas",
        sortable: false,
        render: (activity) => (
            <span className="inline-flex items-center justify-center min-w-[24px] px-2 py-0.5 text-xs font-medium rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                {activity.detailedActivitiesCount ?? 0}
            </span>
        ),
    },
]

export function MGAActivitiesTab() {
    // Permissions
    const { canRead, canCreate, canUpdate } = usePermissions("/masters/activities")

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isManageModalOpen, setIsManageModalOpen] = useState(false)
    const [selectedActivity, setSelectedActivity] = useState<MGAActivity | null>(null)
    const [isEditMode, setIsEditMode] = useState(false)

    const {
        items, loading, error, searchInput, setSearchInput,
        sortDescriptor, setSortDescriptor, fetchData, exporting, handleExport, paginationProps,
    } = useDataTable<MGAActivity>({
        fetchFn: (qs) => getMGAActivities(qs),
        defaultSort: { column: "code", direction: "ascending" },
        defaultLimit: 5,
        errorMessage: "Error al cargar actividades MGA",
        exportConfig: { system: "SPD", type: "ACTIVITIES" },
        sortFieldMap: { "project.name": "project", "product.productName": "product" },
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

    // View handler
    const onViewActivity = async (activity: MGAActivity) => {
        try {
            // Fetch detailed single activity
            const fullActivity = await get<MGAActivity>(`${endpoints.masters.mgaActivities}/${activity.id}`)
            setSelectedActivity(fullActivity)
            setIsModalOpen(true)
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al obtener detalles de la actividad"
            addToast({ title: message, color: "danger" })
        }
    }

    const rowActions: RowAction<MGAActivity>[] = useMemo(() => {
        const actions: RowAction<MGAActivity>[] = [
            {
                key: "view",
                label: "Ver Detalles",
                icon: <Eye size={16} />,
                onClick: (item) => void onViewActivity(item),
            },
        ]

        if (canUpdate) {
            actions.push(
                {
                    key: "edit",
                    label: "Editar",
                    icon: <Pencil size={16} />,
                    onClick: (activity) => {
                        void (async () => {
                            try {
                                const fullActivity = await get<MGAActivity>(`${endpoints.masters.mgaActivities}/${activity.id}`)
                                setSelectedActivity(fullActivity)
                                setIsEditMode(true)
                                setIsModalOpen(true)
                            } catch (e: any) {
                                const errorCode = e.data?.errors?.code
                                const message = errorCode ? getErrorMessage(errorCode) : "Error al obtener detalles de la actividad"
                                addToast({ title: message, color: "danger" })
                            }
                        })()
                    },
                },
                {
                    key: "manage",
                    label: "Gestionar Actividades",
                    icon: <Link2 size={16} />,
                    onClick: (activity) => {
                        setSelectedActivity(activity)
                        setIsManageModalOpen(true)
                    },
                }
            )
        }

        return actions
    }, [canUpdate])

    if (error) return <TableErrorView error={error} onRetry={fetchData} />
    if (!canRead) return <AccessDeniedView />

    return (
        <>
            <DataTable
                items={items}
                columns={mgaActivityColumns}
                isLoading={loading}
                rowActions={rowActions}
                topActions={topActions}
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                searchPlaceholder="Buscar actividades MGA..."
                ariaLabel="Tabla de actividades MGA"
                pagination={paginationProps}
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
            />

            <MGAActivityModal
                isOpen={isModalOpen}
                activity={selectedActivity}
                onClose={() => {
                    setIsModalOpen(false)
                    setSelectedActivity(null)
                    setIsEditMode(false)
                }}
                onSuccess={fetchData}
                initialEditMode={isEditMode}
            />

            <CreateMGAActivityModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchData}
            />

            <ManageDetailedActivitiesModal
                isOpen={isManageModalOpen}
                mgaActivityId={selectedActivity?.id || null}
                mgaActivityCode={selectedActivity?.code}
                onClose={() => {
                    setIsManageModalOpen(false)
                    setSelectedActivity(null)
                }}
                onSuccess={fetchData}
            />
        </>
    )
}
