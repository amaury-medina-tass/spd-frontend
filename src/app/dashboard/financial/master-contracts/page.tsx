"use client"

import { Breadcrumbs, BreadcrumbItem, Chip } from "@heroui/react"
import { useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction } from "@/components/tables/DataTable"
import { usePermissions } from "@/hooks/usePermissions"
import { useDataTable } from "@/hooks/useDataTable"
import { MasterContractDetailModal } from "@/components/modals/financial/contracts/MasterContractDetailModal"
import { get, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Eye, Briefcase } from "lucide-react"
import { buildBaseTopActions } from "@/components/tables/tableActions"
import { addToast } from "@heroui/toast"
import type { MasterContract } from "@/types/financial"
import { getErrorMessage } from "@/lib/error-codes"
import { MasterContractCdpsModal } from "@/components/modals/financial/contracts/MasterContractCdpsModal"
import { formatCurrency } from "@/lib/format-utils"
import { TruncatedCell } from "@/components/tables/TruncatedCell"
import { TableErrorView, AccessDeniedView } from "@/components/tables/TableStatusViews"

const columns: ColumnDef<MasterContract>[] = [
    { key: "number", label: "Número", sortable: true },
    {
        key: "object",
        label: "Objeto",
        sortable: true,
        render: (contract) => <TruncatedCell text={contract.object} />,
    },
    {
        key: "totalValue",
        label: "Valor Total",
        sortable: true,
        render: (contract) => (
            <span className="font-medium">{formatCurrency(contract.totalValue)}</span>
        ),
    },
    {
        key: "state",
        label: "Estado",
        sortable: true,
        render: (contract) => {
            const stateLower = contract.state.toLowerCase()
            const isExecution = stateLower === "en ejecución"

            let color: "success" | "warning" | "danger" | "default" = "default"
            if (stateLower === "legalizado" || stateLower === "active") color = "success"
            else if (stateLower === "pendiente" || stateLower === "pending") color = "warning"

            return (
                <Chip
                    color={isExecution ? "default" : color}
                    variant="flat"
                    size="sm"
                    className={isExecution ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400" : ""}
                >
                    {contract.state}
                </Chip>
            )
        },
    },
    {
        key: "contractor.name",
        label: "Contratista",
        sortable: true,
        render: (contract) => contract.contractor.name,
    },
    {
        key: "startDate",
        label: "Fecha Inicio",
        sortable: false,
        render: (contract) => new Date(contract.startDate).toLocaleDateString("es-CO"),
    },
    {
        key: "createAt",
        label: "Creado",
        sortable: true,
        render: (contract) => new Date(contract.createAt).toLocaleString(),
    },
    {
        key: "updateAt",
        label: "Actualizado",
        sortable: true,
        render: (contract) => new Date(contract.updateAt).toLocaleString(),
    },
]

export default function MasterContractsPage() {
    const { canRead } = usePermissions("/financial/master-contracts")

    // Modal State
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedContract, setSelectedContract] = useState<MasterContract | null>(null)
    const [isCdpsModalOpen, setIsCdpsModalOpen] = useState(false)
    const [selectedContractForCdps, setSelectedContractForCdps] = useState<MasterContract | null>(null)

    const {
        items, loading, error, searchInput, setSearchInput,
        sortDescriptor, setSortDescriptor, fetchData, exporting, handleExport, paginationProps,
    } = useDataTable<MasterContract>({
        fetchFn: (qs) => get<PaginatedData<MasterContract>>(`${endpoints.financial.masterContracts}?${qs}`),
        defaultSort: { column: "totalValue", direction: "descending" },
        defaultLimit: 5,
        errorMessage: "Error al cargar contratos marco",
        exportConfig: { system: "SPD", type: "CONTRACTS" },
        useErrorCodes: true,
    })

    const onViewDetails = async (contract: MasterContract) => {
        try {
            // Fetch fresh details if needed, or use existing. Recommended to fetch.
            const freshContract = await get<MasterContract>(`${endpoints.financial.masterContracts}/${contract.id}`)
            setSelectedContract(freshContract)
            setIsDetailModalOpen(true)
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al cargar detalles del contrato"
            addToast({ title: message, color: "danger" })
        }
    }

    const rowActions: RowAction<MasterContract>[] = useMemo(() => {
        const actions: RowAction<MasterContract>[] = []
        if (canRead) {
            actions.push({
                key: "view",
                label: "Ver Detalles",
                icon: <Eye size={16} />,
                onClick: (item) => void onViewDetails(item),
            }, {
                key: "view-cdps",
                label: "Ver CDPs",
                icon: <Briefcase size={16} />,
                onClick: (contract) => {
                    setSelectedContractForCdps(contract)
                    setIsCdpsModalOpen(true)
                },
            })
        }
        return actions
    }, [canRead])

    const topActions: TopAction[] = useMemo(
        () => buildBaseTopActions(fetchData, handleExport, exporting, "Exportar Contratos"),
        [fetchData, handleExport, exporting]
    )

    return (
        <div className="grid gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Inicio</BreadcrumbItem>
                <BreadcrumbItem>Financiero</BreadcrumbItem>
                <BreadcrumbItem>Contratos Marco</BreadcrumbItem>
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
                    searchPlaceholder="Buscar contratos marco..."
                    ariaLabel="Tabla de contratos marco"
                    pagination={paginationProps}
                    sortDescriptor={sortDescriptor}
                    onSortChange={setSortDescriptor}
                />
            )}
            {!canRead && (
                <AccessDeniedView />
            )}

            <MasterContractDetailModal
                isOpen={isDetailModalOpen}
                contract={selectedContract}
                onClose={() => {
                    setIsDetailModalOpen(false)
                    setSelectedContract(null)
                }}
            />

            <MasterContractCdpsModal
                isOpen={isCdpsModalOpen}
                masterContractId={selectedContractForCdps?.id || null}
                masterContractNumber={selectedContractForCdps?.number || null}
                onClose={() => {
                    setIsCdpsModalOpen(false)
                    setSelectedContractForCdps(null)
                }}
            />
        </div>
    )
}
