"use client"

import { Button, Breadcrumbs, BreadcrumbItem, Chip, SortDescriptor } from "@heroui/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction } from "@/components/tables/DataTable"
import { useDebounce } from "@/hooks/useDebounce"
import { usePermissions } from "@/hooks/usePermissions"
import { NeedDetailModal } from "@/components/modals/financial/NeedDetailModal"
import { get, PaginatedData, PaginationMeta } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Eye, RefreshCw } from "lucide-react"
import { addToast } from "@heroui/toast"
import type { FinancialNeed } from "@/types/financial"
import { getErrorMessage } from "@/lib/error-codes"

const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(parseFloat(amount))
}

const columns: ColumnDef<FinancialNeed>[] = [
    { key: "code", label: "Code", sortable: true },
    {
        key: "amount",
        label: "Amount",
        sortable: true,
        render: (need) => (
            <span className="font-medium text-primary">{formatCurrency(need.amount)}</span>
        ),
    },
    {
        key: "description",
        label: "Description",
        sortable: false,
        render: (need) => (
            <span className="line-clamp-2 max-w-md" title={need.description}>
                {need.description}
            </span>
        ),
    },
    {
        key: "previousStudy.code",
        label: "Study Code",
        sortable: false,
        render: (need) => need.previousStudy?.code ?? "N/A",
    },
    {
        key: "previousStudy.status",
        label: "Study Status",
        sortable: false,
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
        label: "Created",
        sortable: true,
        render: (need) => new Date(need.createAt).toLocaleString(),
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
    const [limit, setLimit] = useState(10)
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "createAt",
        direction: "descending",
    })
    const [searchInput, setSearchInput] = useState("")
    const debouncedSearch = useDebounce(searchInput, 400)

    // Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

    // Selection State
    const [selectedNeed, setSelectedNeed] = useState<FinancialNeed | null>(null)

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
            const message = errorCode ? getErrorMessage(errorCode) : (e.message ?? "Error loading needs")
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
            const message = errorCode ? getErrorMessage(errorCode) : "Error loading need details"
            addToast({ title: message, color: "danger" })
        }
    }

    const rowActions: RowAction<FinancialNeed>[] = useMemo(() => {
        const actions: RowAction<FinancialNeed>[] = []
        if (canRead) {
            actions.push({
                key: "view",
                label: "View Details",
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
                label: "Refresh",
                icon: <RefreshCw size={16} />,
                color: "default",
                onClick: fetchNeeds,
            },
        ]
    }, [fetchNeeds])

    return (
        <div className="grid gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Home</BreadcrumbItem>
                <BreadcrumbItem>Financial</BreadcrumbItem>
                <BreadcrumbItem>Needs</BreadcrumbItem>
            </Breadcrumbs>

            {!canRead ? (
                <div className="text-center py-16">
                    <p className="text-xl font-semibold text-danger">Access Denied</p>
                    <p className="text-default-500 mt-2">You do not have permission to view this module.</p>
                </div>
            ) : error ? (
                <div className="text-center py-8 text-danger">
                    <p>{error}</p>
                    <Button variant="flat" className="mt-2" onPress={fetchNeeds}>
                        Retry
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
                    searchPlaceholder="Search needs..."
                    ariaLabel="Financial needs table"
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
        </div>
    )
}
