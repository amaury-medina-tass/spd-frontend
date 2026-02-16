"use client"

import { Button, Breadcrumbs, BreadcrumbItem, Chip, Tooltip } from "@heroui/react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction, SortDescriptor } from "@/components/tables/DataTable"
import { useDebounce } from "@/hooks/useDebounce"
import { usePermissions } from "@/hooks/usePermissions"
import { NeedDetailModal } from "@/components/modals/financial/needs/NeedDetailModal"
import { NeedCdpPositionsModal } from "@/components/modals/financial/needs/NeedCdpPositionsModal"
import { get, PaginatedData, PaginationMeta } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Eye, RefreshCw, Layers, Download } from "lucide-react"
import { addToast } from "@heroui/toast"
import type { FinancialNeed } from "@/types/financial"
import { getErrorMessage } from "@/lib/error-codes"
import { requestExport } from "@/services/exports.service"

const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(parseFloat(amount))
}

function DescriptionCell({ description }: { description: string }) {
    const textRef = useRef<HTMLSpanElement>(null)
    const [isTruncated, setIsTruncated] = useState(false)

    useEffect(() => {
        const element = textRef.current
        if (element) {
            setIsTruncated(element.scrollHeight > element.clientHeight)
        }
    }, [description])

    const content = (
        <span ref={textRef} className="line-clamp-2 max-w-md">
            {description}
        </span>
    )

    if (isTruncated) {
        return (
            <Tooltip content={description} delay={300} closeDelay={0}>
                <span className="cursor-help">{content}</span>
            </Tooltip>
        )
    }

    return content
}


const columns: ColumnDef<FinancialNeed>[] = [
    { key: "code", label: "Código", sortable: true },
    {
        key: "amount",
        label: "Monto",
        sortable: true,
        render: (need) => (
            <span className="font-medium">{formatCurrency(need.amount)}</span>
        ),
    },
    {
        key: "description",
        label: "Descripción",
        sortable: true,
        render: (need) => <DescriptionCell description={need.description} />,
    },
    {
        key: "previousStudy.code",
        label: "Código Estudio",
        sortable: true,
        render: (need) => need.previousStudy?.code ?? "N/A",
    },
    {
        key: "previousStudy.status",
        label: "Estado Estudio",
        sortable: true,
        render: (need) => {
            const status = need.previousStudy?.status ?? "N/A"
            const statusLower = status.toLowerCase()
            let color: "success" | "warning" | "danger" | "default" = "default"
            if (statusLower === "aprobado" || statusLower === "approved") color = "success"
            else if (statusLower === "pendiente" || statusLower === "pending") color = "warning"
            else if (statusLower === "rechazado" || statusLower === "rejected") color = "danger"

            return (
                <Chip color={color} variant="flat" size="sm">
                    {status}
                </Chip>
            )
        },
    },
    {
        key: "createAt",
        label: "Creado",
        sortable: true,
        render: (need) => new Date(need.createAt).toLocaleString(),
    },
    {
        key: "updateAt",
        label: "Actualizado",
        sortable: true,
        render: (need) => new Date(need.updateAt).toLocaleString(),
    },
]

