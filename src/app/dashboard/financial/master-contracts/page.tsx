"use client"

import { Button, Breadcrumbs, BreadcrumbItem, Chip, SortDescriptor, Tooltip } from "@heroui/react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction } from "@/components/tables/DataTable"
import { useDebounce } from "@/hooks/useDebounce"
import { usePermissions } from "@/hooks/usePermissions"
import { MasterContractDetailModal } from "@/components/modals/financial/MasterContractDetailModal"
import { get, PaginatedData, PaginationMeta } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Eye, RefreshCw } from "lucide-react"
import { addToast } from "@heroui/toast"
import type { MasterContract } from "@/types/financial"
import { getErrorMessage } from "@/lib/error-codes"

const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(parseFloat(amount))
}

function ObjectCell({ text }: { text: string }) {
    const textRef = useRef<HTMLSpanElement>(null)
    const [isTruncated, setIsTruncated] = useState(false)

    useEffect(() => {
        const element = textRef.current
        if (element) {
            setIsTruncated(element.scrollHeight > element.clientHeight)
        }
    }, [text])

    const content = (
        <span ref={textRef} className="line-clamp-2 max-w-md">
            {text}
        </span>
    )

    if (isTruncated) {
        return (
            <Tooltip content={text} delay={300} closeDelay={0}>
                <span className="cursor-help">{content}</span>
            </Tooltip>
        )
    }

    return content
}

const columns: ColumnDef<MasterContract>[] = [
    { key: "number", label: "Número", sortable: true },
    {
        key: "object",
        label: "Objeto",
        sortable: true,
        render: (contract) => <ObjectCell text={contract.object} />,
    },
    {
        key: "totalValue",
        label: "Valor Total",
        sortable: true,
        render: (contract) => (
            <span className="font-medium">{formatCurrency(contract.totalValue)}</span>
        ),
    },
    {
        key: "state",
        label: "Estado",
        sortable: true,
        render: (contract) => {
            const stateLower = contract.state.toLowerCase()
            const isExecution = stateLower === "en ejecución"

            let color: "success" | "warning" | "danger" | "default" = "default"
            if (stateLower === "legalizado" || stateLower === "active") color = "success"
            else if (stateLower === "pendiente" || stateLower === "pending") color = "warning"
            else if (stateLower === "terminado" || stateLower === "closed") color = "default"

            return (
                <Chip
                    color={isExecution ? "default" : color}
                    variant="flat"
                    size="sm"
                    className={isExecution ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400" : ""}
                >
                    {contract.state}
                </Chip>
            )
        },
    },
    {
        key: "contractor.name",
        label: "Contratista",
        sortable: true,
        render: (contract) => contract.contractor.name,
    },
    {
        key: "startDate",
        label: "Fecha Inicio",
        sortable: false,
        render: (contract) => new Date(contract.startDate).toLocaleDateString("es-CO"),
    },
    {
        key: "createAt",
        label: "Creado",
        sortable: true,
        render: (contract) => new Date(contract.createAt).toLocaleString(),
    },
    {
        key: "updateAt",
        label: "Actualizado",
        sortable: true,
        render: (contract) => new Date(contract.updateAt).toLocaleString(),
    },
]

export default function MasterContractsPage() {
    // Permissions
    const { canRead } = usePermissions("/financial/master-contracts")

    // Data State
    const [items, setItems] = useState<MasterContract[]>([])
    const [meta, setMeta] = useState<PaginationMeta | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Filter & Pagination State
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [limit, setLimit] = useState(5)
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "totalValue",
        direction: "descending",
    })
    const [searchInput, setSearchInput] = useState("")
    const debouncedSearch = useDebounce(searchInput, 400)

    // Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedContract, setSelectedContract] = useState<MasterContract | null>(null)

    const fetchContracts = useCallback(async () => {
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

            const result = await get<PaginatedData<MasterContract>>(`${endpoints.financial.masterContracts}?${params}`)
            setItems(result.data)
            setMeta(result.meta)
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : (e.message ?? "Error al cargar contratos marco")
            setError(message)
        } finally {
            setLoading(false)
        }
    }, [page, search, limit, sortDescriptor])

    useEffect(() => {
        fetchContracts()
    }, [fetchContracts])

    useEffect(() => {
        setSearch(debouncedSearch)
        setPage(1)
    }, [debouncedSearch])

    const onViewDetails = async (contract: MasterContract) => {
        try {
            // Fetch fresh details if needed, or use existing. Recommended to fetch.
            const freshContract = await get<MasterContract>(`${endpoints.financial.masterContracts}/${contract.id}`)
            setSelectedContract(freshContract)
            setIsDetailModalOpen(true)
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al cargar detalles del contrato"
            addToast({ title: message, color: "danger" })
        }
    }

    const rowActions: RowAction<MasterContract>[] = useMemo(() => {
        const actions: RowAction<MasterContract>[] = []
        if (canRead) {
            actions.push({
                key: "view",
                label: "Ver Detalles",
                icon: <Eye size={16} />,
                onClick: onViewDetails,
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
                onClick: fetchContracts,
            },
        ]
    }, [fetchContracts])

    return (
        <div className="grid gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Inicio</BreadcrumbItem>
                <BreadcrumbItem>Financiero</BreadcrumbItem>
                <BreadcrumbItem>Contratos Marco</BreadcrumbItem>
            </Breadcrumbs>

            {!canRead ? (
                <div className="text-center py-16">
                    <p className="text-xl font-semibold text-danger">Acceso Denegado</p>
                    <p className="text-default-500 mt-2">No tienes permisos para ver este módulo.</p>
                </div>
            ) : error ? (
                <div className="text-center py-8 text-danger">
                    <p>{error}</p>
                    <Button variant="flat" className="mt-2" onPress={fetchContracts}>
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
                    searchPlaceholder="Buscar contratos marco..."
                    ariaLabel="Tabla de contratos marco"
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

            <MasterContractDetailModal
                isOpen={isDetailModalOpen}
                contract={selectedContract}
                onClose={() => {
                    setIsDetailModalOpen(false)
                    setSelectedContract(null)
                }}
            />
        </div>
    )
}
