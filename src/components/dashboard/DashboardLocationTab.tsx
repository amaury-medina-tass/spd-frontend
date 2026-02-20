"use client"

import { DataTable, ColumnDef, SortDescriptor, RowAction } from "@/components/tables/DataTable"
import { useCallback, useEffect, useMemo, useState } from "react"
import { RefreshCw, Eye } from "lucide-react"
import { useDebounce } from "@/hooks/useDebounce"
import { PaginationMeta } from "@/lib/http"
import { Button } from "@heroui/react"

export function renderMatchSource(matchSource: string) {
    const labels: Record<string, { text: string; className: string }> = {
        direct: { text: 'Directo', className: 'bg-primary/10 text-primary' },
        variable: { text: 'Variable', className: 'bg-secondary/10 text-secondary' },
        all: { text: 'Todos', className: 'bg-default-100 text-default-600' },
    }
    const config = labels[matchSource] || { text: matchSource, className: 'bg-default-100 text-default-600' }
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
            {config.text}
        </span>
    )
}

interface DashboardLocationTabProps<T extends { id: string; code: string; matchSource: string }> {
    communeId: string | null
    onViewVariables: (indicator: T) => void
    columns: ColumnDef<T>[]
    fetchFn: (locationId: string, query: string) => Promise<{ data: T[]; meta: PaginationMeta }>
    ariaLabel: string
}

export function DashboardLocationTab<T extends { id: string; code: string; matchSource: string }>({
    communeId,
    onViewVariables,
    columns,
    fetchFn,
    ariaLabel,
}: Readonly<DashboardLocationTabProps<T>>) {
    // State
    const [items, setItems] = useState<T[]>([])
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
                params.set("sortBy", sortDescriptor.column)
                params.set("sortOrder", sortDescriptor.direction === "ascending" ? "ASC" : "DESC")
            }

            const locationId = communeId || "all"
            const result = await fetchFn(locationId, params.toString())
            setItems(result.data)
            setMeta(result.meta)
        } catch (e: any) {
            setError(e.message ?? "Error al cargar indicadores")
        } finally {
            setLoading(false)
        }
    }, [page, limit, search, sortDescriptor, communeId, fetchFn])

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

    const rowActions: RowAction<T>[] = useMemo(() => [
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
            columns={columns}
            isLoading={loading}
            rowActions={rowActions}
            topActions={[
                {
                    key: "refresh",
                    label: "Actualizar",
                    icon: <RefreshCw size={16} />,
                    color: "default",
                    onClick: () => void fetchIndicators(),
                },
            ]}
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            searchPlaceholder="Buscar indicadores..."
            ariaLabel={ariaLabel}
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
