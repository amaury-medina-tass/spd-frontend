"use client"

import { Breadcrumbs, BreadcrumbItem, Button, Chip } from "@heroui/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction, SortDescriptor } from "@/components/tables/DataTable"
import { useDebounce } from "@/hooks/useDebounce"
import { getVariables } from "@/services/sub/variables.service"
import { Variable } from "@/types/masters/variables"
import { BarChart3, RefreshCw } from "lucide-react"
import { addToast } from "@heroui/toast"
import { VariableDashboardModal } from "@/components/modals/sub/variables/VariableDashboardModal"
import { PaginationMeta } from "@/lib/http"

const columns: ColumnDef<Variable>[] = [
    { key: "code", label: "Código", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    { key: "observations", label: "Observaciones", sortable: false },
    {
        key: "createAt",
        label: "Creado",
        sortable: true,
        render: (item) => new Date(item.createAt).toLocaleDateString(),
    },
]

export default function VariablesPage() {
    // Data State
    const [items, setItems] = useState<Variable[]>([])
    const [meta, setMeta] = useState<PaginationMeta | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Filter & Pagination State
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [limit, setLimit] = useState(10)
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "name",
        direction: "ascending",
    })
    const [searchInput, setSearchInput] = useState("")
    const debouncedSearch = useDebounce(searchInput, 400)

    // Modal State
    const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false)
    const [selectedVariable, setSelectedVariable] = useState<Variable | null>(null)

    const fetchVariables = useCallback(async () => {
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

            // Note: The service expects the query string
            const result = await getVariables(params.toString())
            setItems(result.data)
            setMeta(result.meta)
        } catch (e: any) {
            const message = e.message || "Error al cargar variables"
            setError(message)
            addToast({ title: "Error", description: message, color: "danger" })
        } finally {
            setLoading(false)
        }
    }, [page, search, limit, sortDescriptor])

    useEffect(() => {
        fetchVariables()
    }, [fetchVariables])

    useEffect(() => {
        setSearch(debouncedSearch)
        setPage(1)
    }, [debouncedSearch])

    const onOpenDashboard = (variable: Variable) => {
        setSelectedVariable(variable)
        setIsDashboardModalOpen(true)
    }

    const rowActions: RowAction<Variable>[] = useMemo(() => {
        return [
            {
                key: "dashboard",
                label: "Dashboard",
                icon: <BarChart3 size={16} />,
                onClick: onOpenDashboard,
            }
        ]
    }, [])

    const topActions: TopAction[] = useMemo(() => {
        return [
            {
                key: "refresh",
                label: "Actualizar",
                icon: <RefreshCw size={16} />,
                color: "default",
                onClick: fetchVariables,
            },
        ]
    }, [fetchVariables])

    return (
        <div className="grid gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Inicio</BreadcrumbItem>
                <BreadcrumbItem>Sub</BreadcrumbItem>
                <BreadcrumbItem>Variables</BreadcrumbItem>
            </Breadcrumbs>

            {error ? (
                <div className="text-center py-8 text-danger">
                    <p>{error}</p>
                    <Button variant="flat" className="mt-2" onPress={fetchVariables}>
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
                    searchPlaceholder="Buscar variables..."
                    ariaLabel="Tabla de variables"
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

            <VariableDashboardModal
                isOpen={isDashboardModalOpen}
                onClose={() => {
                    setIsDashboardModalOpen(false)
                    setSelectedVariable(null)
                }}
                variableId={selectedVariable?.id || null}
                variableCode={selectedVariable?.code}
            />
        </div>
    )
}
