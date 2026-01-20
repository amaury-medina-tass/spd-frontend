"use client"

import { Button, SortDescriptor } from "@heroui/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction } from "@/components/tables/DataTable"
import { useDebounce } from "@/hooks/useDebounce"
import { get, PaginatedData, PaginationMeta } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { RefreshCw, Eye, Link2, Plus } from "lucide-react"
import { addToast } from "@heroui/toast"
import type { MGAActivity } from "@/types/activity"
import { getErrorMessage } from "@/lib/error-codes"
import { MGAActivityModal } from "@/components/modals/masters/activities/mga/MGAActivityModal"
import { CreateMGAActivityModal } from "@/components/modals/masters/activities/mga/CreateMGAActivityModal"
import { ManageDetailedActivitiesModal } from "@/components/modals/masters/activities/mga/ManageDetailedActivitiesModal"

// Columns for MGA Activities
const mgaActivityColumns: ColumnDef<MGAActivity>[] = [
    { key: "code", label: "Código", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    {
        key: "project.name",
        label: "Proyecto",
        sortable: false,
        render: (activity) => activity.project?.name ?? "N/A",
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
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isManageModalOpen, setIsManageModalOpen] = useState(false)
    const [selectedActivity, setSelectedActivity] = useState<MGAActivity | null>(null)

    // Table State
    const [items, setItems] = useState<MGAActivity[]>([])
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
                let sortBy = sortDescriptor.column as string
                if (sortBy === "project.name") sortBy = "project"
                if (sortBy === "product.productName") sortBy = "product"

                params.set("sortBy", sortBy)
                params.set("sortOrder", sortDescriptor.direction === "ascending" ? "ASC" : "DESC")
            }

            const result = await get<PaginatedData<MGAActivity>>(`${endpoints.masters.mgaActivities}?${params}`)
            setItems(result.data)
            setMeta(result.meta)
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : (e.message ?? "Error al cargar actividades MGA")
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

    const topActions: TopAction[] = useMemo(() => [
        {
            key: "refresh",
            label: "Actualizar",
            icon: <RefreshCw size={16} />,
            color: "default",
            onClick: fetchActivities,
        },
        {
            key: "create",
            label: "Crear",
            icon: <Plus size={16} />,
            color: "primary",
            onClick: () => setIsCreateModalOpen(true),
        },
    ], [fetchActivities])

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

    const rowActions: RowAction<MGAActivity>[] = useMemo(() => [
        {
            key: "view",
            label: "Ver Detalles",
            icon: <Eye size={16} />,
            onClick: onViewActivity,
        },
        {
            key: "manage",
            label: "Gestionar Actividades",
            icon: <Link2 size={16} />,
            onClick: (activity) => {
                setSelectedActivity(activity)
                setIsManageModalOpen(true)
            },
        },
    ], [])

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
                columns={mgaActivityColumns}
                isLoading={loading}
                rowActions={rowActions}
                topActions={topActions}
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                searchPlaceholder="Buscar actividades MGA..."
                ariaLabel="Tabla de actividades MGA"
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

            <MGAActivityModal
                isOpen={isModalOpen}
                activity={selectedActivity}
                onClose={() => {
                    setIsModalOpen(false)
                    setSelectedActivity(null)
                }}
            />

            <CreateMGAActivityModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchActivities}
            />

            <ManageDetailedActivitiesModal
                isOpen={isManageModalOpen}
                mgaActivityId={selectedActivity?.id || null}
                mgaActivityCode={selectedActivity?.code}
                onClose={() => {
                    setIsManageModalOpen(false)
                    setSelectedActivity(null)
                }}
                onSuccess={fetchActivities}
            />
        </>
    )
}
