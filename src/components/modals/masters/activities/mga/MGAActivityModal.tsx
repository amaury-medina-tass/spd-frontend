"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Button,
    Tabs,
    Tab,
    Input,
    Textarea,
    Pagination,
    Spinner,
    Select,
    SelectItem,
} from "@heroui/react"
import {
    FileText,
    Clock,
    Calendar,
    FolderKanban,
    Package,
    Activity,
    ListTodo,
    Search,
    Info,
    DollarSign,
} from "lucide-react"
import type { MGAActivity, MGAActivityDetailedActivity, MGAActivityDetailedMeta } from "@/types/activity"
import { patch, get } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { addToast } from "@heroui/toast"
import { useDebounce } from "@/hooks/useDebounce"

type TabKey = "info" | "activities"

type Props = {
    isOpen: boolean
    activity: MGAActivity | null
    onClose: () => void
    onSuccess?: () => void
    initialEditMode?: boolean
}

export function MGAActivityModal({
    isOpen,
    activity,
    onClose,
    onSuccess,
    initialEditMode = false,
}: Props) {
    const [selectedTab, setSelectedTab] = useState<TabKey>("info")
    const [isEditMode, setIsEditMode] = useState(false)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        observations: "",
    })

    // Detailed activities state
    const [detailedActivities, setDetailedActivities] = useState<MGAActivityDetailedActivity[]>([])
    const [activityMeta, setActivityMeta] = useState<MGAActivityDetailedMeta | null>(null)
    const [activityPage, setActivityPage] = useState(1)
    const [activityLimit, setActivityLimit] = useState(5)
    const [activitySearch, setActivitySearch] = useState("")
    const [activitySearchInput, setActivitySearchInput] = useState("")
    const [loadingActivities, setLoadingActivities] = useState(false)

    const debouncedSearch = useDebounce(activitySearchInput, 400)

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const formatDateTime = (dateStr: string) => {
        if (!dateStr) return "N/A"
        return new Date(dateStr).toLocaleString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    // Fetch detailed activities with pagination/search
    const fetchDetailedActivities = useCallback(async () => {
        if (!activity?.id) return

        setLoadingActivities(true)
        try {
            const params = new URLSearchParams({
                page: activityPage.toString(),
                limit: activityLimit.toString(),
            })
            if (activitySearch.trim()) {
                params.set("search", activitySearch.trim())
            }

            const result = await get<MGAActivity>(
                `${endpoints.masters.mgaActivities}/${activity.id}?${params}`
            )

            setDetailedActivities(result.detailedActivities?.data || [])
            setActivityMeta(result.detailedActivities?.meta || null)
        } catch (error) {
            console.error("Error fetching detailed activities:", error)
        } finally {
            setLoadingActivities(false)
        }
    }, [activity?.id, activityPage, activityLimit, activitySearch])

    // Sync debounced search
    useEffect(() => {
        setActivitySearch(debouncedSearch)
        setActivityPage(1)
    }, [debouncedSearch])

    // Fetch when tab changes to activities or pagination/search changes
    useEffect(() => {
        if (isOpen && selectedTab === "activities" && activity?.id) {
            fetchDetailedActivities()
        }
    }, [isOpen, selectedTab, fetchDetailedActivities, activity?.id])

    // Reset form when activity changes
    useEffect(() => {
        if (activity) {
            setFormData({
                name: activity.name || "",
                observations: activity.observations || "",
            })
            setIsEditMode(initialEditMode)
        }
    }, [activity, initialEditMode])

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen && activity) {
            setSelectedTab("info")
            setActivityPage(1)
            setActivitySearch("")
            setActivitySearchInput("")
            // Initialize from activity prop if available
            if (activity.detailedActivities) {
                setDetailedActivities(activity.detailedActivities.data || [])
                setActivityMeta(activity.detailedActivities.meta || null)
            }
        }
    }, [isOpen, activity])

    if (!activity) return null

    const handleSave = async () => {
        setSaving(true)
        try {
            await patch(`${endpoints.masters.mgaActivities}/${activity.id}`, {
                name: formData.name,
                observations: formData.observations || null,
            })
            addToast({ title: "Actividad MGA actualizada", color: "success" })
            setIsEditMode(false)
            onSuccess?.()
        } catch (e: any) {
            addToast({ title: "Error al actualizar", description: e.message, color: "danger" })
        } finally {
            setSaving(false)
        }
    }

    const handleClose = () => {
        setIsEditMode(false)
        onClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={() => handleClose()}
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
                            <Activity size={18} className="text-default-600" />
                        </div>
                        <div>
                            <span className="text-lg font-semibold text-foreground">
                                Actividad MGA: {activity.code}
                            </span>
                            <p className="text-tiny text-default-400 font-normal">
                                {isEditMode ? "Editar actividad MGA" : "Detalle de la actividad MGA"}
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
                                {/* Información Básica */}
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    {/* Nombre */}
                                    <div className="col-span-2">
                                        {isEditMode ? (
                                            <Input
                                                label="Nombre"
                                                value={formData.name}
                                                onValueChange={(val) => setFormData({ ...formData, name: val })}
                                                isRequired
                                            />
                                        ) : (
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <FileText size={16} className="text-default-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                        Nombre
                                                    </span>
                                                    <p className="text-small font-medium text-foreground">
                                                        {activity.name}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Proyecto */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <FolderKanban size={16} className="text-default-500" />
                                        </div>
                                        <div>
                                            <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                Proyecto
                                            </span>
                                            <p className="text-small font-medium text-foreground">
                                                {activity.project?.code} - {activity.project?.name}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Producto */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Package size={16} className="text-default-500" />
                                        </div>
                                        <div>
                                            <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                Producto
                                            </span>
                                            <p className="text-small font-medium text-foreground">
                                                {activity.product?.productCode} - {activity.product?.productName}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Valor Total */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <DollarSign size={16} className="text-default-500" />
                                        </div>
                                        <div>
                                            <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                Valor Total
                                            </span>
                                            <p className="text-small font-semibold text-foreground">
                                                {formatCurrency(activity.value ?? 0)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Saldo */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <DollarSign size={16} className="text-success-500" />
                                        </div>
                                        <div>
                                            <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                Saldo
                                            </span>
                                            <p className="text-small font-semibold text-success-600 dark:text-success-400">
                                                {formatCurrency(activity.balance ?? 0)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Cantidad Actividades Detalladas */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <ListTodo size={16} className="text-default-500" />
                                        </div>
                                        <div>
                                            <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                Actividades Detalladas
                                            </span>
                                            <p className="text-small text-foreground">
                                                {activity.detailedActivitiesCount ?? 0}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Observaciones */}
                                    <div className="col-span-2">
                                        {isEditMode ? (
                                            <Textarea
                                                label="Observaciones"
                                                value={formData.observations}
                                                onValueChange={(val) => setFormData({ ...formData, observations: val })}
                                                minRows={2}
                                            />
                                        ) : (
                                            <div className="flex items-start gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <FileText size={16} className="text-default-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                        Observaciones
                                                    </span>
                                                    <p className="text-small text-foreground">
                                                        {activity.observations || "Sin observaciones"}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Fechas de Registro y Actividad */}
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    {/* Fecha de Actividad */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Calendar size={16} className="text-default-500" />
                                        </div>
                                        <div>
                                            <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                Fecha de Actividad
                                            </span>
                                            <p className="text-small text-foreground">
                                                {activity.activityDate ? new Date(activity.activityDate).toLocaleDateString("es-CO") : "N/A"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Fecha de Creación */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Clock size={16} className="text-default-500" />
                                        </div>
                                        <div>
                                            <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                Creación
                                            </span>
                                            <p className="text-small text-foreground">
                                                {formatDateTime(activity.createAt)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Última Actualización */}
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Clock size={16} className="text-default-500" />
                                        </div>
                                        <div>
                                            <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                Actualización
                                            </span>
                                            <p className="text-small text-foreground">
                                                {formatDateTime(activity.updateAt)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Tab>

                        <Tab
                            key="activities"
                            title={
                                <div className="flex items-center gap-2">
                                    <ListTodo size={16} />
                                    <span>Actividades Detalladas</span>
                                    {activityMeta && (
                                        <span className="text-tiny text-default-400">
                                            ({activityMeta.total})
                                        </span>
                                    )}
                                </div>
                            }
                        >
                            <div className="space-y-4 pt-4">
                                {/* Header with search */}
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <span className="text-small text-default-500">Saldo Total:</span>
                                        <span className="text-small font-semibold text-success-600 dark:text-success-400 ml-2">
                                            {formatCurrency(activity.balance ?? 0)}
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
                                        <div className="col-span-4">Actividad</div>
                                        <div className="col-span-3 text-right">Valor</div>
                                        <div className="col-span-3 text-right">Saldo</div>
                                    </div>

                                    {/* Table Body */}
                                    <div className="min-h-[200px]">
                                        {loadingActivities ? (
                                            <div className="flex items-center justify-center py-8">
                                                <Spinner size="sm" />
                                            </div>
                                        ) : detailedActivities.length > 0 ? (
                                            <div className="divide-y divide-default-100 dark:divide-default-700/50">
                                                {detailedActivities.map((da) => (
                                                    <div
                                                        key={da.id}
                                                        className="grid grid-cols-12 gap-2 px-3 py-2.5 text-small hover:bg-default-50 dark:hover:bg-default-100/30 transition-colors"
                                                    >
                                                        <div className="col-span-2 font-mono text-primary-600 dark:text-primary-400 truncate">
                                                            {da.activityCode}
                                                        </div>
                                                        <div className="col-span-4 text-foreground truncate" title={da.activityName}>
                                                            {da.activityName}
                                                        </div>
                                                        <div className="col-span-3 text-right font-medium">
                                                            {formatCurrency(da.value)}
                                                        </div>
                                                        <div className="col-span-3 text-right font-medium text-success-600 dark:text-success-400">
                                                            {formatCurrency(da.balance)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center py-8 text-default-400">
                                                <p className="text-small">
                                                    {activitySearch ? "Sin resultados para la búsqueda" : "Sin actividades detalladas asociadas"}
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
                    {isEditMode ? (
                        <>
                            <Button variant="flat" onPress={() => setIsEditMode(false)} isDisabled={saving}>
                                Cancelar
                            </Button>
                            <Button color="primary" onPress={handleSave} isLoading={saving}>
                                Guardar
                            </Button>
                        </>
                    ) : (
                        <Button variant="flat" onPress={handleClose}>
                            Cerrar
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
