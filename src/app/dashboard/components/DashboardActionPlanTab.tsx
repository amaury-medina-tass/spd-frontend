"use client"

import { DataTable, ColumnDef, SortDescriptor, RowAction } from "@/components/tables/DataTable"
import { ActionPlanIndicator } from "@/types/masters/indicators"
import { useCallback, useEffect, useMemo, useState } from "react"
import { RefreshCw, Eye } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"
import { getActionPlanIndicatorsByLocation } from "@/services/masters/indicators.service"
import { PaginationMeta } from "@/lib/http"
import { Button } from "@heroui/react"

type ActionIndicatorWithMatch = ActionPlanIndicator & { matchSource: string }

const indicatorColumns: ColumnDef<ActionIndicatorWithMatch>[] = [
    { key: "code", label: "Código", sortable: true },
    { key: "statisticalCode", label: "Cód. Est.", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    { key: "unitMeasure", label: "Unidad", sortable: false, render: (i) => i.unitMeasure?.name || "N/A" },
    { key: "plannedQuantity", label: "Meta", sortable: false },
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
    {
        key: "matchSource",
        label: "Origen",
        sortable: false,
        render: (i) => {
            const labels: Record<string, { text: string; className: string }> = {
                direct: { text: 'Directo', className: 'bg-primary/10 text-primary' },
                variable: { text: 'Variable', className: 'bg-secondary/10 text-secondary' },
                all: { text: 'Todos', className: 'bg-default-100 text-default-600' },
            }
            const config = labels[i.matchSource] || { text: i.matchSource, className: 'bg-default-100 text-default-600' }
            return (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
                    {config.text}
                </span>
            )
        }
    },
]

interface DashboardActionPlanTabProps {
    communeId: string | null
    onViewVariables: (indicator: ActionIndicatorWithMatch) => void
}

export function DashboardActionPlanTab({ communeId, onViewVariables }: DashboardActionPlanTabProps) {
    // State
    const [items, setItems] = useState<ActionIndicatorWithMatch[]>([])
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

            const locationId = communeId || "all"
            const result = await getActionPlanIndicatorsByLocation(locationId, params.toString())
            setItems(result.data)
            setMeta(result.meta)
        } catch (e: any) {
            setError(e.message ?? "Error al cargar indicadores")
        } finally {
            setLoading(false)
        }
    }, [page, limit, search, sortDescriptor, communeId])

    useEffect(() => {
        fetchIndicators()
    }, [fetchIndicators])

    useEffect(() => {
        setSearch(debouncedSearch)
        setPage(1)
    }, [debouncedSearch])

    // Reset page when commune changes
    useEffect(() => {
        setPage(1)
    }, [communeId])

    const rowActions: RowAction<ActionIndicatorWithMatch>[] = useMemo(() => [
        {
            key: "variables",
            label: "Ver Variables",
            icon: <Eye size={16} />,
            onClick: (item) => onViewVariables(item),
        },
    ], [onViewVariables])

    if (error) {
        return (
            <div className="text-center py-8 text-danger">
                <p>{error}</p>
                <Button variant="flat" className="mt-2" onPress={fetchIndicators}>
                    Reintentar
                </Button>
            </div>
        )
    }

    return (
        <DataTable
            items={items}
            columns={indicatorColumns}
            isLoading={loading}
            rowActions={rowActions}
            topActions={[
                {
                    key: "refresh",
                    label: "Actualizar",
                    icon: <RefreshCw size={16} />,
                    color: "default",
                    onClick: fetchIndicators,
                },
            ]}
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            searchPlaceholder="Buscar indicadores..."
            ariaLabel="Tabla de indicadores plan de acción por ubicación"
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
    )
}
