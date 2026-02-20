"use client"

import { useCallback, useEffect, useState } from "react"
import {
    Button,
    Input,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Card,
    CardBody
} from "@heroui/react"
import { get, post, del, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { CdpDetailedActivity } from "@/types/cdp"
import { DollarSign, Plus, X } from "lucide-react"
import { ResourceManager } from "@/components/common/ResourceManager"
import { ColumnDef } from "@/components/tables/CleanTable"
import { addToast } from "@heroui/toast"
import { useDebounce } from "@/hooks/useDebounce"
import { formatCurrency } from "@/lib/format-utils"
import { ActivityMobileDetails } from "@/components/common/ActivityMobileDetails"

function ConsumePopover({
    item,
    isLoading,
    onConsume,
}: Readonly<{
    item: CdpDetailedActivity
    isLoading: boolean
    onConsume: (amount: number) => void
}>) {
    const [rawAmount, setRawAmount] = useState("")
    const [displayAmount, setDisplayAmount] = useState("")
    const [isOpen, setIsOpen] = useState(false)

    const formatInputCurrency = (value: string) => {
        const numericValue = value.replaceAll(/\D/g, "")
        if (!numericValue) return { display: "", raw: "" }
        const number = Number.parseInt(numericValue, 10)
        const formatted = new Intl.NumberFormat("es-CO").format(number)
        return { display: formatted, raw: numericValue }
    }

    const handleAmountChange = (value: string) => {
        const { display, raw } = formatInputCurrency(value)
        setDisplayAmount(display)
        setRawAmount(raw)
    }

    const handleSubmit = () => {
        const value = Number.parseFloat(rawAmount)
        if (Number.isNaN(value) || value <= 0) {
            addToast({ title: "Error", description: "Ingrese un monto válido mayor a 0", color: "danger" })
            return
        }
        onConsume(value)
        setRawAmount("")
        setDisplayAmount("")
        setIsOpen(false)
    }

    return (
        <Popover isOpen={isOpen} onOpenChange={setIsOpen} placement="left">
            <PopoverTrigger>
                <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    color="success"
                    isLoading={isLoading}
                    title="Consumir fondos"
                >
                    {!isLoading && <DollarSign size={14} />}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="p-3 w-64">
                <div className="space-y-3">
                    <div>
                        <p className="text-sm font-medium">Consumir de: {item.code}</p>
                        <p className="text-xs text-default-400">
                            Disponible: {formatCurrency(item.balance)}
                        </p>
                    </div>
                    <Input
                        size="sm"
                        type="text"
                        inputMode="numeric"
                        label="Monto a consumir"
                        placeholder="0"
                        value={displayAmount}
                        onValueChange={handleAmountChange}
                        startContent={<span className="text-default-400 text-sm">$</span>}
                    />
                    <div className="flex gap-2">
                        <Button size="sm" variant="flat" onPress={() => setIsOpen(false)} className="flex-1">
                            Cancelar
                        </Button>
                        <Button size="sm" color="success" onPress={handleSubmit} isLoading={isLoading} className="flex-1">
                            Consumir
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

const MODE_CONFIG = {
    available: {
        type: "available",
        errorMsg: "Error al cargar disponibles",
        emptyMsg: "No hay actividades disponibles",
    },
    associated: {
        type: "associated",
        errorMsg: "Error al cargar asociadas",
        emptyMsg: "No hay actividades asociadas",
    },
} as const

interface Props {
    positionId: string | null
    mode: "available" | "associated"
}

export function CdpActivitiesTab({ positionId, mode }: Readonly<Props>) {
    const config = MODE_CONFIG[mode]

    const [activities, setActivities] = useState<CdpDetailedActivity[]>([])
    const [meta, setMeta] = useState<{
        total: number; page: number; limit: number; totalPages: number
    } | null>(null)

    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(5)
    const [search, setSearch] = useState("")
    const debouncedSearch = useDebounce(search, 500)

    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [consumeLoading, setConsumeLoading] = useState<string | null>(null)

    const fetchActivities = useCallback(async () => {
        if (!positionId) return
        setLoading(true)
        try {
            const res = await get<PaginatedData<CdpDetailedActivity>>(
                `${endpoints.financial.cdpPositionDetailedActivities(positionId)}?type=${config.type}&limit=${limit}&page=${page}&search=${debouncedSearch}`
            )
            setActivities(res.data)
            setMeta(res.meta)
        } catch (e: any) {
            addToast({ title: config.errorMsg, description: e.message, color: "danger" })
        } finally {
            setLoading(false)
        }
    }, [positionId, page, limit, debouncedSearch, config])

    useEffect(() => {
        if (positionId) fetchActivities()
    }, [positionId, fetchActivities])

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

    const handleDissociate = async (detailedId: string) => {
        if (!positionId) return
        setActionLoading(detailedId)
        try {
            await del(endpoints.financial.cdpPositionDetailedActivitiesRemove(positionId, detailedId))
            addToast({ title: "Actividad desasociada", color: "success" })
            fetchActivities()
        } catch (e: any) {
            addToast({ title: "Error", description: e.message, color: "danger" })
        } finally {
            setActionLoading(null)
        }
    }

    const handleConsume = async (detailedId: string, amount: number) => {
        if (!positionId) return
        setConsumeLoading(detailedId)
        try {
            await post(endpoints.financial.cdpPositionConsume(positionId), {
                detailedActivityId: detailedId,
                amount,
            })
            addToast({ title: "Fondos consumidos exitosamente", color: "success" })
            fetchActivities()
        } catch (e: any) {
            addToast({ title: "Error al consumir", description: e.message, color: "danger" })
        } finally {
            setConsumeLoading(null)
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
                return mode === "available" ? (
                    <div className="flex items-center justify-center gap-1">
                        <Button
                            isIconOnly size="sm" variant="light" color="primary"
                            isLoading={actionLoading === item.id}
                            onPress={() => handleAssociate(item.id)}
                            title="Asociar"
                        >
                            {actionLoading !== item.id && <Plus size={14} />}
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-1">
                        <ConsumePopover
                            item={item}
                            isLoading={consumeLoading === item.id}
                            onConsume={(amount) => handleConsume(item.id, amount)}
                        />
                        <Button
                            isIconOnly size="sm" variant="light" color="danger"
                            isLoading={actionLoading === item.id}
                            onPress={() => handleDissociate(item.id)}
                            title="Desasociar"
                        >
                            {actionLoading !== item.id && <X size={14} />}
                        </Button>
                    </div>
                )
            default:
                return null
        }
    }

    const renderMobileActions = (item: CdpDetailedActivity) =>
        mode === "available" ? (
            <Button
                isIconOnly size="sm" variant="flat" color="primary"
                isLoading={actionLoading === item.id}
                onPress={() => handleAssociate(item.id)}
                className="flex-shrink-0"
            >
                {actionLoading !== item.id && <Plus size={14} />}
            </Button>
        ) : (
            <>
                <ConsumePopover
                    item={item}
                    isLoading={consumeLoading === item.id}
                    onConsume={(amount) => handleConsume(item.id, amount)}
                />
                <Button
                    isIconOnly size="sm" variant="flat" color="danger"
                    isLoading={actionLoading === item.id}
                    onPress={() => handleDissociate(item.id)}
                    className="flex-shrink-0"
                >
                    {actionLoading !== item.id && <X size={14} />}
                </Button>
            </>
        )

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
                        {renderMobileActions(item)}
                    </div>
                </div>
                <ActivityMobileDetails
                    projectCode={item.project?.code}
                    rubricCode={item.rubric?.code}
                    budgetCeiling={item.budgetCeiling}
                    balance={item.balance}
                />
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
                    {config.emptyMsg}
                </div>
            }
        />
    )
}