export default function FinancialNeedsPage() {
    // Permissions
    const { canRead } = usePermissions("/financial/needs")

    // Data State
    const [items, setItems] = useState<FinancialNeed[]>([])
    const [meta, setMeta] = useState<PaginationMeta | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Filter & Pagination State
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [limit, setLimit] = useState(5)
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "createAt",
        direction: "descending",
    })
    const [searchInput, setSearchInput] = useState("")
    const debouncedSearch = useDebounce(searchInput, 400)

    // Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [isPositionsModalOpen, setIsPositionsModalOpen] = useState(false)

    // Selection State
    const [selectedNeed, setSelectedNeed] = useState<FinancialNeed | null>(null)
    const [selectedNeedIdForPositions, setSelectedNeedIdForPositions] = useState<string | null>(null)

    // Export State
    const [exporting, setExporting] = useState(false)

    const fetchNeeds = useCallback(async () => {
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
                params.set("sortBy", sortDescriptor.column as string)
                params.set("sortOrder", sortDescriptor.direction === "ascending" ? "ASC" : "DESC")
            }

            const result = await get<PaginatedData<FinancialNeed>>(`${endpoints.financial.needs}?${params}`)
            setItems(result.data)
            setMeta(result.meta)
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : (e.message ?? "Error al cargar necesidades")
            setError(message)
        } finally {
            setLoading(false)
        }
    }, [page, search, limit, sortDescriptor])

    useEffect(() => {
        fetchNeeds()
    }, [fetchNeeds])

    useEffect(() => {
        setSearch(debouncedSearch)
        setPage(1)
    }, [debouncedSearch])

    const onViewDetails = async (need: FinancialNeed) => {
        try {
            const freshNeed = await get<FinancialNeed>(`${endpoints.financial.needs}/${need.id}`)
            setSelectedNeed(freshNeed)
            setIsDetailModalOpen(true)
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al cargar detalles de la necesidad"
            addToast({ title: message, color: "danger" })
        }
    }

    const onViewPositions = (need: FinancialNeed) => {
        setSelectedNeedIdForPositions(need.id)
        setIsPositionsModalOpen(true)
    }

    const rowActions: RowAction<FinancialNeed>[] = useMemo(() => {
        const actions: RowAction<FinancialNeed>[] = []
        if (canRead) {
            actions.push({
                key: "view",
                label: "Ver Detalles",
                icon: <Eye size={16} />,
                onClick: onViewDetails,
            })
            actions.push({
                key: "positions",
                label: "Ver Posiciones CDP",
                icon: <Layers size={16} />,
                onClick: onViewPositions,
            })
        }
        return actions
    }, [canRead])

    const topActions: TopAction[] = useMemo(() => {
        return [
            {
                key: "refresh",
                label: "Actualizar",
                icon: <RefreshCw size={16} />,
                color: "default",
                onClick: fetchNeeds,
            },
            {
                key: "export",
                label: "Exportar Necesidades",
                icon: <Download size={16} />,
                color: "primary",
                onClick: async () => {
                    try {
                        setExporting(true)
                        await requestExport({ system: "SPD", type: "NEEDS" })
                        addToast({ title: "Exportación solicitada", description: "Recibirás una notificación cuando el archivo esté listo para descargar.", color: "primary", timeout: 5000 })
                    } catch {
                        addToast({ title: "Error", description: "No se pudo solicitar la exportación. Intenta de nuevo.", color: "danger", timeout: 5000 })
                    } finally {
                        setExporting(false)
                    }
                },
                isLoading: exporting,
            },
        ]
    }, [fetchNeeds, exporting])

    return (
        <div className="grid gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Inicio</BreadcrumbItem>
                <BreadcrumbItem>Financiero</BreadcrumbItem>
                <BreadcrumbItem>Necesidades</BreadcrumbItem>
            </Breadcrumbs>

            {!canRead ? (
                <div className="text-center py-16">
                    <p className="text-xl font-semibold text-danger">Acceso Denegado</p>
                    <p className="text-default-500 mt-2">No tienes permisos para ver este módulo.</p>
                </div>
            ) : error ? (
                <div className="text-center py-8 text-danger">
                    <p>{error}</p>
                    <Button variant="flat" className="mt-2" onPress={fetchNeeds}>
                        Reintentar
                    </Button>
                </div>
            ) : (
                <DataTable
                    items={items}
                    columns={columns}
                    isLoading={loading}
                    rowActions={rowActions}
                    topActions={topActions}
                    searchValue={searchInput}
                    onSearchChange={setSearchInput}
                    searchPlaceholder="Buscar necesidades..."
                    ariaLabel="Tabla de necesidades financieras"
                    pagination={meta ? {
                        page,
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
            )}

            <NeedDetailModal
                isOpen={isDetailModalOpen}
                need={selectedNeed}
                onClose={() => {
                    setIsDetailModalOpen(false)
                    setSelectedNeed(null)
                }}
            />

            <NeedCdpPositionsModal
                isOpen={isPositionsModalOpen}
                needId={selectedNeedIdForPositions}
                onClose={() => {
                    setIsPositionsModalOpen(false)
                    setSelectedNeedIdForPositions(null)
                }}
            />
        </div>
    )
}

