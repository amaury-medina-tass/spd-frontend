"use client"

import { Button, Breadcrumbs, BreadcrumbItem } from "@heroui/react"
import { useCallback, useEffect, useState } from "react"
import { DataTable, ColumnDef, RowAction, SortDescriptor } from "@/components/tables/DataTable"
import { useDebounce } from "@/hooks/useDebounce"
import { get, PaginatedData, PaginationMeta } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { RefreshCw, Eye, Link2, Download } from "lucide-react"
import { requestExport } from "@/services/exports.service"
import { addToast } from "@heroui/toast"
import type { CdpTableRow, CdpPositionDetail } from "@/types/cdp"
import { getErrorMessage } from "@/lib/error-codes"
import { CdpPositionDetailModal } from "@/components/modals/financial/cdp/CdpPositionDetailModal"
import { ManageCdpActivitiesModal } from "@/components/modals/financial/cdp/ManageCdpActivitiesModal"

const columns: ColumnDef<CdpTableRow>[] = [
  { key: "cdpNumber", label: "N° Cdp", sortable: true },
  {
    key: "cdpTotalValue",
    label: "Valor Total Cdp",
    sortable: false,
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
  { key: "fundingSourceName", label: "Origen Presupuesto", sortable: false },
  { key: "fundingSourceCode", label: "Fondo", sortable: false },
  { key: "observations", label: "Observaciones", sortable: false },
]

// Map frontend column keys to backend sort columns
const sortColumnMap: Record<string, string> = {
  cdpNumber: "cdp.number",
  positionNumber: "pos.positionNumber",
  positionValue: "pos.value",
  rubricCode: "r.code",
  projectCode: "p.code",
  needCode: "n.code",
}

export default function FinancialCdpsPage() {
  // Data State
  const [items, setItems] = useState<CdpTableRow[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Detail Modal State
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<CdpPositionDetail | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // Manage Activities Modal State
  const [isActivitiesModalOpen, setIsActivitiesModalOpen] = useState(false)
  const [selectedPositionForActivities, setSelectedPositionForActivities] = useState<CdpTableRow | null>(null)

  // Export State
  const [exporting, setExporting] = useState(false)

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

      if (sortDescriptor.column && sortColumnMap[sortDescriptor.column]) {
        params.set("sortBy", sortColumnMap[sortDescriptor.column])
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
      setSelectedPositionId(id)
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

  const handleExport = async () => {
    try {
      setExporting(true)
      await requestExport({ system: "SPD", type: "CDP" })
      addToast({
        title: "Exportación solicitada",
        description: "Recibirás una notificación cuando el archivo esté listo para descargar.",
        color: "primary",
        timeout: 5000,
      })
    } catch {
      addToast({
        title: "Error",
        description: "No se pudo solicitar la exportación. Intenta de nuevo.",
        color: "danger",
        timeout: 5000,
      })
    } finally {
      setExporting(false)
    }
  }

  const rowActions: RowAction<CdpTableRow>[] = [
    {
      key: "view",
      label: "Ver Detalle",
      icon: <Eye size={18} />,
      onClick: (item) => void fetchPositionDetail(item.id),
    },
    {
      key: "manage-activities",
      label: "Gestionar Actividades",
      icon: <Link2 size={18} />,
      onClick: (item) => {
        setSelectedPositionForActivities(item)
        setIsActivitiesModalOpen(true)
      },
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
          <Button variant="flat" className="mt-2" onPress={() => void fetchCdps()}>
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
              onClick: () => void fetchCdps(),
            },
            {
              key: "export",
              label: "Exportar CDPs",
              icon: <Download size={16} />,
              color: "primary",
              onClick: () => void handleExport(),
              isLoading: exporting,
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
        positionId={selectedPositionId}
        initialData={selectedPosition}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedPositionId(null)
          setSelectedPosition(null)
        }}
      />

      <ManageCdpActivitiesModal
        isOpen={isActivitiesModalOpen}
        positionId={selectedPositionForActivities?.id || null}
        positionNumber={selectedPositionForActivities?.positionNumber}
        onClose={() => {
          setIsActivitiesModalOpen(false)
          setSelectedPositionForActivities(null)
        }}
        onSuccess={fetchCdps}
      />
    </div>
  )
}
