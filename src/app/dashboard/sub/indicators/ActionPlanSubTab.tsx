"use client"

import { DataTable, ColumnDef, SortDescriptor, TopAction, RowAction } from "@/components/tables/DataTable"
import { ActionPlanIndicator } from "@/types/masters/indicators"
import { useCallback, useEffect, useMemo, useState } from "react"
import { RefreshCw, Calculator, BarChart3 } from "lucide-react"
import { getMyActionPlanIndicators } from "@/services/sub/indicators.service"
import { PaginatedData, PaginationMeta } from "@/lib/http"
import { VariableAdvancesModal } from "@/components/modals/sub/VariableAdvancesModal"
import { IndicatorDashboardModal } from "@/components/modals/sub/IndicatorDashboardModal"
import { useDebounce } from "@/hooks/useDebounce"

const indicatorColumns: ColumnDef<ActionPlanIndicator>[] = [
    { key: "code", label: "Código", sortable: true },
    { key: "statisticalCode", label: "Cód. Est.", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    { key: "unitMeasure", label: "Unidad", sortable: false, render: (i) => i.unitMeasure?.name || "N/A" },
    { key: "plannedQuantity", label: "Meta", sortable: false },
    { key: "executionCut", label: "Corte Ej.", sortable: false },
    {
        key: "compliancePercentage",
        label: "Cumplimiento",
        sortable: false,
        render: (i) => (
            <span className={`font-semibold ${Number(i.compliancePercentage) >= 100 ? "text-success" : "text-warning"}`}>
                {i.compliancePercentage}%
            </span>
        )
    },
]

export function ActionPlanSubTab() {
    // State
    const [items, setItems] = useState<ActionPlanIndicator[]>([])
    const [meta, setMeta] = useState<PaginationMeta | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Pagination & Search
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [search, setSearch] = useState("")
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "code",
        direction: "ascending",
    })
    const [searchInput, setSearchInput] = useState("")

    const debouncedSearch = useDebounce(searchInput, 400)

    // Modals
    const [isAdvancesModalOpen, setIsAdvancesModalOpen] = useState(false)
    const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false)
    const [selectedIndicator, setSelectedIndicator] = useState<ActionPlanIndicator | null>(null)

    const fetchIndicators = useCallback(async () => {
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

            const result = await getMyActionPlanIndicators(params.toString())
            setItems(result.data)
            setMeta(result.meta)
        } catch (e: any) {
            setError(e.message ?? "Error al cargar indicadores")
        } finally {
            setLoading(false)
        }
    }, [page, limit, search, sortDescriptor])

    useEffect(() => {
        fetchIndicators()
    }, [fetchIndicators])

    useEffect(() => {
        setSearch(debouncedSearch)
        setPage(1)
    }, [debouncedSearch])

    const topActions: TopAction[] = useMemo(() => {
        return [
            {
                key: "refresh",
                label: "Actualizar",
                icon: <RefreshCw size={16} />,
                color: "default",
                onClick: fetchIndicators,
            },
        ]
    }, [fetchIndicators])

    const rowActions: RowAction<ActionPlanIndicator>[] = useMemo(() => {
        return [
            {
                key: "dashboard",
                label: "Dashboard",
                icon: <BarChart3 size={16} />,
                onClick: (item) => {
                    setSelectedIndicator(item)
                    setIsDashboardModalOpen(true)
                },
            },
            {
                key: "advances",
                label: "Avances Variables",
                icon: <Calculator size={16} />,
                onClick: (item) => {
                    setSelectedIndicator(item)
                    setIsAdvancesModalOpen(true)
                },
            },
        ]
    }, [])

    return (
        <>
            <DataTable
                items={items}
                columns={indicatorColumns}
                isLoading={loading}
                rowActions={rowActions}
                topActions={topActions}
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                searchPlaceholder="Buscar indicadores..."
                ariaLabel="Tabla de indicadores plan de acción"
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
                pagination={meta ? {
                    page: page,
                    totalPages: meta.totalPages,
                    onChange: setPage,
                    pageSize: limit,
                    onPageSizeChange: (newLimit) => {
                        setLimit(newLimit)
                        setPage(1)
                    }
                } : undefined}
            />

            <VariableAdvancesModal
                isOpen={isAdvancesModalOpen}
                onClose={() => setIsAdvancesModalOpen(false)}
                indicatorId={selectedIndicator?.id ?? null}
                indicatorCode={selectedIndicator?.code}
                type="action"
            />

            <IndicatorDashboardModal
                isOpen={isDashboardModalOpen}
                onClose={() => setIsDashboardModalOpen(false)}
                indicatorId={selectedIndicator?.id ?? null}
                indicatorCode={selectedIndicator?.code}
                type="action"
            />
        </>
    )
}

