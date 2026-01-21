"use client"

import { Button, Breadcrumbs, BreadcrumbItem, Chip, SortDescriptor, Tooltip } from "@heroui/react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction } from "@/components/tables/DataTable"
import { useDebounce } from "@/hooks/useDebounce"
import { usePermissions } from "@/hooks/usePermissions"
import { ProjectDetailModal } from "@/components/modals/financial/ProjectDetailModal"
import { get, PaginatedData, PaginationMeta } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Eye, RefreshCw } from "lucide-react"
import { addToast } from "@heroui/toast"
import type { Project } from "@/types/financial"
import { getErrorMessage } from "@/lib/error-codes"

const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(parseFloat(amount))
}

const columns: ColumnDef<Project>[] = [
    { key: "code", label: "Código", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    {
        key: "currentBudget",
        label: "P. Actual",
        sortable: true,
        render: (project) => (
            <span className="font-medium">{formatCurrency(project.currentBudget)}</span>
        ),
    },
    {
        key: "execution",
        label: "Ejecución",
        sortable: true,
        render: (project) => (
            <span className="font-medium">{formatCurrency(project.execution)}</span>
        ),
    },
    {
        key: "financialExecutionPercentage",
        label: "% Ejecución",
        sortable: true,
        render: (project) => (
            <span className="font-medium">
                {new Intl.NumberFormat("en-US", {
                    style: "percent",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                }).format(project.financialExecutionPercentage)}
            </span>
        ),
    },
    { key: "origin", label: "Origen", sortable: true },
    {
        key: "state",
        label: "Estado",
        sortable: true,
        render: (project) => {
            const color = project.state ? "success" : "danger"
            return (
                <Chip color={color} variant="flat" size="sm">
                    {project.state ? "Activo" : "Inactivo"}
                </Chip>
            )
        },
    },
    {
        key: "dependency",
        label: "Dependencia",
        render: (project) => project.dependency?.name ?? "N/A",
    }
]

export default function FinancialProjectsPage() {
    // Permissions
    // Not explicitly defined in permission path, likely "/financial/projects" or needs to be added
    // For now using a likely path, user might need to grant permission later
    const { canRead } = usePermissions("/financial/projects")

    // Data State
    const [items, setItems] = useState<Project[]>([])
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

    // Selection State
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)

    const fetchProjects = useCallback(async () => {
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

            const result = await get<PaginatedData<Project>>(`${endpoints.financial.projects}?${params}`)
            setItems(result.data)
            setMeta(result.meta)
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : (e.message ?? "Error al cargar proyectos")
            setError(message)
        } finally {
            setLoading(false)
        }
    }, [page, search, limit, sortDescriptor])

    useEffect(() => {
        fetchProjects()
    }, [fetchProjects])

    useEffect(() => {
        setSearch(debouncedSearch)
        setPage(1)
    }, [debouncedSearch])

    const onViewDetails = async (project: Project) => {
        try {
            const freshProject = await get<Project>(`${endpoints.financial.projects}/${project.id}`)
            setSelectedProject(freshProject)
            setIsDetailModalOpen(true)
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al cargar detalles del proyecto"
            addToast({ title: message, color: "danger" })
        }
    }

    const rowActions: RowAction<Project>[] = useMemo(() => {
        const actions: RowAction<Project>[] = []
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
                onClick: fetchProjects,
            },
        ]
    }, [fetchProjects])

    return (
        <div className="grid gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Inicio</BreadcrumbItem>
                <BreadcrumbItem>Financiero</BreadcrumbItem>
                <BreadcrumbItem>Proyectos</BreadcrumbItem>
            </Breadcrumbs>

            {!canRead ? (
                <div className="text-center py-16">
                    <p className="text-xl font-semibold text-danger">Acceso Denegado</p>
                    <p className="text-default-500 mt-2">No tienes permisos para ver este módulo.</p>
                </div>
            ) : error ? (
                <div className="text-center py-8 text-danger">
                    <p>{error}</p>
                    <Button variant="flat" className="mt-2" onPress={fetchProjects}>
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
                    searchPlaceholder="Buscar proyectos..."
                    ariaLabel="Tabla de proyectos financieros"
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

            <ProjectDetailModal
                isOpen={isDetailModalOpen}
                project={selectedProject}
                onClose={() => {
                    setIsDetailModalOpen(false)
                    setSelectedProject(null)
                }}
            />
        </div>
    )
}
