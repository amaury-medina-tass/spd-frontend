"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Button,
    Pagination,
    Spinner,
    Input,
    Select,
    SelectItem,
} from "@heroui/react"
import {
    Search,
    Receipt,
    Hash,
    Briefcase,
    DollarSign,
    FileText,
    BookOpen,
} from "lucide-react"
import type { NeedCdpPosition, NeedCdpPositionsResponse } from "@/types/financial"
import { get } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { useDebounce } from "@/hooks/useDebounce"

export function NeedCdpPositionsModal({
    isOpen,
    needId,
    onClose,
}: {
    isOpen: boolean
    needId: string | null
    onClose: () => void
}) {
    // Data State
    const [data, setData] = useState<NeedCdpPositionsResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [search, setSearch] = useState("")
    const [searchInput, setSearchInput] = useState("")

    // Sorting (can be expanded later if needed, currently fixed or default)
    // The user provided a sortMap but didn't explicitly ask for UI sorting controls, 
    // but standard tables usually have them. The custom grid in CdpPositionDetailModal 
    // does NOT have sorting headers. I'll stick to the visual style first.
    // If I need sorting, I'll add clickable headers.
    const [sortDescriptor, setSortDescriptor] = useState<{ column: string, direction: 'ASC' | 'DESC' }>({
        column: 'cdpNumber',
        direction: 'DESC'
    })

    const debouncedSearch = useDebounce(searchInput, 400)

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
    }

    const fetchData = useCallback(async () => {
        if (!needId) return

        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                search: search.trim(),
                sortBy: sortDescriptor.column,
                sortOrder: sortDescriptor.direction
            })

            const result = await get<NeedCdpPositionsResponse>(
                `${endpoints.financial.needs}/${needId}/cdp-positions?${params}`
            )
            setData(result)
        } catch (error) {
            console.error("Error fetching CDP positions:", error)
        } finally {
            setLoading(false)
        }
    }, [needId, page, limit, search, sortDescriptor])

    useEffect(() => {
        setSearch(debouncedSearch)
        setPage(1)
    }, [debouncedSearch])

    useEffect(() => {
        if (isOpen && needId) {
            fetchData()
        }
    }, [isOpen, needId, fetchData])

    useEffect(() => {
        if (!isOpen) {
            // Reset state on close
            setData(null)
            setPage(1)
            setSearch("")
            setSearchInput("")
        }
    }, [isOpen])

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={() => onClose()}
            size="5xl"
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
                        <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary">
                            <Receipt size={20} />
                        </div>
                        <div>
                            <span className="text-large font-semibold text-foreground">
                                Posiciones CDP Asociadas
                            </span>
                            <p className="text-small text-default-400 font-normal">
                                Detalle de los CDPs y posiciones que cubren esta necesidad
                            </p>
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody className="py-6">
                    <div className="space-y-6">
                        {/* Header Stats & Search */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3 bg-default-50 dark:bg-default-100/50 px-4 py-2 rounded-lg border border-default-200 dark:border-default-700/50">
                                <span className="text-small font-medium text-default-500">Valor Total Asociado:</span>
                                <span className="text-large font-bold text-success-600 dark:text-success-400">
                                    {data ? formatCurrency(data.totalValue) : "..."}
                                </span>
                            </div>

                            <Input
                                size="sm"
                                placeholder="Buscar por código, CDP..."
                                value={searchInput}
                                onValueChange={setSearchInput}
                                startContent={<Search size={16} className="text-default-400" />}
                                className="w-full sm:w-72"
                                classNames={{
                                    inputWrapper: "h-10",
                                }}
                            />
                        </div>

                        {/* Custom Table / Grid */}
                        {/* Custom Table / Grid - Fixed Double Scroll */}
                        <div className="border border-default-200 dark:border-default-700 rounded-lg overflow-hidden h-[500px] flex flex-col">
                            <div className="overflow-auto flex-1 w-full relative">
                                <div className="min-w-[1000px] min-h-full flex flex-col">
                                    {/* Header */}
                                    <div className="sticky top-0 z-20 grid grid-cols-12 gap-4 px-4 py-3 bg-default-100 dark:bg-default-50 border-b border-default-200 dark:border-default-700 text-tiny font-bold text-default-500 uppercase tracking-wider backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
                                        <div className="col-span-2 flex items-center gap-2">
                                            <Hash size={14} /> CDP / Proy
                                        </div>
                                        <div className="col-span-2 flex items-center gap-2">
                                            <FileText size={14} /> Origen Presupuesto
                                        </div>
                                        <div className="col-span-1 text-center">Pos.</div>
                                        <div className="col-span-2 text-right">Valor Pos.</div>
                                        <div className="col-span-2 text-right">Valor Total</div>
                                        <div className="col-span-3">Observaciones</div>
                                    </div>

                                    {/* Body */}
                                    <div className="flex-1 bg-content1">
                                        {loading && !data ? (
                                            <div className="flex flex-col items-center justify-center h-full gap-3 text-default-400 py-12">
                                                <Spinner size="lg" />
                                                <p className="text-small">Cargando posiciones...</p>
                                            </div>
                                        ) : data?.data && data.data.length > 0 ? (
                                            <div className="divide-y divide-default-100 dark:divide-default-700/50">
                                                {data.data.map((item, idx) => (
                                                    <div
                                                        key={`${item.cdpNumber}-${item.positionNumber}-${idx}`}
                                                        className="grid grid-cols-12 gap-4 px-4 py-3 text-small hover:bg-default-50 dark:hover:bg-default-100/30 transition-colors items-center"
                                                    >
                                                        {/* CDP / Project */}
                                                        <div className="col-span-2 space-y-1">
                                                            <div className="font-semibold text-foreground flex items-center gap-1.5">
                                                                <span className="text-small font-medium text-foreground font-mono">
                                                                    {item.cdpNumber}
                                                                </span>
                                                            </div>
                                                            <div className="text-tiny text-default-500 font-mono">
                                                                {item.projectCode}
                                                            </div>
                                                        </div>

                                                        {/* Funding Source */}
                                                        <div className="col-span-2 space-y-0.5">
                                                            <p className="text-foreground font-medium line-clamp-2" title={item.fundingSourceName}>
                                                                {item.fundingSourceName}
                                                            </p>
                                                            <p className="text-tiny text-default-400 font-mono">
                                                                {item.fundingSourceCode}
                                                            </p>
                                                        </div>

                                                        {/* Position Number */}
                                                        <div className="col-span-1 text-center">
                                                            <span className="text-small font-medium text-foreground">
                                                                {item.positionNumber}
                                                            </span>
                                                        </div>

                                                        {/* Value Position */}
                                                        <div className="col-span-2 text-right">
                                                            <p className="font-bold text-foreground">
                                                                {formatCurrency(item.positionValue)}
                                                            </p>
                                                        </div>

                                                        {/* Value Total */}
                                                        <div className="col-span-2 text-right">
                                                            <p className="text-small text-default-500 font-medium">
                                                                {formatCurrency(item.cdpTotalValue)}
                                                            </p>
                                                        </div>

                                                        {/* Observations */}
                                                        <div className="col-span-3">
                                                            <p className="text-default-500 text-tiny italic line-clamp-3" title={item.observations}>
                                                                "{item.observations || "Sin observaciones"}"
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full gap-2 text-default-400 py-12">
                                                <BookOpen size={48} className="opacity-50" />
                                                <p className="text-medium font-medium">No se encontraron posiciones</p>
                                                <p className="text-small opacity-75">
                                                    {search ? "Intenta con otros términos de búsqueda" : "Esta necesidad no tiene posiciones asociadas aún"}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pagination & Limit */}
                        {data && data.meta && (
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-dashed border-default-200 dark:border-default-700 pt-4">
                                <span className="text-small text-default-400">
                                    Total: {data.meta.total} registros
                                </span>

                                <div className="flex items-center gap-4">
                                    {data.meta.totalPages > 1 && (
                                        <Pagination
                                            total={data.meta.totalPages}
                                            page={page}
                                            onChange={setPage}
                                            showControls
                                            size="sm"
                                            color="primary"
                                            variant="flat"
                                        />
                                    )}

                                    <div className="flex items-center gap-2">
                                        <span className="text-tiny text-default-400">Filas:</span>
                                        <Select
                                            size="sm"
                                            selectedKeys={[limit.toString()]}
                                            onChange={(e) => {
                                                setLimit(Number(e.target.value))
                                                setPage(1)
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
                </ModalBody>

                <ModalFooter>
                    <Button onPress={onClose} variant="light" color="danger">
                        Cerrar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
