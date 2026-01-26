"use client"

import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Button,
    Input,
    Spinner,
    Tabs,
    Tab,
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@heroui/react"
import { Link2, Search, RefreshCw, DollarSign, X, Plus, Inbox } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { get, post, del, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { addToast } from "@heroui/toast"
import { DetailedActivityItem } from "@/components/tables/ActivityTable"
import { Pagination, Select, SelectItem, Card, CardBody } from "@heroui/react"

type Props = {
    isOpen: boolean
    positionId: string | null
    positionNumber?: string
    onClose: () => void
    onSuccess?: () => void
}

const formatCurrency = (n: string | number) => {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    }).format(Number(n))
}

// Component for consume popover with input
function ConsumePopover({
    item,
    isLoading,
    onConsume,
}: {
    item: DetailedActivityItem
    isLoading: boolean
    onConsume: (amount: number) => void
}) {
    const [rawAmount, setRawAmount] = useState("")
    const [displayAmount, setDisplayAmount] = useState("")
    const [isOpen, setIsOpen] = useState(false)

    const formatInputCurrency = (value: string) => {
        // Remove non-numeric characters except decimal point
        const numericValue = value.replace(/[^0-9]/g, "")
        if (!numericValue) return { display: "", raw: "" }
        
        const number = parseInt(numericValue, 10)
        const formatted = new Intl.NumberFormat("es-CO").format(number)
        return { display: formatted, raw: numericValue }
    }

    const handleAmountChange = (value: string) => {
        const { display, raw } = formatInputCurrency(value)
        setDisplayAmount(display)
        setRawAmount(raw)
    }

    const handleSubmit = () => {
        const value = parseFloat(rawAmount)
        if (isNaN(value) || value <= 0) {
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
                        <Button
                            size="sm"
                            variant="flat"
                            onPress={() => setIsOpen(false)}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            size="sm"
                            color="success"
                            onPress={handleSubmit}
                            isLoading={isLoading}
                            className="flex-1"
                        >
                            Consumir
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

// Associated Activities Table with consume and dissociate actions
function AssociatedTable({
    items,
    actionLoading,
    consumeLoading,
    onDissociate,
    onConsume,
    emptyMessage,
}: {
    items: DetailedActivityItem[]
    actionLoading: string | null
    consumeLoading: string | null
    onDissociate: (id: string) => void
    onConsume: (id: string, amount: number) => void
    emptyMessage: string
}) {
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-default-400">
                <div className="w-12 h-12 rounded-xl bg-default-100 flex items-center justify-center mb-3">
                    <Inbox size={24} className="opacity-50" />
                </div>
                <p className="text-sm font-medium">{emptyMessage}</p>
            </div>
        )
    }

    return (
        <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto border border-default-200 rounded-lg">
                <table className="w-full min-w-[700px]">
                    <thead>
                        <tr className="bg-default-100">
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-default-600 uppercase">Código</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-default-600 uppercase">Nombre</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-default-600 uppercase">Proyecto</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-default-600 uppercase">PosPre</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-default-600 uppercase">Techo</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-default-600 uppercase">Disponible</th>
                            <th className="px-4 py-2.5 text-center text-xs font-semibold text-default-600 uppercase w-24">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-default-100">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-default-50 transition-colors">
                                <td className="px-4 py-3 text-sm">
                                    <span className="font-mono font-medium">{item.code}</span>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <span className="line-clamp-1 max-w-[200px]">{item.name}</span>
                                </td>
                                <td className="px-4 py-3 text-sm text-default-500">{item.project?.code || "—"}</td>
                                <td className="px-4 py-3 text-sm text-default-500">{item.rubric?.code || "—"}</td>
                                <td className="px-4 py-3 text-sm">{formatCurrency(item.budgetCeiling)}</td>
                                <td className="px-4 py-3 text-sm">
                                    <span className="text-success-600 dark:text-success-400 font-medium">
                                        {formatCurrency(item.balance)}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-center gap-1">
                                        <ConsumePopover
                                            item={item}
                                            isLoading={consumeLoading === item.id}
                                            onConsume={(amount) => onConsume(item.id, amount)}
                                        />
                                        <Button
                                            isIconOnly
                                            size="sm"
                                            variant="light"
                                            color="danger"
                                            isLoading={actionLoading === item.id}
                                            onPress={() => onDissociate(item.id)}
                                            title="Desasociar"
                                        >
                                            {actionLoading !== item.id && <X size={14} />}
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {items.map((item) => (
                    <Card key={item.id} className="bg-default-50 border border-default-200 shadow-none">
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
                                    <ConsumePopover
                                        item={item}
                                        isLoading={consumeLoading === item.id}
                                        onConsume={(amount) => onConsume(item.id, amount)}
                                    />
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="flat"
                                        color="danger"
                                        isLoading={actionLoading === item.id}
                                        onPress={() => onDissociate(item.id)}
                                    >
                                        {actionLoading !== item.id && <X size={14} />}
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
                ))}
            </div>
        </>
    )
}

// Available Activities Table (simple with associate action)
function AvailableTable({
    items,
    actionLoading,
    onAssociate,
    emptyMessage,
}: {
    items: DetailedActivityItem[]
    actionLoading: string | null
    onAssociate: (id: string) => void
    emptyMessage: string
}) {
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-default-400">
                <div className="w-12 h-12 rounded-xl bg-default-100 flex items-center justify-center mb-3">
                    <Inbox size={24} className="opacity-50" />
                </div>
                <p className="text-sm font-medium">{emptyMessage}</p>
            </div>
        )
    }

    return (
        <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto border border-default-200 rounded-lg">
                <table className="w-full min-w-[700px]">
                    <thead>
                        <tr className="bg-default-100">
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-default-600 uppercase">Código</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-default-600 uppercase">Nombre</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-default-600 uppercase">Proyecto</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-default-600 uppercase">PosPre</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-default-600 uppercase">Techo</th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-default-600 uppercase">Disponible</th>
                            <th className="px-4 py-2.5 text-center text-xs font-semibold text-default-600 uppercase w-16"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-default-100">
                        {items.map((item) => (
                            <tr key={item.id} className="hover:bg-default-50 transition-colors">
                                <td className="px-4 py-3 text-sm">
                                    <span className="font-mono font-medium">{item.code}</span>
                                </td>
                                <td className="px-4 py-3 text-sm">
                                    <span className="line-clamp-1 max-w-[200px]">{item.name}</span>
                                </td>
                                <td className="px-4 py-3 text-sm text-default-500">{item.project?.code || "—"}</td>
                                <td className="px-4 py-3 text-sm text-default-500">{item.rubric?.code || "—"}</td>
                                <td className="px-4 py-3 text-sm">{formatCurrency(item.budgetCeiling)}</td>
                                <td className="px-4 py-3 text-sm">
                                    <span className="text-success-600 dark:text-success-400 font-medium">
                                        {formatCurrency(item.balance)}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <Button
                                        isIconOnly
                                        size="sm"
                                        variant="light"
                                        color="primary"
                                        isLoading={actionLoading === item.id}
                                        onPress={() => onAssociate(item.id)}
                                    >
                                        {actionLoading !== item.id && <Plus size={14} />}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
                {items.map((item) => (
                    <Card key={item.id} className="bg-default-50 border border-default-200 shadow-none">
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
                                    isLoading={actionLoading === item.id}
                                    onPress={() => onAssociate(item.id)}
                                    className="flex-shrink-0"
                                >
                                    {actionLoading !== item.id && <Plus size={14} />}
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
                ))}
            </div>
        </>
    )
}

export function ManageCdpActivitiesModal({
    isOpen,
    positionId,
    positionNumber,
    onClose,
    onSuccess,
}: Props) {
    const [loadingAssociated, setLoadingAssociated] = useState(true)
    const [loadingAvailable, setLoadingAvailable] = useState(true)
    const [associated, setAssociated] = useState<DetailedActivityItem[]>([])
    const [available, setAvailable] = useState<DetailedActivityItem[]>([])
    const [searchAssociated, setSearchAssociated] = useState("")
    const [searchAvailable, setSearchAvailable] = useState("")
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [consumeLoading, setConsumeLoading] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<string>("associated")

    // Pagination State
    const [pageAssociated, setPageAssociated] = useState(1)
    const [totalPagesAssociated, setTotalPagesAssociated] = useState(1)
    const [pageAvailable, setPageAvailable] = useState(1)
    const [totalPagesAvailable, setTotalPagesAvailable] = useState(1)
    const [limit, setLimit] = useState(5)

    const fetchAssociated = useCallback(async () => {
        if (!positionId) return
        setLoadingAssociated(true)
        try {
            const res = await get<PaginatedData<DetailedActivityItem>>(
                `${endpoints.financial.cdpPositionDetailedActivities(positionId)}?type=associated&limit=${limit}&page=${pageAssociated}&search=${searchAssociated}`
            )
            setAssociated(res.data)
            setTotalPagesAssociated(res.meta.totalPages)
        } catch (e: any) {
            addToast({ title: "Error al cargar asociadas", description: e.message, color: "danger" })
        } finally {
            setLoadingAssociated(false)
        }
    }, [positionId, searchAssociated, pageAssociated, limit])

    const fetchAvailable = useCallback(async () => {
        if (!positionId) return
        setLoadingAvailable(true)
        try {
            const res = await get<PaginatedData<DetailedActivityItem>>(
                `${endpoints.financial.cdpPositionDetailedActivities(positionId)}?type=available&limit=${limit}&page=${pageAvailable}&search=${searchAvailable}`
            )
            setAvailable(res.data)
            setTotalPagesAvailable(res.meta.totalPages)
        } catch (e: any) {
            addToast({ title: "Error al cargar disponibles", description: e.message, color: "danger" })
        } finally {
            setLoadingAvailable(false)
        }
    }, [positionId, searchAvailable, pageAvailable, limit])

    useEffect(() => {
        if (isOpen && positionId) {
            setSearchAssociated("")
            setSearchAvailable("")
            setPageAssociated(1)
            setPageAvailable(1)
            setActiveTab("associated")
            fetchAssociated()
            fetchAvailable()
        }
    }, [isOpen, positionId])

    useEffect(() => {
        if (isOpen && positionId && activeTab === "associated") {
            fetchAssociated()
        }
    }, [searchAssociated, pageAssociated, limit])

    useEffect(() => {
        if (isOpen && positionId && activeTab === "available") {
            fetchAvailable()
        }
    }, [searchAvailable, pageAvailable, limit])

    const handleAssociate = async (detailedId: string) => {
        if (!positionId) return
        setActionLoading(detailedId)
        try {
            await post(endpoints.financial.cdpPositionDetailedActivities(positionId), { detailedActivityId: detailedId })
            addToast({ title: "Actividad asociada", color: "success" })
            await Promise.all([fetchAssociated(), fetchAvailable()])
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
            await Promise.all([fetchAssociated(), fetchAvailable()])
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
                amount 
            })
            addToast({ title: "Fondos consumidos exitosamente", color: "success" })
            await fetchAssociated()
        } catch (e: any) {
            addToast({ title: "Error al consumir", description: e.message, color: "danger" })
        } finally {
            setConsumeLoading(null)
        }
    }

    const handleClose = () => {
        onSuccess?.()
        onClose()
    }

    const loading = loadingAssociated || loadingAvailable

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={() => handleClose()}
            size="5xl"
            scrollBehavior="inside"
            placement="center"
            classNames={{
                base: "bg-content1 mx-4 my-4 sm:mx-auto max-h-[90vh]",
                header: "border-b border-divider",
                footer: "border-t border-divider",
                body: "p-0",
            }}
        >
            <ModalContent>
                <ModalHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center">
                            <Link2 size={16} className="text-default-500" />
                        </div>
                        <div>
                            <span className="text-base font-semibold">Gestionar Actividades Detalladas</span>
                            {positionNumber && (
                                <p className="text-tiny text-default-400 font-normal">
                                    Posición #{positionNumber}
                                </p>
                            )}
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody className="px-4 sm:px-6 py-4">
                    {loading && associated.length === 0 && available.length === 0 ? (
                        <div className="flex justify-center py-12">
                            <Spinner size="md" />
                        </div>
                    ) : (
                        <Tabs
                            selectedKey={activeTab}
                            onSelectionChange={(key) => setActiveTab(key as string)}
                            variant="underlined"
                            classNames={{
                                tabList: "gap-6",
                                cursor: "w-full bg-primary",
                            }}
                        >
                            <Tab
                                key="associated"
                                title="Asociadas"
                            >
                                <div className="pt-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Input
                                            size="sm"
                                            placeholder="Buscar por código o nombre..."
                                            value={searchAssociated}
                                            onValueChange={setSearchAssociated}
                                            startContent={<Search size={14} className="text-default-400" />}
                                            isClearable
                                            onClear={() => setSearchAssociated("")}
                                            className="max-w-xs"
                                        />
                                        <Button
                                            size="sm"
                                            variant="light"
                                            startContent={<RefreshCw size={14} />}
                                            isLoading={loadingAssociated}
                                            onPress={fetchAssociated}
                                        >
                                            Actualizar
                                        </Button>
                                    </div>
                                    {loadingAssociated ? (
                                        <div className="flex justify-center py-8">
                                            <Spinner size="sm" />
                                        </div>
                                    ) : (
                                        <>
                                            <AssociatedTable
                                                items={associated}
                                                actionLoading={actionLoading}
                                                consumeLoading={consumeLoading}
                                                onDissociate={handleDissociate}
                                                onConsume={handleConsume}
                                                emptyMessage="No hay actividades asociadas"
                                            />
                                            {(totalPagesAssociated > 1) && (
                                                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                                                    <div className="hidden sm:block w-[30%]"></div>
                                                    <Pagination
                                                        isCompact
                                                        showControls
                                                        showShadow
                                                        color="primary"
                                                        page={pageAssociated}
                                                        total={totalPagesAssociated}
                                                        onChange={setPageAssociated}
                                                        size="sm"
                                                    />
                                                    <div className="flex justify-end w-full sm:w-[30%]">
                                                        <Select
                                                            label="Filas"
                                                            size="sm"
                                                            variant="bordered"
                                                            className="max-w-[100px]"
                                                            selectedKeys={[limit.toString()]}
                                                            onChange={(e) => {
                                                                if (e.target.value) {
                                                                    setLimit(Number(e.target.value))
                                                                    setPageAssociated(1)
                                                                    setPageAvailable(1)
                                                                }
                                                            }}
                                                        >
                                                            <SelectItem key="5">5</SelectItem>
                                                            <SelectItem key="10">10</SelectItem>
                                                            <SelectItem key="20">20</SelectItem>
                                                            <SelectItem key="50">50</SelectItem>
                                                        </Select>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </Tab>

                            <Tab
                                key="available"
                                title="Disponibles"
                            >
                                <div className="pt-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Input
                                            size="sm"
                                            placeholder="Buscar por código o nombre..."
                                            value={searchAvailable}
                                            onValueChange={setSearchAvailable}
                                            startContent={<Search size={14} className="text-default-400" />}
                                            isClearable
                                            onClear={() => setSearchAvailable("")}
                                            className="max-w-xs"
                                        />
                                        <Button
                                            size="sm"
                                            variant="light"
                                            startContent={<RefreshCw size={14} />}
                                            isLoading={loadingAvailable}
                                            onPress={fetchAvailable}
                                        >
                                            Actualizar
                                        </Button>
                                    </div>

                                    {loadingAvailable ? (
                                        <div className="flex justify-center py-8">
                                            <Spinner size="sm" />
                                        </div>
                                    ) : (
                                        <>
                                            <AvailableTable
                                                items={available}
                                                actionLoading={actionLoading}
                                                onAssociate={handleAssociate}
                                                emptyMessage="No hay actividades disponibles"
                                            />
                                            {(totalPagesAvailable > 1) && (
                                                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                                                    <div className="hidden sm:block w-[30%]"></div>
                                                    <Pagination
                                                        isCompact
                                                        showControls
                                                        showShadow
                                                        color="primary"
                                                        page={pageAvailable}
                                                        total={totalPagesAvailable}
                                                        onChange={setPageAvailable}
                                                        size="sm"
                                                    />
                                                    <div className="flex justify-end w-full sm:w-[30%]">
                                                        <Select
                                                            label="Filas"
                                                            size="sm"
                                                            variant="bordered"
                                                            className="max-w-[100px]"
                                                            selectedKeys={[limit.toString()]}
                                                            onChange={(e) => {
                                                                if (e.target.value) {
                                                                    setLimit(Number(e.target.value))
                                                                    setPageAssociated(1)
                                                                    setPageAvailable(1)
                                                                }
                                                            }}
                                                        >
                                                            <SelectItem key="5">5</SelectItem>
                                                            <SelectItem key="10">10</SelectItem>
                                                            <SelectItem key="20">20</SelectItem>
                                                            <SelectItem key="50">50</SelectItem>
                                                        </Select>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </Tab>
                        </Tabs>
                    )}
                </ModalBody>

                <ModalFooter>
                    <Button variant="flat" size="sm" onPress={handleClose}>
                        Cerrar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
