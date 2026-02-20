"use client"

import { Breadcrumbs, BreadcrumbItem, Chip } from "@heroui/react"
import { useMemo } from "react"
import { DataTable, ColumnDef, TopAction } from "@/components/tables/DataTable"
import { usePermissions } from "@/hooks/usePermissions"
import { useDataTable } from "@/hooks/useDataTable"
import { get, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { buildBaseTopActions } from "@/components/tables/tableActions"
import type { PreviousStudy } from "@/types/financial"
import { TableErrorView, AccessDeniedView } from "@/components/tables/TableStatusViews"

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
    const { canRead } = usePermissions("/financial/previous-studies")

    const {
        items, loading, error, searchInput, setSearchInput,
        sortDescriptor, setSortDescriptor, fetchData, exporting, handleExport, paginationProps,
    } = useDataTable<PreviousStudy>({
        fetchFn: (qs) => get<PaginatedData<PreviousStudy>>(`${endpoints.financial.previousStudies}?${qs}`),
        defaultSort: { column: "createAt", direction: "descending" },
        defaultLimit: 5,
        errorMessage: "Error al cargar estudios previos",
        exportConfig: { system: "SPD", type: "PREVIOUS_STUDIES" },
        useErrorCodes: true,
    })

    const topActions: TopAction[] = useMemo(
        () => buildBaseTopActions(fetchData, handleExport, exporting, "Exportar Estudios Previos"),
        [fetchData, handleExport, exporting]
    )

    return (
        <div className="grid gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Inicio</BreadcrumbItem>
                <BreadcrumbItem>Financiero</BreadcrumbItem>
                <BreadcrumbItem>Estudios Previos</BreadcrumbItem>
            </Breadcrumbs>

            {canRead && error && (
                <TableErrorView error={error} onRetry={fetchData} />
            )}
            {canRead && !error && (
                <DataTable
                    items={items}
                    columns={columns}
                    isLoading={loading}
                    topActions={topActions}
                    searchValue={searchInput}
                    onSearchChange={setSearchInput}
                    searchPlaceholder="Buscar estudios previos..."
                    ariaLabel="Tabla de estudios previos"
                    pagination={paginationProps}
                    sortDescriptor={sortDescriptor}
                    onSortChange={setSortDescriptor}
                />
            )}
            {!canRead && (
                <AccessDeniedView />
            )}
        </div>
    )
}
