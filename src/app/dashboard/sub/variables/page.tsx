"use client"

import { Breadcrumbs, BreadcrumbItem } from "@heroui/react"
import { useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction } from "@/components/tables/DataTable"
import { getMyVariables } from "@/services/sub/variables.service"
import { Variable } from "@/types/masters/variables"
import { BarChart3 } from "lucide-react"
import { buildBaseTopActions } from "@/components/tables/tableActions"
import { VariableDashboardModal } from "@/components/modals/sub/variables/VariableDashboardModal"
import { useDataTable } from "@/hooks/useDataTable"
import { TableErrorView } from "@/components/tables/TableStatusViews"

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
    // Modal State
    const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false)
    const [selectedVariable, setSelectedVariable] = useState<Variable | null>(null)

    const {
        items, loading, error, searchInput, setSearchInput,
        sortDescriptor, setSortDescriptor, fetchData, exporting, handleExport, paginationProps,
    } = useDataTable<Variable>({
        fetchFn: (qs) => getMyVariables(qs),
        defaultSort: { column: "name", direction: "ascending" },
        errorMessage: "Error al cargar variables",
        exportConfig: { system: "SPD", type: "VARIABLES" },
    })

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

    const topActions: TopAction[] = useMemo(
        () => buildBaseTopActions(fetchData, handleExport, exporting, "Exportar Variables"),
        [fetchData, handleExport, exporting]
    )

    return (
        <div className="grid gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Inicio</BreadcrumbItem>
                <BreadcrumbItem>Sub</BreadcrumbItem>
                <BreadcrumbItem>Variables</BreadcrumbItem>
            </Breadcrumbs>

            {error ? (
                <TableErrorView error={error} onRetry={fetchData} />
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
                    pagination={paginationProps}
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
