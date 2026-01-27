"use client"

import { useCallback, useEffect, useState } from "react"
import {
    Button,
    Card,
    CardBody
} from "@heroui/react"
import { get, post, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Plus } from "lucide-react"
import { ResourceManager } from "@/components/common/ResourceManager"
import { ColumnDef } from "@/components/tables/CleanTable"
import { addToast } from "@heroui/toast"
import { useDebounce } from "@/hooks/useDebounce"

interface Props {
    mgaActivityId: string | null
}

export type DetailedActivity = {
    id: string
    code: string
    name: string
    budgetCeiling: string
    balance: string
    rubric?: { code: string }
    project?: { code: string }
}

const formatCurrency = (n: string | number) => {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    }).format(Number(n))
}

const columns: ColumnDef[] = [
    { name: "CÓDIGO", uid: "code" },
    { name: "NOMBRE", uid: "name" },
    { name: "PROYECTO", uid: "projectCode" },
    { name: "POSPRE", uid: "rubricCode" },
    { name: "TECHO", uid: "budgetCeiling" },
    { name: "DISPONIBLE", uid: "balance" },
    { name: "", uid: "actions", align: "end" },
]

export function AvailableDetailedActivitiesTab({ mgaActivityId }: Props) {
    const [activities, setActivities] = useState<DetailedActivity[]>([])
    const [meta, setMeta] = useState<{
        total: number
        page: number
        limit: number
        totalPages: number
    } | null>(null)

    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(5)
    const [search, setSearch] = useState("")
    const debouncedSearch = useDebounce(search, 500)
    
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const fetchActivities = useCallback(async () => {
        if (!mgaActivityId) return
        setLoading(true)
        try {
            const res = await get<PaginatedData<DetailedActivity>>(
                `${endpoints.masters.mgaActivityDetailedActivities(mgaActivityId)}?type=available&limit=${limit}&page=${page}&search=${debouncedSearch}`
            )
            setActivities(res.data)
            setMeta(res.meta)
        } catch (e: any) {
            addToast({ title: "Error al cargar disponibles", description: e.message, color: "danger" })
        } finally {
            setLoading(false)
        }
    }, [mgaActivityId, page, limit, debouncedSearch])

    useEffect(() => {
        if (mgaActivityId) {
            fetchActivities()
        }
    }, [mgaActivityId, fetchActivities])

    // Reset pagination when search changes
    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    const handleAssociate = async (detailedId: string) => {
        if (!mgaActivityId) return
        setActionLoading(detailedId)
        try {
            await post(endpoints.masters.mgaActivityDetailedRelations(mgaActivityId), { detailedActivityId: detailedId })
            addToast({ title: "Actividad asociada", color: "success" })
            fetchActivities()
        } catch (e: any) {
            addToast({ title: "Error", description: e.message, color: "danger" })
        } finally {
            setActionLoading(null)
        }
    }

    const renderCell = (item: DetailedActivity, columnKey: React.Key) => {
        const isLoading = actionLoading === item.id

        switch (columnKey) {
            case "code":
                return <span className="font-mono font-medium text-small">{item.code}</span>
            case "name":
                return <span className="line-clamp-1 max-w-[200px] text-small" title={item.name}>{item.name}</span>
            case "projectCode":
                return <span className="text-default-500 text-small">{item.project?.code || "—"}</span>
            case "rubricCode":
                return <span className="text-default-500 text-small">{item.rubric?.code || "—"}</span>
            case "budgetCeiling":
                return <span className="text-small">{formatCurrency(item.budgetCeiling)}</span>
            case "balance":
                return <span className="text-success-600 dark:text-success-400 font-medium text-small">{formatCurrency(item.balance)}</span>
            case "actions":
                return (
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="primary"
                        isLoading={isLoading}
                        onPress={() => handleAssociate(item.id)}
                    >
                        {!isLoading && <Plus size={16} />}
                    </Button>
                )
            default:
                return null
        }
    }

    const renderMobileItem = (item: DetailedActivity) => {
        const isLoading = actionLoading === item.id
        return (
            <Card className="bg-default-50 border border-default-200 shadow-none">
                <CardBody className="p-3 gap-2">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <span className="font-mono text-xs font-semibold text-primary-600 dark:text-primary-400">
                                {item.code}
                            </span>
                            <p className="text-sm font-medium text-foreground line-clamp-2 mt-0.5">
                                {item.name}
                            </p>
                        </div>
                        <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            color="primary"
                            isLoading={isLoading}
                            onPress={() => handleAssociate(item.id)}
                            className="flex-shrink-0"
                        >
                            {!isLoading && <Plus size={14} />}
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                            <span className="text-tiny text-default-400">Proyecto</span>
                            <p className="text-xs font-medium">{item.project?.code || "—"}</p>
                        </div>
                        <div>
                            <span className="text-tiny text-default-400">Pos. Presupuestal</span>
                            <p className="text-xs font-medium">{item.rubric?.code || "—"}</p>
                        </div>
                        <div>
                            <span className="text-tiny text-default-400">Techo</span>
                            <p className="text-xs font-medium">{formatCurrency(item.budgetCeiling)}</p>
                        </div>
                        <div>
                            <span className="text-tiny text-default-400">Disponible</span>
                            <p className="text-xs font-medium text-success-600 dark:text-success-400">
                                {formatCurrency(item.balance)}
                            </p>
                        </div>
                    </div>
                </CardBody>
            </Card>
        )
    }

    return (
        <ResourceManager
            search={search}
            onSearchChange={setSearch}
            onRefresh={fetchActivities}
            refreshLoading={loading}
            columns={columns}
            items={activities}
            renderCell={renderCell}
            renderMobileItem={renderMobileItem}
            isLoading={loading}
            page={page}
            totalPages={meta?.totalPages}
            onPageChange={setPage}
            limit={limit}
            onLimitChange={(l) => {
                setLimit(l)
                setPage(1)
            }}
            emptyContent={
                <div className="flex flex-col items-center justify-center py-12 text-default-400">
                    <p className="text-sm font-medium">No hay actividades disponibles</p>
                </div>
            }
        />
    )
}
