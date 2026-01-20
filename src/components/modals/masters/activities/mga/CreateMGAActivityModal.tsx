"use client"

import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Button,
    Input,
    Textarea,
    Autocomplete,
    AutocompleteItem,
    Switch,
    DatePicker,
    DateValue
} from "@heroui/react"
import { Activity, Plus, Search } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { get, post } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { addToast } from "@heroui/toast"
import type { RelatedProject } from "@/types/activity"
import { today, getLocalTimeZone } from "@internationalized/date"

// Types for Select Responses
type GenericSelectResponse<T> = {
    data: T[]
    meta: {
        total: number
        limit: number
        offset: number
        hasMore: boolean
    }
}

type Product = {
    id: string
    productCode: string
    indicatorName: string
}

type DetailedActivitySelect = {
    id: string
    code: string
    name: string
    balance: string
    project?: {
        code: string
    }
    rubric?: {
        code: string
    }
}

type CreateMGAActivityPayload = {
    code: string
    name: string
    observations: string
    activityDate: string
    projectId: string
    productId: string
    detailedActivityIds?: string[]
}

type Props = {
    isOpen: boolean
    isLoading?: boolean
    onClose: () => void
    onSuccess: () => void
}

export function CreateMGAActivityModal({
    isOpen,
    onClose,
    onSuccess,
}: Props) {
    // Form State
    const [code, setCode] = useState("")
    const [name, setName] = useState("")
    const [observations, setObservations] = useState("")
    const [date, setDate] = useState<DateValue | null>(null)
    const [projectId, setProjectId] = useState("")
    const [productId, setProductId] = useState("")
    const [associateDetailed, setAssociateDetailed] = useState(false)
    const [selectedDetailedIds, setSelectedDetailedIds] = useState<Set<string>>(new Set())

    // Loading States
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Data States
    const [projects, setProjects] = useState<RelatedProject[]>([])
    const [loadingProjects, setLoadingProjects] = useState(false)
    const [projectSearch, setProjectSearch] = useState("")
    const debouncedProjectSearch = useDebounce(projectSearch, 300)

    const [products, setProducts] = useState<Product[]>([])
    const [loadingProducts, setLoadingProducts] = useState(false)
    const [productSearch, setProductSearch] = useState("")
    const debouncedProductSearch = useDebounce(productSearch, 300)

    const [detailedActivities, setDetailedActivities] = useState<DetailedActivitySelect[]>([])
    const [loadingDetailed, setLoadingDetailed] = useState(false)
    const [detailedSearch, setDetailedSearch] = useState("")
    const debouncedDetailedSearch = useDebounce(detailedSearch, 300)

    // Pagination State for Detailed Activities
    const [detailedOffset, setDetailedOffset] = useState(0)
    const [hasMoreDetailed, setHasMoreDetailed] = useState(false)
    const DETAILED_LIMIT = 20

    // Reset form
    useEffect(() => {
        if (isOpen) {
            setCode("")
            setName("")
            setObservations("")
            setDate(today(getLocalTimeZone()))
            setProjectId("")
            setProductId("")
            setProjectSearch("")
            setProductSearch("")
            setAssociateDetailed(false)
            setSelectedDetailedIds(new Set())
            setDetailedActivities([])
            setDetailedOffset(0)
            setHasMoreDetailed(false)
        }
    }, [isOpen])

    // --- Fetchers ---

    const fetchProjects = useCallback(async (search: string = "") => {
        setLoadingProjects(true)
        try {
            const params = new URLSearchParams({ limit: "20" })
            if (search) params.set("search", search)
            const res = await get<GenericSelectResponse<RelatedProject>>(`${endpoints.financial.projectsSelect}?${params}`)
            setProjects(res.data)
        } catch (e) {
            console.error("Error fetching projects", e)
        } finally {
            setLoadingProjects(false)
        }
    }, [])

    const fetchProducts = useCallback(async (search: string = "") => {
        setLoadingProducts(true)
        try {
            const params = new URLSearchParams({ limit: "20" })
            if (search) params.set("search", search)
            const res = await get<GenericSelectResponse<Product>>(`${endpoints.masters.productsSelect}?${params}`)
            setProducts(res.data)
        } catch (e) {
            console.error("Error fetching products", e)
        } finally {
            setLoadingProducts(false)
        }
    }, [])

    const fetchDetailedActivities = useCallback(async (search: string, offset: number, isLoadMore: boolean) => {
        if (!isLoadMore) setLoadingDetailed(true)
        try {
            const params = new URLSearchParams({
                limit: String(DETAILED_LIMIT),
                offset: String(offset)
            })
            if (search) params.set("search", search)
            const res = await get<GenericSelectResponse<DetailedActivitySelect>>(`${endpoints.masters.detailedActivitiesSelect}?${params}`)

            if (isLoadMore) {
                setDetailedActivities(prev => {
                    // Avoid duplicates if any
                    const existingIds = new Set(prev.map(i => i.id))
                    const newItems = res.data.filter(i => !existingIds.has(i.id))
                    return [...prev, ...newItems]
                })
            } else {
                setDetailedActivities(res.data)
            }

            // If we got fewer items than requested, we've reached the end
            setHasMoreDetailed(res.data.length === DETAILED_LIMIT)
        } catch (e) {
            console.error("Error fetching detailed activities", e)
        } finally {
            setLoadingDetailed(false)
        }
    }, [])

    // --- Effects ---

    useEffect(() => {
        if (isOpen) {
            fetchProjects(debouncedProjectSearch)
        }
    }, [debouncedProjectSearch, fetchProjects, isOpen])

    useEffect(() => {
        if (isOpen) {
            fetchProducts(debouncedProductSearch)
        }
    }, [debouncedProductSearch, fetchProducts, isOpen])

    // Initial fetch or search change for detailed activities
    useEffect(() => {
        if (associateDetailed) {
            setDetailedOffset(0)
            fetchDetailedActivities(debouncedDetailedSearch, 0, false)
        }
    }, [debouncedDetailedSearch, associateDetailed, fetchDetailedActivities])

    // --- Handlers ---

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget
        if (scrollHeight - scrollTop <= clientHeight + 50) { // Near bottom threshold
            if (!loadingDetailed && hasMoreDetailed) {
                const newOffset = detailedOffset + DETAILED_LIMIT
                setDetailedOffset(newOffset)
                fetchDetailedActivities(debouncedDetailedSearch, newOffset, true)
            }
        }
    }

    const toggleSelection = (id: string) => {
        const newSet = new Set(selectedDetailedIds)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setSelectedDetailedIds(newSet)
    }

    const handleSave = async () => {
        setIsSubmitting(true)
        try {
            const payload: CreateMGAActivityPayload = {
                code,
                name,
                observations,
                activityDate: date ? date.toDate(getLocalTimeZone()).toISOString() : new Date().toISOString(),
                projectId,
                productId,
                detailedActivityIds: associateDetailed ? Array.from(selectedDetailedIds) : []
            }

            await post(endpoints.masters.mgaActivities, payload)
            addToast({ title: "Actividad MGA creada correctamente", color: "success" })
            onSuccess()
            onClose()
        } catch (e: any) {
            addToast({
                title: "Error al crear actividad MGA",
                description: e.message || "Ocurrió un error inesperado",
                color: "danger"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatCurrency = (amount: string | number) => {
        if (!amount && amount !== 0) return "N/A"
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(Number(amount))
    }

    const isValid = code && name && date && projectId && productId

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={() => onClose()}
            size="2xl"
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
                        <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Activity size={18} className="text-primary" />
                        </div>
                        <div>
                            <span className="text-lg font-semibold text-foreground">
                                Nueva Actividad MGA
                            </span>
                            <p className="text-tiny text-default-400 font-normal">
                                Registre una nueva actividad MGA en el sistema
                            </p>
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody className="py-5">
                    <div className="flex flex-col gap-5">
                        {/* Basic Info */}
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Código"
                                placeholder="Ej: MGA-2024-001"
                                value={code}
                                onValueChange={setCode}
                                isRequired
                                labelPlacement="outside"
                            />
                            <DatePicker
                                label="Fecha de Actividad"
                                value={date}
                                onChange={setDate}
                                isRequired
                                labelPlacement="outside"
                            />
                        </div>

                        <Input
                            label="Nombre"
                            placeholder="Nombre de la actividad"
                            value={name}
                            onValueChange={setName}
                            isRequired
                            labelPlacement="outside"
                        />

                        {/* Selects */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Autocomplete
                                label="Proyecto"
                                placeholder="Buscar proyecto"
                                labelPlacement="outside"
                                isRequired
                                isLoading={loadingProjects}
                                selectedKey={projectId}
                                onSelectionChange={(k) => {
                                    const key = String(k)
                                    setProjectId(key)
                                    const selected = projects.find(p => p.id === key)
                                    if (selected) {
                                        setProjectSearch(selected.code)
                                    }
                                }}
                                onInputChange={setProjectSearch}
                                inputValue={projectSearch}
                            >
                                {projects.map((p) => (
                                    <AutocompleteItem key={p.id} textValue={p.code}>
                                        <div className="flex flex-col">
                                            <span className="text-small font-bold">{p.code}</span>
                                            <span className="text-tiny text-default-500">{p.name}</span>
                                        </div>
                                    </AutocompleteItem>
                                ))}
                            </Autocomplete>

                            <Autocomplete
                                label="Producto"
                                placeholder="Buscar producto"
                                labelPlacement="outside"
                                isRequired
                                isLoading={loadingProducts}
                                selectedKey={productId}
                                onSelectionChange={(k) => {
                                    const key = String(k)
                                    setProductId(key)
                                    const selected = products.find(p => p.id === key)
                                    if (selected) {
                                        setProductSearch(selected.productCode)
                                    }
                                }}
                                onInputChange={setProductSearch}
                                inputValue={productSearch}
                            >
                                {products.map((p) => (
                                    <AutocompleteItem key={p.id} textValue={p.productCode}>
                                        <div className="flex flex-col">
                                            <span className="text-small font-bold">{p.productCode}</span>
                                            <span className="text-tiny text-default-500 whitespace-normal line-clamp-2">
                                                {p.indicatorName}
                                            </span>
                                        </div>
                                    </AutocompleteItem>
                                ))}
                            </Autocomplete>
                        </div>

                        <Textarea
                            label="Observaciones"
                            placeholder="Ingrese observaciones adicionales"
                            value={observations}
                            onValueChange={setObservations}
                            labelPlacement="outside"
                            minRows={2}
                        />

                        {/* Detailed Activities Association */}
                        <div className="border-t border-divider pt-4 mt-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-small font-semibold">
                                    Asociar Actividades Detalladas
                                </span>
                                <Switch
                                    isSelected={associateDetailed}
                                    onValueChange={setAssociateDetailed}
                                    size="sm"
                                />
                            </div>
                            <p className="text-tiny text-default-400 mb-4">
                                Puede asociar actividades detalladas posteriormente. No es obligatorio hacerlo en este momento.
                            </p>

                            {associateDetailed && (
                                <div className="space-y-4 animate-appearance-in">
                                    <Input
                                        startContent={<span className="text-default-400"><Search size={16} /></span>}
                                        placeholder="Buscar actividad detallada por nombre o código..."
                                        value={detailedSearch}
                                        onValueChange={setDetailedSearch}
                                        isClearable
                                        onClear={() => setDetailedSearch("")}
                                    />

                                    <div
                                        className="h-[300px] overflow-y-auto border border-default-200 rounded-lg p-2 space-y-2 bg-default-50"
                                        onScroll={handleScroll}
                                    >
                                        {detailedActivities.length === 0 && !loadingDetailed ? (
                                            <div className="flex justify-center p-4">
                                                <span className="text-tiny text-default-400">No se encontraron actividades</span>
                                            </div>
                                        ) : (
                                            detailedActivities.map((item) => {
                                                const isSelected = selectedDetailedIds.has(item.id)
                                                return (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => toggleSelection(item.id)}
                                                        className={`
                                                            cursor-pointer p-3 rounded-lg border transition-all duration-200
                                                            ${isSelected
                                                                ? "bg-primary-50 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800"
                                                                : "bg-background border-default-200 hover:border-default-300"
                                                            }
                                                        `}
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-small font-bold ${isSelected ? "text-primary-600" : "text-foreground"}`}>
                                                                    {item.code}
                                                                </span>
                                                                <span className="text-small text-default-500 line-clamp-1">
                                                                    {item.name}
                                                                </span>
                                                            </div>
                                                            {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                                                        </div>

                                                        <div className="flex flex-wrap gap-2 text-tiny text-default-400 mb-2">
                                                            <div className="bg-default-100 px-2 py-0.5 rounded-sm">
                                                                Proy: {item.project?.code || "N/A"}
                                                            </div>
                                                            <div className="bg-default-100 px-2 py-0.5 rounded-sm">
                                                                PosPre: {item.rubric?.code || "N/A"}
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-between items-center mt-1 pt-1 border-t border-dashed border-default-100">
                                                            <span className="text-tiny text-default-400">Saldo Disp.</span>
                                                            <span className="text-small font-semibold text-success-600 dark:text-success-400">
                                                                {formatCurrency(item.balance)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        )}
                                        {loadingDetailed && (
                                            <div className="flex justify-center p-2">
                                                <span className="text-tiny text-default-400">Cargando...</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end">
                                        <span className="text-tiny text-default-400">
                                            {selectedDetailedIds.size} actividad(es) seleccionada(s)
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button variant="flat" onPress={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        color="primary"
                        onPress={handleSave}
                        isLoading={isSubmitting}
                        isDisabled={Boolean(!isValid)}
                        startContent={!isSubmitting && <Plus size={16} />}
                    >
                        Crear Actividad
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
