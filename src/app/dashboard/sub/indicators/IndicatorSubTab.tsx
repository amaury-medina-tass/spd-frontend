"use client"

import { useMemo, useState } from "react"
import { DataTable, ColumnDef, TopAction, RowAction } from "@/components/tables/DataTable"
import { useDataTable } from "@/hooks/useDataTable"
import { PaginatedData } from "@/lib/http"
import { Calculator, BarChart3 } from "lucide-react"
import { buildBaseTopActions } from "@/components/tables/tableActions"
import { VariableAdvancesModal } from "@/components/modals/sub/VariableAdvancesModal"
import { IndicatorDashboardModal } from "@/components/modals/sub/IndicatorDashboardModal"

interface IndicatorSubTabProps<T extends { id: string; code: string }> {
    columns: ColumnDef<T>[]
    fetchFn: (query: string) => Promise<PaginatedData<T>>
    type: "action" | "indicative"
    ariaLabel: string
}

export function IndicatorSubTab<T extends { id: string; code: string }>({
    columns,
    fetchFn,
    type,
    ariaLabel,
}: Readonly<IndicatorSubTabProps<T>>) {
    const {
        items, loading, searchInput, setSearchInput,
        sortDescriptor, setSortDescriptor, fetchData,
        exporting, handleExport, paginationProps,
    } = useDataTable<T>({
        fetchFn,
        defaultSort: { column: "code", direction: "ascending" },
        exportConfig: { system: "SPD", type: "INDICATORS" },
    })

    // Modals
    const [isAdvancesModalOpen, setIsAdvancesModalOpen] = useState(false)
    const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false)
    const [selectedIndicator, setSelectedIndicator] = useState<T | null>(null)

    const topActions: TopAction[] = useMemo(
        () => buildBaseTopActions(fetchData, handleExport, exporting, "Exportar Indicadores"),
        [fetchData, handleExport, exporting]
    )

    const rowActions: RowAction<T>[] = useMemo(() => {
        return [
            {
                key: "dashboard",
                label: "Dashboard",
                icon: <BarChart3 size={16} />,
                onClick: (item) => {
                    setSelectedIndicator(item)
                    setIsDashboardModalOpen(true)
                },
            },
            {
                key: "advances",
                label: "Avances Variables",
                icon: <Calculator size={16} />,
                onClick: (item) => {
                    setSelectedIndicator(item)
                    setIsAdvancesModalOpen(true)
                },
            },
        ]
    }, [])

    return (
        <>
            <DataTable
                items={items}
                columns={columns}
                isLoading={loading}
                rowActions={rowActions}
                topActions={topActions}
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                searchPlaceholder="Buscar indicadores..."
                ariaLabel={ariaLabel}
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
                pagination={paginationProps}
            />

            <VariableAdvancesModal
                isOpen={isAdvancesModalOpen}
                onClose={() => setIsAdvancesModalOpen(false)}
                indicatorId={selectedIndicator?.id ?? null}
                indicatorCode={selectedIndicator?.code}
                type={type}
            />

            <IndicatorDashboardModal
                isOpen={isDashboardModalOpen}
                onClose={() => setIsDashboardModalOpen(false)}
                indicatorId={selectedIndicator?.id ?? null}
                indicatorCode={selectedIndicator?.code}
                type={type}
            />
        </>
    )
}
