"use client"

import { DataTable, ColumnDef, SortDescriptor, RowAction } from "@/components/tables/DataTable"
import { Indicator } from "@/types/masters/indicators"
import { useCallback, useEffect, useMemo, useState } from "react"
import { RefreshCw, Eye } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"
import { getIndicatorsByLocation } from "@/services/masters/indicators.service"
import { PaginationMeta } from "@/lib/http"
import { Button } from "@heroui/react"

type IndicatorWithMatch = Indicator & { matchSource: string }

const indicatorColumns: ColumnDef<IndicatorWithMatch>[] = [
    { key: "code", label: "Código", sortable: true },
    { key: "pillarName", label: "Pilar", sortable: false },
    { key: "programName", label: "Programa", sortable: false },
    { key: "name", label: "Nombre", sortable: true },
    {
        key: "advancePercentage",
        label: "Avance",
        sortable: false,
        render: (i) => (
            <span className={`font-semibold ${Number(i.advancePercentage) >= 100 ? "text-success" : "text-warning"}`}>
                {i.advancePercentage}%
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

interface DashboardIndicativePlanTabProps {
    communeId: string | null
    onViewVariables: (indicator: IndicatorWithMatch) => void
}

export function DashboardIndicativePlanTab({ communeId, onViewVariables }: DashboardIndicativePlanTabProps) {
    // State
    const [items, setItems] = useState<IndicatorWithMatch[]>([])
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
            const result = await getIndicatorsByLocation(locationId, params.toString())
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

    const rowActions: RowAction<IndicatorWithMatch>[] = useMemo(() => [
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
            ariaLabel="Tabla de indicadores plan indicativo por ubicación"
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
