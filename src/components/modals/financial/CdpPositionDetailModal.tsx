"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Button,
    Divider,
    Tabs,
    Tab,
    Input,
    Pagination,
    Spinner,
    Select,
    SelectItem,
} from "@heroui/react"
import {
    FileText,
    DollarSign,
    ClipboardList,
    Receipt,
    Hash,
    Briefcase,
    BookOpen,
    Search,
    Info,
    Wallet,
} from "lucide-react"
import type { CdpPositionDetail, ConsumedActivity, ConsumedActivityMeta } from "@/types/cdp"
import { get } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { useDebounce } from "@/hooks/useDebounce"

type TabKey = "info" | "funding"

export function CdpPositionDetailModal({
    isOpen,
    positionId,
    initialData,
    onClose,
}: {
    isOpen: boolean
    positionId: string | null
    initialData: CdpPositionDetail | null
    onClose: () => void
}) {
    const [selectedTab, setSelectedTab] = useState<TabKey>("info")

    // Activities state
    const [activities, setActivities] = useState<ConsumedActivity[]>([])
    const [activityMeta, setActivityMeta] = useState<ConsumedActivityMeta | null>(null)
    const [activityPage, setActivityPage] = useState(1)
    const [activityLimit, setActivityLimit] = useState(5)
    const [activitySearch, setActivitySearch] = useState("")
    const [activitySearchInput, setActivitySearchInput] = useState("")
    const [loadingActivities, setLoadingActivities] = useState(false)

    const debouncedSearch = useDebounce(activitySearchInput, 400)

    // Position data (from initial data or refreshed)
    const [position, setPosition] = useState<CdpPositionDetail | null>(initialData)

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    // Fetch activities with pagination/search
    const fetchActivities = useCallback(async () => {
        if (!positionId) return

        setLoadingActivities(true)
        try {
            const params = new URLSearchParams({
                activityPage: activityPage.toString(),
                activityLimit: activityLimit.toString(),
            })
            if (activitySearch.trim()) {
                params.set("activitySearch", activitySearch.trim())
            }

            const result = await get<CdpPositionDetail>(
                `${endpoints.financial.cdpPositionDetail(positionId)}?${params}`
            )

            setPosition(result)
            setActivities(result.consumedByActivity.data)
            setActivityMeta(result.consumedByActivity.meta)
        } catch (error) {
            console.error("Error fetching activities:", error)
        } finally {
            setLoadingActivities(false)
        }
    }, [positionId, activityPage, activityLimit, activitySearch])

    // Sync debounced search
    useEffect(() => {
        setActivitySearch(debouncedSearch)
        setActivityPage(1)
    }, [debouncedSearch])

    // Fetch when tab changes to funding or pagination/search changes
    useEffect(() => {
        if (isOpen && selectedTab === "funding" && positionId) {
            fetchActivities()
        }
    }, [isOpen, selectedTab, fetchActivities, positionId])

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setPosition(initialData)
            setSelectedTab("info")
            setActivityPage(1)
            setActivitySearch("")
            setActivitySearchInput("")
            if (initialData) {
                setActivities(initialData.consumedByActivity.data)
                setActivityMeta(initialData.consumedByActivity.meta)
            }
        }
    }, [isOpen, initialData])

    if (!position) return null

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={() => onClose()}
            size="3xl"
            scrollBehavior="inside"
            classNames={{
                base: "bg-content1",
                header: "border-b border-divider",
                footer: "border-t border-divider",
            }}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-default-100 flex items-center justify-center">
                            <Receipt size={18} className="text-default-600" />
                        </div>
                        <div>
                            <span className="text-lg font-semibold text-foreground">
                                Posición {position.positionNumber}
                            </span>
                            <p className="text-tiny text-default-400 font-normal">
                                CDP {position.cdpNumber} • {position.projectCode}
                            </p>
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody className="py-4">
                    <Tabs
                        selectedKey={selectedTab}
                        onSelectionChange={(key) => setSelectedTab(key as TabKey)}
                        variant="underlined"
                        classNames={{
                            tabList: "gap-6",
                            cursor: "bg-primary",
                            tab: "px-0 h-10",
                        }}
                    >
                        <Tab
                            key="info"
                            title={
                                <div className="flex items-center gap-2">
                                    <Info size={16} />
                                    <span>Información General</span>
                                </div>
                            }
                        >
                            <div className="space-y-6 pt-4">
                                {/* CDP Info Section */}
                                <div>
                                    <h3 className="text-sm font-semibold text-default-500 uppercase tracking-wider mb-3">
                                        Información del CDP
                                    </h3>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                        {/* CDP Number */}
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Hash size={16} className="text-default-500" />
                                            </div>
                                            <div>
                                                <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                    Número CDP
                                                </span>
                                                <p className="text-medium font-semibold text-foreground">
                                                    {position.cdpNumber}
                                                </p>
                                            </div>
                                        </div>

                                        {/* CDP Total Value */}
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <DollarSign size={16} className="text-default-500" />
                                            </div>
                                            <div>
                                                <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                    Valor Total CDP
                                                </span>
                                                <p className="text-medium font-semibold text-foreground">
                                                    {formatCurrency(position.cdpTotalValue)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Divider />

                                {/* Project Info Section */}
                                <div>
                                    <h3 className="text-sm font-semibold text-default-500 uppercase tracking-wider mb-3">
                                        Información del Proyecto
                                    </h3>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                        {/* Project Code */}
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Briefcase size={16} className="text-default-500" />
                                            </div>
                                            <div>
                                                <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                    Código Proyecto
                                                </span>
                                                <p className="text-small font-medium text-foreground">
                                                    {position.projectCode}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Rubric Code */}
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <BookOpen size={16} className="text-default-500" />
                                            </div>
                                            <div>
                                                <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                    Posición Presupuestal
                                                </span>
                                                <p className="text-small font-medium text-foreground font-mono">
                                                    {position.rubricCode}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Divider />

                                {/* Position & Funding Info Section */}
                                <div>
                                    <h3 className="text-sm font-semibold text-default-500 uppercase tracking-wider mb-3">
                                        Detalle de la Posición
                                    </h3>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                        {/* Position Value */}
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <DollarSign size={16} className="text-default-500" />
                                            </div>
                                            <div>
                                                <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                    Valor Posición
                                                </span>
                                                <p className="text-medium font-semibold text-foreground">
                                                    {formatCurrency(position.positionValue)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Need Code */}
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <ClipboardList size={16} className="text-default-500" />
                                            </div>
                                            <div>
                                                <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                    Código Necesidad
                                                </span>
                                                <p className="text-small font-medium text-foreground">
                                                    {position.needCode}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Funding Source Name */}
                                        {position.fundingSourceName && (
                                            <div className="flex items-start gap-3 col-span-2">
                                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <FileText size={16} className="text-default-500" />
                                                </div>
                                                <div>
                                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                        Origen Presupuesto
                                                    </span>
                                                    <p className="text-small font-medium text-foreground">
                                                        {position.fundingSourceName}
                                                    </p>
                                                    {position.fundingSourceCode && (
                                                        <p className="text-tiny text-default-400 font-mono mt-1">
                                                            Fondo: {position.fundingSourceCode}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Divider />

                                {/* Observations */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-default-500" />
                                        <span className="text-small font-medium text-foreground">
                                            Observaciones
                                        </span>
                                    </div>
                                    <p className="text-small text-default-600 leading-relaxed bg-default-50 dark:bg-default-100/50 rounded-lg p-3">
                                        {position.observations || "Sin observaciones"}
                                    </p>
                                </div>
                            </div>
                        </Tab>

                        <Tab
                            key="funding"
                            title={
                                <div className="flex items-center gap-2">
                                    <Wallet size={16} />
                                    <span>Fuentes de Financiación</span>
                                    {activityMeta && (
                                        <span className="text-tiny text-default-400">
                                            ({activityMeta.total})
                                        </span>
                                    )}
                                </div>
                            }
                        >
                            <div className="space-y-4 pt-4">
                                {/* Header with total and search */}
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <span className="text-small text-default-500">Saldo CDP (Pos. {position.positionNumber}):</span>
                                        <span className="text-small font-semibold text-warning-600 dark:text-warning-400 ml-2">
                                            {formatCurrency(position.totalConsumed)}
                                        </span>
                                    </div>
                                    <Input
                                        size="sm"
                                        placeholder="Buscar actividad..."
                                        value={activitySearchInput}
                                        onValueChange={setActivitySearchInput}
                                        startContent={<Search size={16} className="text-default-400" />}
                                        className="w-64"
                                        classNames={{
                                            inputWrapper: "h-9",
                                        }}
                                    />
                                </div>

                                {/* Activities Table */}
                                <div className="border border-default-200 dark:border-default-700 rounded-lg overflow-hidden">
                                    {/* Table Header */}
                                    <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-default-100 dark:bg-default-50 text-tiny font-semibold text-default-500 uppercase tracking-wide">
                                        <div className="col-span-2">Código</div>
                                        <div className="col-span-5">Actividad</div>
                                        <div className="col-span-2 text-right">Asignado</div>
                                        <div className="col-span-3 text-right">Saldo</div>
                                    </div>

                                    {/* Table Body */}
                                    <div className="min-h-[200px]">
                                        {loadingActivities ? (
                                            <div className="flex items-center justify-center py-8">
                                                <Spinner size="sm" />
                                            </div>
                                        ) : activities.length > 0 ? (
                                            <div className="divide-y divide-default-100 dark:divide-default-700/50">
                                                {activities.map((activity) => (
                                                    <div
                                                        key={activity.id}
                                                        className="grid grid-cols-12 gap-2 px-3 py-2.5 text-small hover:bg-default-50 dark:hover:bg-default-100/30 transition-colors"
                                                    >
                                                        <div className="col-span-2 font-mono text-primary-600 dark:text-primary-400 truncate">
                                                            {activity.activityCode}
                                                        </div>
                                                        <div className="col-span-5 text-foreground truncate" title={activity.activityName}>
                                                            {activity.activityName}
                                                        </div>
                                                        <div className="col-span-2 text-right font-medium">
                                                            {formatCurrency(activity.assignedValue)}
                                                        </div>
                                                        <div className="col-span-3 text-right font-medium text-success-600 dark:text-success-400">
                                                            {formatCurrency(activity.balance)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center py-8 text-default-400">
                                                <p className="text-small">
                                                    {activitySearch ? "Sin resultados para la búsqueda" : "Sin actividades asociadas"}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Pagination & Limit */}
                                {activityMeta && (
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                                        <span className="text-tiny text-default-400">
                                            Total: {activityMeta.total}
                                        </span>

                                        <div className="flex items-center gap-4">
                                            {activityMeta.totalPages > 1 && (
                                                <Pagination
                                                    size="sm"
                                                    total={activityMeta.totalPages}
                                                    page={activityPage}
                                                    onChange={setActivityPage}
                                                    showControls
                                                />
                                            )}

                                            <div className="flex items-center gap-2">
                                                <span className="text-tiny text-default-400">Filas:</span>
                                                <Select
                                                    size="sm"
                                                    selectedKeys={[activityLimit.toString()]}
                                                    onChange={(e) => {
                                                        setActivityLimit(Number(e.target.value))
                                                        setActivityPage(1)
                                                    }}
                                                    className="w-20"
                                                    aria-label="Límite de filas"
                                                >
                                                    <SelectItem key="5" textValue="5">5</SelectItem>
                                                    <SelectItem key="10" textValue="10">10</SelectItem>
                                                    <SelectItem key="20" textValue="20">20</SelectItem>
                                                    <SelectItem key="50" textValue="50">50</SelectItem>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Tab>
                    </Tabs>
                </ModalBody>

                <ModalFooter>
                    <Button variant="flat" onPress={onClose}>
                        Cerrar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
