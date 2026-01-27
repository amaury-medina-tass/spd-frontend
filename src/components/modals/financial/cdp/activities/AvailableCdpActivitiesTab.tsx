"use client"

import { useCallback, useEffect, useState } from "react"
import {
    Button,
    Card,
    CardBody
} from "@heroui/react"
import { get, post, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { CdpDetailedActivity } from "@/types/cdp"
import { Plus } from "lucide-react"
import { ResourceManager } from "@/components/common/ResourceManager"
import { ColumnDef } from "@/components/tables/CleanTable"
import { addToast } from "@heroui/toast"
import { useDebounce } from "@/hooks/useDebounce"

interface Props {
    positionId: string | null
}

const formatCurrency = (n: string | number) => {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    }).format(Number(n))
}

export function AvailableCdpActivitiesTab({ positionId }: Props) {
    const [activities, setActivities] = useState<CdpDetailedActivity[]>([])
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
        if (!positionId) return
        setLoading(true)
        try {
            const res = await get<PaginatedData<CdpDetailedActivity>>(
                `${endpoints.financial.cdpPositionDetailedActivities(positionId)}?type=available&limit=${limit}&page=${page}&search=${debouncedSearch}`
            )
            setActivities(res.data)
            setMeta(res.meta)
        } catch (e: any) {
            addToast({ title: "Error al cargar disponibles", description: e.message, color: "danger" })
        } finally {
            setLoading(false)
        }
    }, [positionId, page, limit, debouncedSearch])

    useEffect(() => {
        if (positionId) {
            fetchActivities()
        }
    }, [positionId, fetchActivities])

    // Reset pagination when search changes
    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    const handleAssociate = async (detailedId: string) => {
        if (!positionId) return
        setActionLoading(detailedId)
        try {
            await post(endpoints.financial.cdpPositionDetailedActivities(positionId), { detailedActivityId: detailedId })
            addToast({ title: "Actividad asociada", color: "success" })
            fetchActivities()
        } catch (e: any) {
            addToast({ title: "Error", description: e.message, color: "danger" })
        } finally {
            setActionLoading(null)
        }
    }

    const columns: ColumnDef[] = [
        { name: "CÓDIGO", uid: "code" },
        { name: "NOMBRE", uid: "name" },
        { name: "PROYECTO", uid: "project" },
        { name: "POSPRE", uid: "pospre" },
        { name: "TECHO", uid: "ceiling" },
        { name: "DISPONIBLE", uid: "available" },
        { name: "ACCIONES", uid: "actions", align: "center" },
    ]

    const renderCell = (item: CdpDetailedActivity, columnKey: React.Key) => {
        switch (columnKey) {
            case "code":
                return <span className="font-mono font-medium">{item.code}</span>
            case "name":
                return <span className="line-clamp-1 max-w-[200px]">{item.name}</span>
            case "project":
                return <span className="text-default-500 text-small">{item.project?.code || "—"}</span>
            case "pospre":
                return <span className="text-default-500 text-small">{item.rubric?.code || "—"}</span>
            case "ceiling":
                return <span className="text-small">{formatCurrency(item.budgetCeiling)}</span>
            case "available":
                return (
                    <span className="text-success-600 dark:text-success-400 font-medium text-small">
                        {formatCurrency(item.balance)}
                    </span>
                )
            case "actions":
                return (
                    <div className="flex items-center justify-center gap-1">
                        <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="primary"
                            isLoading={actionLoading === item.id}
                            onPress={() => handleAssociate(item.id)}
                            title="Asociar"
                        >
                            {actionLoading !== item.id && <Plus size={14} />}
                        </Button>
                    </div>
                )
            default:
                return null
        }
    }

    const renderMobileItem = (item: CdpDetailedActivity) => (
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
                    <div className="flex gap-1 flex-shrink-0">
                        <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            color="primary"
                            isLoading={actionLoading === item.id}
                            onPress={() => handleAssociate(item.id)}
                            className="flex-shrink-0"
                        >
                            {actionLoading !== item.id && <Plus size={14} />}
                        </Button>
                    </div>
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
                <div className="py-8 text-center text-default-400">
                    No hay actividades disponibles
                </div>
            }
        />
    )
}
