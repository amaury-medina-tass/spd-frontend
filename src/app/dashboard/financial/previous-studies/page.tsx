"use client"

import { Button, Breadcrumbs, BreadcrumbItem, Chip } from "@heroui/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { DataTable, ColumnDef, TopAction, SortDescriptor } from "@/components/tables/DataTable"
import { useDebounce } from "@/hooks/useDebounce"
import { usePermissions } from "@/hooks/usePermissions"
import { get, PaginatedData, PaginationMeta } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { RefreshCw, Download } from "lucide-react"
import type { PreviousStudy } from "@/types/financial"
import { getErrorMessage } from "@/lib/error-codes"
import { requestExport } from "@/services/exports.service"
import { addToast } from "@heroui/toast"

const columns: ColumnDef<PreviousStudy>[] = [
    { key: "code", label: "Código", sortable: true },
    {
        key: "status",
        label: "Estado",
        sortable: true,
        render: (study) => {
            const statusLower = study.status.toLowerCase()
            let color: "success" | "warning" | "danger" | "default" = "default"
            if (statusLower === "aprobado" || statusLower === "approved") color = "success"
            else if (statusLower === "pendiente" || statusLower === "pending") color = "warning"
            else if (statusLower === "rechazado" || statusLower === "rejected") color = "danger"

            return (
                <Chip color={color} variant="flat" size="sm">
                    {study.status}
                </Chip>
            )
        },
    },
    {
        key: "createAt",
        label: "Creado",
        sortable: true,
        render: (study) => new Date(study.createAt).toLocaleString(),
    },
    {
        key: "updateAt",
        label: "Actualizado",
        sortable: true,
        render: (study) => new Date(study.updateAt).toLocaleString(),
    },
]

export default function PreviousStudiesPage() {
    // Permissions
    const { canRead } = usePermissions("/financial/previous-studies")

    // Data State
    const [items, setItems] = useState<PreviousStudy[]>([])
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

    // Export State
    const [exporting, setExporting] = useState(false)

    const fetchStudies = useCallback(async () => {
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

            const result = await get<PaginatedData<PreviousStudy>>(`${endpoints.financial.previousStudies}?${params}`)
            setItems(result.data)
            setMeta(result.meta)
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : (e.message ?? "Error al cargar estudios previos")
            setError(message)
        } finally {
            setLoading(false)
        }
    }, [page, search, limit, sortDescriptor])

    useEffect(() => {
        fetchStudies()
    }, [fetchStudies])

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
                onClick: fetchStudies,
            },
            {
                key: "export",
                label: "Exportar Estudios Previos",
                icon: <Download size={16} />,
                color: "primary",
                onClick: async () => {
                    try {
                        setExporting(true)
                        await requestExport({ system: "SPD", type: "PREVIOUS_STUDIES" })
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
    }, [fetchStudies, exporting])

    return (
        <div className="grid gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Inicio</BreadcrumbItem>
                <BreadcrumbItem>Financiero</BreadcrumbItem>
                <BreadcrumbItem>Estudios Previos</BreadcrumbItem>
            </Breadcrumbs>

            {!canRead ? (
                <div className="text-center py-16">
                    <p className="text-xl font-semibold text-danger">Acceso Denegado</p>
                    <p className="text-default-500 mt-2">No tienes permisos para ver este módulo.</p>
                </div>
            ) : error ? (
                <div className="text-center py-8 text-danger">
                    <p>{error}</p>
                    <Button variant="flat" className="mt-2" onPress={fetchStudies}>
                        Reintentar
                    </Button>
                </div>
            ) : (
                <DataTable
                    items={items}
                    columns={columns}
                    isLoading={loading}
                    topActions={topActions}
                    searchValue={searchInput}
                    onSearchChange={setSearchInput}
                    searchPlaceholder="Buscar estudios previos..."
                    ariaLabel="Tabla de estudios previos"
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
        </div>
    )
}
