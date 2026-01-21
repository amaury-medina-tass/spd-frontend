"use client"

import { Button, Breadcrumbs, BreadcrumbItem, SortDescriptor } from "@heroui/react"
import { useCallback, useEffect, useState } from "react"
import { DataTable, ColumnDef, RowAction } from "@/components/tables/DataTable"
import { useDebounce } from "@/hooks/useDebounce"
import { get, PaginatedData, PaginationMeta } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { RefreshCw, Eye } from "lucide-react"
import type { CdpTableRow, CdpPositionDetail } from "@/types/cdp"
import { getErrorMessage } from "@/lib/error-codes"
import { CdpPositionDetailModal } from "@/components/modals/financial/CdpPositionDetailModal"

const columns: ColumnDef<CdpTableRow>[] = [
  { key: "cdpNumber", label: "N° CDP", sortable: true },
  { 
    key: "cdpTotalValue", 
    label: "Valor Total CDP", 
    sortable: true,
    render: (row) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(row.cdpTotalValue),
  },
  { key: "projectCode", label: "Código Proyecto", sortable: true },
  { key: "rubricCode", label: "Posición Presupuestal", sortable: true },
  { key: "positionNumber", label: "N° Posición", sortable: true },
  { 
    key: "positionValue", 
    label: "Valor Posición", 
    sortable: true,
    render: (row) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(row.positionValue),
  },
  { key: "needCode", label: "Código Necesidad", sortable: true },
  { key: "fundingSourceName", label: "Origen Presupuesto", sortable: true },
  { key: "fundingSourceCode", label: "Fondo", sortable: true },
  { key: "observations", label: "Observaciones", sortable: false },
]

export default function FinancialCdpsPage() {
  // Data State
  const [items, setItems] = useState<CdpTableRow[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Detail Modal State
  const [selectedPosition, setSelectedPosition] = useState<CdpPositionDetail | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Filter & Pagination State
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [limit, setLimit] = useState(5)
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "cdpNumber",
    direction: "ascending",
  })
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebounce(searchInput, 400)

  const fetchCdps = useCallback(async () => {
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
        params.set("sortBy", `cdp.${sortDescriptor.column}`)
        params.set("sortOrder", sortDescriptor.direction === "ascending" ? "ASC" : "DESC")
      }

      const result = await get<PaginatedData<CdpTableRow>>(`${endpoints.financial.cdpsTable}?${params}`)
      setItems(result.data)
      setMeta(result.meta)
    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : (e.message ?? "Error al cargar CDPs")
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [page, search, limit, sortDescriptor])

  const fetchPositionDetail = async (id: string) => {
    try {
      const result = await get<CdpPositionDetail>(endpoints.financial.cdpPositionDetail(id))
      setSelectedPosition(result)
      setIsDetailModalOpen(true)
    } catch (e: any) {
        const errorCode = e.data?.errors?.code
        const message = errorCode ? getErrorMessage(errorCode) : (e.message ?? "Error al cargar detalle")
        console.error(message)
    }
  }

  useEffect(() => {
    fetchCdps()
  }, [fetchCdps])

  useEffect(() => {
    setSearch(debouncedSearch)
    setPage(1)
  }, [debouncedSearch])

  const rowActions: RowAction<CdpTableRow>[] = [
    {
        key: "view",
        label: "Ver Detalle",
        icon: <Eye size={18} />,
        onClick: (item) => fetchPositionDetail(item.id),
    },
  ]

  return (
    <div className="grid gap-4">
      <Breadcrumbs>
        <BreadcrumbItem>Inicio</BreadcrumbItem>
        <BreadcrumbItem>Financiero</BreadcrumbItem>
        <BreadcrumbItem>CDPs</BreadcrumbItem>
      </Breadcrumbs>

      {error ? (
        <div className="text-center py-8 text-danger">
          <p>{error}</p>
          <Button variant="flat" className="mt-2" onPress={fetchCdps}>
            Reintentar
          </Button>
        </div>
      ) : (
        <DataTable
          items={items}
          columns={columns}
          isLoading={loading}
          topActions={[
            {
              key: "refresh",
              label: "Actualizar",
              icon: <RefreshCw size={16} />,
              color: "default",
              onClick: fetchCdps,
            },
          ]}
          rowActions={rowActions}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Buscar CDPs..."
          ariaLabel="Tabla de CDPs"
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

      <CdpPositionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        position={selectedPosition}
      />
    </div>
  )
}
