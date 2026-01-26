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
    Card,
    CardBody,
    Chip,
} from "@heroui/react"
import { Link2, Search, RefreshCw, Plus, X } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { get, post, del, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { addToast } from "@heroui/toast"
import { CleanTable, ColumnDef } from "@/components/tables/CleanTable"

export type DetailedActivity = {
    id: string
    code: string
    name: string
    budgetCeiling: string
    balance: string
    rubric?: { code: string }
    project?: { code: string }
}

type Props = {
    isOpen: boolean
    mgaActivityId: string | null
    mgaActivityCode?: string
    onClose: () => void
    onSuccess?: () => void
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

export function ManageDetailedActivitiesModal({
    isOpen,
    mgaActivityId,
    mgaActivityCode,
    onClose,
    onSuccess,
}: Props) {
    const [loadingAssociated, setLoadingAssociated] = useState(true)
    const [loadingAvailable, setLoadingAvailable] = useState(true)
    const [associated, setAssociated] = useState<DetailedActivity[]>([])
    const [available, setAvailable] = useState<DetailedActivity[]>([])
    const [searchAssociated, setSearchAssociated] = useState("")
    const [searchAvailable, setSearchAvailable] = useState("")
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<string>("associated")

    // Pagination State
    const [pageAssociated, setPageAssociated] = useState(1)
    const [totalPagesAssociated, setTotalPagesAssociated] = useState(1)
    const [pageAvailable, setPageAvailable] = useState(1)
    const [totalPagesAvailable, setTotalPagesAvailable] = useState(1)
    const [limit, setLimit] = useState(5)

    const fetchAssociated = useCallback(async () => {
        if (!mgaActivityId) return
        setLoadingAssociated(true)
        try {
            const res = await get<PaginatedData<DetailedActivity>>(
                `${endpoints.masters.mgaActivityDetailedActivities(mgaActivityId)}?type=associated&limit=${limit}&page=${pageAssociated}&search=${searchAssociated}`
            )
            setAssociated(res.data)
            setTotalPagesAssociated(res.meta.totalPages)
        } catch (e: any) {
            addToast({ title: "Error al cargar asociadas", description: e.message, color: "danger" })
        } finally {
            setLoadingAssociated(false)
        }
    }, [mgaActivityId, searchAssociated, pageAssociated, limit])

    const fetchAvailable = useCallback(async () => {
        if (!mgaActivityId) return
        setLoadingAvailable(true)
        try {
            const res = await get<PaginatedData<DetailedActivity>>(
                `${endpoints.masters.mgaActivityDetailedActivities(mgaActivityId)}?type=available&limit=${limit}&page=${pageAvailable}&search=${searchAvailable}`
            )
            setAvailable(res.data)
            setTotalPagesAvailable(res.meta.totalPages)
        } catch (e: any) {
            addToast({ title: "Error al cargar disponibles", description: e.message, color: "danger" })
        } finally {
            setLoadingAvailable(false)
        }
    }, [mgaActivityId, searchAvailable, pageAvailable, limit])

    useEffect(() => {
        if (isOpen && mgaActivityId) {
            setSearchAssociated("")
            setSearchAvailable("")
            setPageAssociated(1)
            setPageAvailable(1)
            setActiveTab("associated")
            fetchAssociated()
            fetchAvailable()
        }
    }, [isOpen, mgaActivityId])

    useEffect(() => {
        if (isOpen && mgaActivityId && activeTab === "associated") {
            fetchAssociated()
        }
    }, [searchAssociated, pageAssociated, limit])

    useEffect(() => {
        if (isOpen && mgaActivityId && activeTab === "available") {
            fetchAvailable()
        }
    }, [searchAvailable, pageAvailable, limit])

    const handleAssociate = async (detailedId: string) => {
        if (!mgaActivityId) return
        setActionLoading(detailedId)
        try {
            await post(endpoints.masters.mgaActivityDetailedRelations(mgaActivityId), { detailedActivityId: detailedId })
            addToast({ title: "Actividad asociada", color: "success" })
            await Promise.all([fetchAssociated(), fetchAvailable()])
        } catch (e: any) {
            addToast({ title: "Error", description: e.message, color: "danger" })
        } finally {
            setActionLoading(null)
        }
    }

    const handleDissociate = async (detailedId: string) => {
        if (!mgaActivityId) return
        setActionLoading(detailedId)
        try {
            await del(endpoints.masters.mgaActivityDetailedRelationsRemove(mgaActivityId, detailedId))
            addToast({ title: "Actividad desasociada", color: "success" })
            await Promise.all([fetchAssociated(), fetchAvailable()])
        } catch (e: any) {
            addToast({ title: "Error", description: e.message, color: "danger" })
        } finally {
            setActionLoading(null)
        }
    }

    const handleClose = () => {
        onSuccess?.()
        onClose()
    }

    const formatCurrency = (n: string | number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(Number(n))
    }

    const renderCell = (item: DetailedActivity, columnKey: React.Key, actionType: "associate" | "dissociate") => {
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
                        color={actionType === "dissociate" ? "danger" : "primary"}
                        isLoading={isLoading}
                        onPress={() => actionType === "dissociate" ? handleDissociate(item.id) : handleAssociate(item.id)}
                    >
                        {!isLoading && (actionType === "dissociate" ? <X size={16} /> : <Plus size={16} />)}
                    </Button>
                )
            default:
                return null
        }
    }

    const renderMobileItem = (item: DetailedActivity, actionType: "associate" | "dissociate") => {
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
                            color={actionType === "dissociate" ? "danger" : "primary"}
                            isLoading={isLoading}
                            onPress={() => actionType === "dissociate" ? handleDissociate(item.id) : handleAssociate(item.id)}
                            className="flex-shrink-0"
                        >
                            {!isLoading && (actionType === "dissociate" ? <X size={14} /> : <Plus size={14} />)}
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

    const loading = loadingAssociated || loadingAvailable

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={() => handleClose()}
            size="4xl"
            scrollBehavior="inside"
            classNames={{
                base: "bg-content1",
                header: "border-b border-divider",
                footer: "border-t border-divider",
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
                            {mgaActivityCode && (
                                <p className="text-tiny text-default-400 font-normal">
                                    {mgaActivityCode}
                                </p>
                            )}
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody className="py-4">
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
                            <Tab key="associated" title="Asociadas">
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
                                    <CleanTable
                                        columns={columns}
                                        items={associated}
                                        renderCell={(item, key) => renderCell(item, key, "dissociate")}
                                        renderMobileItem={(item) => renderMobileItem(item, "dissociate")}
                                        isLoading={loadingAssociated}
                                        emptyContent={
                                            <div className="flex flex-col items-center justify-center py-12 text-default-400">
                                                <p className="text-sm font-medium">No hay actividades asociadas</p>
                                            </div>
                                        }
                                        page={pageAssociated}
                                        totalPages={totalPagesAssociated}
                                        onPageChange={setPageAssociated}
                                        limit={limit}
                                        onLimitChange={(l) => {
                                            setLimit(l)
                                            setPageAssociated(1)
                                            setPageAvailable(1)
                                        }}
                                    />
                                </div>
                            </Tab>

                            <Tab key="available" title="Disponibles">
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
                                    <CleanTable
                                        columns={columns}
                                        items={available}
                                        renderCell={(item, key) => renderCell(item, key, "associate")}
                                        renderMobileItem={(item) => renderMobileItem(item, "associate")}
                                        isLoading={loadingAvailable}
                                        emptyContent={
                                            <div className="flex flex-col items-center justify-center py-12 text-default-400">
                                                <p className="text-sm font-medium">No hay actividades disponibles</p>
                                            </div>
                                        }
                                        page={pageAvailable}
                                        totalPages={totalPagesAvailable}
                                        onPageChange={setPageAvailable}
                                        limit={limit}
                                        onLimitChange={(l) => {
                                            setLimit(l)
                                            setPageAssociated(1)
                                            setPageAvailable(1)
                                        }}
                                    />
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
