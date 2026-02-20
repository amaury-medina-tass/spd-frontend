"use client"

import { Breadcrumbs, BreadcrumbItem, Chip } from "@heroui/react"
import { useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction } from "@/components/tables/DataTable"
import { usePermissions } from "@/hooks/usePermissions"
import { useDataTable } from "@/hooks/useDataTable"
import { NeedDetailModal } from "@/components/modals/financial/needs/NeedDetailModal"
import { NeedCdpPositionsModal } from "@/components/modals/financial/needs/NeedCdpPositionsModal"
import { get, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Eye, Layers } from "lucide-react"
import { buildBaseTopActions } from "@/components/tables/tableActions"
import { addToast } from "@heroui/toast"
import type { FinancialNeed } from "@/types/financial"
import { getErrorMessage } from "@/lib/error-codes"
import { formatCurrency } from "@/lib/format-utils"
import { TruncatedCell } from "@/components/tables/TruncatedCell"
import { TableErrorView, AccessDeniedView } from "@/components/tables/TableStatusViews"

const columns: ColumnDef<FinancialNeed>[] = [
    { key: "code", label: "Código", sortable: true },
    {
        key: "amount",
        label: "Monto",
        sortable: true,
        render: (need) => (
            <span className="font-medium">{formatCurrency(need.amount)}</span>
        ),
    },
    {
        key: "description",
        label: "Descripción",
        sortable: true,
        render: (need) => <TruncatedCell text={need.description} />,
    },
    {
        key: "previousStudy.code",
        label: "Código Estudio",
        sortable: true,
        render: (need) => need.previousStudy?.code ?? "N/A",
    },
    {
        key: "previousStudy.status",
        label: "Estado Estudio",
        sortable: true,
        render: (need) => {
            const status = need.previousStudy?.status ?? "N/A"
            const statusLower = status.toLowerCase()
            let color: "success" | "warning" | "danger" | "default" = "default"
            if (statusLower === "aprobado" || statusLower === "approved") color = "success"
            else if (statusLower === "pendiente" || statusLower === "pending") color = "warning"
            else if (statusLower === "rechazado" || statusLower === "rejected") color = "danger"

            return (
                <Chip color={color} variant="flat" size="sm">
                    {status}
                </Chip>
            )
        },
    },
    {
        key: "createAt",
        label: "Creado",
        sortable: true,
        render: (need) => new Date(need.createAt).toLocaleString(),
    },
    {
        key: "updateAt",
        label: "Actualizado",
        sortable: true,
        render: (need) => new Date(need.updateAt).toLocaleString(),
    },
]

export default function FinancialNeedsPage() {
    const { canRead } = usePermissions("/financial/needs")

    // Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [isPositionsModalOpen, setIsPositionsModalOpen] = useState(false)
    const [selectedNeed, setSelectedNeed] = useState<FinancialNeed | null>(null)
    const [selectedNeedIdForPositions, setSelectedNeedIdForPositions] = useState<string | null>(null)

    const {
        items, loading, error, searchInput, setSearchInput,
        sortDescriptor, setSortDescriptor, fetchData, exporting, handleExport, paginationProps,
    } = useDataTable<FinancialNeed>({
        fetchFn: (qs) => get<PaginatedData<FinancialNeed>>(`${endpoints.financial.needs}?${qs}`),
        defaultSort: { column: "createAt", direction: "descending" },
        defaultLimit: 5,
        errorMessage: "Error al cargar necesidades",
        exportConfig: { system: "SPD", type: "NEEDS" },
        useErrorCodes: true,
    })

    const onViewDetails = async (need: FinancialNeed) => {
        try {
            const freshNeed = await get<FinancialNeed>(`${endpoints.financial.needs}/${need.id}`)
            setSelectedNeed(freshNeed)
            setIsDetailModalOpen(true)
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al cargar detalles de la necesidad"
            addToast({ title: message, color: "danger" })
        }
    }

    const onViewPositions = (need: FinancialNeed) => {
        setSelectedNeedIdForPositions(need.id)
        setIsPositionsModalOpen(true)
    }

    const rowActions: RowAction<FinancialNeed>[] = useMemo(() => {
        const actions: RowAction<FinancialNeed>[] = []
        if (canRead) {
            actions.push({
                key: "view",
                label: "Ver Detalles",
                icon: <Eye size={16} />,
                onClick: (item) => void onViewDetails(item),
            }, {
                key: "positions",
                label: "Ver Posiciones CDP",
                icon: <Layers size={16} />,
                onClick: onViewPositions,
            })
        }
        return actions
    }, [canRead])

    const topActions: TopAction[] = useMemo(
        () => buildBaseTopActions(fetchData, handleExport, exporting, "Exportar Necesidades"),
        [fetchData, handleExport, exporting]
    )

    return (
        <div className="grid gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Inicio</BreadcrumbItem>
                <BreadcrumbItem>Financiero</BreadcrumbItem>
                <BreadcrumbItem>Necesidades</BreadcrumbItem>
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
                    searchPlaceholder="Buscar necesidades..."
                    ariaLabel="Tabla de necesidades financieras"
                    pagination={paginationProps}
                    sortDescriptor={sortDescriptor}
                    onSortChange={setSortDescriptor}
                />
            )}
            {!canRead && (
                <AccessDeniedView />
            )}

            <NeedDetailModal
                isOpen={isDetailModalOpen}
                need={selectedNeed}
                onClose={() => {
                    setIsDetailModalOpen(false)
                    setSelectedNeed(null)
                }}
            />

            <NeedCdpPositionsModal
                isOpen={isPositionsModalOpen}
                needId={selectedNeedIdForPositions}
                onClose={() => {
                    setIsPositionsModalOpen(false)
                    setSelectedNeedIdForPositions(null)
                }}
            />
        </div>
    )
}

