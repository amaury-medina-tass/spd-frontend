"use client"

import { Breadcrumbs, BreadcrumbItem, Chip } from "@heroui/react"
import { useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction } from "@/components/tables/DataTable"
import { usePermissions } from "@/hooks/usePermissions"
import { useDataTable } from "@/hooks/useDataTable"
import { ProjectDetailModal } from "@/components/modals/financial/projects/ProjectDetailModal"
import { get, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Eye } from "lucide-react"
import { buildBaseTopActions } from "@/components/tables/tableActions"
import { addToast } from "@heroui/toast"
import type { Project } from "@/types/financial"
import { getErrorMessage } from "@/lib/error-codes"
import { formatCurrency } from "@/lib/format-utils"
import { TableErrorView, AccessDeniedView } from "@/components/tables/TableStatusViews"

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
    const { canRead } = usePermissions("/financial/projects")

    // Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedProject, setSelectedProject] = useState<Project | null>(null)

    const {
        items, loading, error, searchInput, setSearchInput,
        sortDescriptor, setSortDescriptor, fetchData, exporting, handleExport, paginationProps,
    } = useDataTable<Project>({
        fetchFn: (qs) => get<PaginatedData<Project>>(`${endpoints.financial.projects}?${qs}`),
        defaultSort: { column: "createAt", direction: "descending" },
        defaultLimit: 5,
        errorMessage: "Error al cargar proyectos",
        exportConfig: { system: "SPD", type: "PROJECTS" },
        useErrorCodes: true,
    })

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
                onClick: (item) => void onViewDetails(item),
            })
        }
        return actions
    }, [canRead])

    const topActions: TopAction[] = useMemo(
        () => buildBaseTopActions(fetchData, handleExport, exporting, "Exportar Proyectos"),
        [fetchData, handleExport, exporting]
    )

    return (
        <div className="grid gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Inicio</BreadcrumbItem>
                <BreadcrumbItem>Financiero</BreadcrumbItem>
                <BreadcrumbItem>Proyectos</BreadcrumbItem>
            </Breadcrumbs>

            {canRead && error && (
                <TableErrorView error={error} onRetry={fetchData} />
            )}
            {canRead && !error && (
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
                    pagination={paginationProps}
                    sortDescriptor={sortDescriptor}
                    onSortChange={setSortDescriptor}
                />
            )}
            {!canRead && (
                <AccessDeniedView />
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
