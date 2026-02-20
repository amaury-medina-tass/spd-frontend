"use client"

import { useEffect, useRef, useCallback } from "react"
import { Spinner, Button, Input, Chip, Select, SelectItem, DateRangePicker } from "@heroui/react"
import { AuditLog } from "@/types/audit"
import { AuditTimelineItem } from "./AuditTimelineItem"
import { PaginationMeta } from "@/lib/http"
import { AuditFilters } from "@/hooks/useInfiniteAuditLogs"
import { AuditActions, ACTION_LABELS, AuditEntityTypes, ENTITY_TYPE_LABELS } from "@/lib/audit-codes"
import { FileText, Search, RefreshCw, Loader2, X, ArrowUpDown } from "lucide-react"
import { parseDate, CalendarDate } from "@internationalized/date"

interface AuditTimelineProps {
  logs: AuditLog[]
  isLoading: boolean
  isLoadingMore?: boolean
  meta: PaginationMeta | null
  hasMore?: boolean
  onLogClick?: (log: AuditLog) => void
  onLoadMore?: () => void
  filters: AuditFilters
  onFiltersChange: (filters: Partial<AuditFilters>) => void
  onResetFilters?: () => void
  onRefresh?: () => void
}

const ACTION_OPTIONS = [
  { key: "", label: "Todas las acciones" },
  ...Object.values(AuditActions).map(action => ({
    key: action,
    label: ACTION_LABELS[action] || action,
  })),
]

const ENTITY_OPTIONS = [
  { key: "", label: "Todos los tipos" },
  ...Object.values(AuditEntityTypes).map(type => ({
    key: type,
    label: ENTITY_TYPE_LABELS[type] || type,
  })),
]

const SORT_OPTIONS = [
  { key: "timestamp", label: "Fecha" },
  { key: "action", label: "Acción" },
  { key: "entityType", label: "Tipo" },
]

export function AuditTimeline({
  logs,
  isLoading,
  isLoadingMore = false,
  meta,
  hasMore = false,
  onLogClick,
  onLoadMore,
  filters,
  onFiltersChange,
  onResetFilters,
  onRefresh,
}: Readonly<AuditTimelineProps>) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // Infinite scroll observer
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries
    if (entry.isIntersecting && hasMore && !isLoadingMore && !isLoading && onLoadMore) {
      onLoadMore()
    }
  }, [hasMore, isLoadingMore, isLoading, onLoadMore])

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px",
      threshold: 0.1,
    })

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [handleObserver])

  const hasActiveFilters = filters.search || filters.action || filters.entityType || 
    filters.system || filters.startDate || filters.endDate

  // Parse dates for DateRangePicker
  const dateRangeValue = filters.startDate && filters.endDate ? {
    start: parseDate(filters.startDate.split("T")[0]),
    end: parseDate(filters.endDate.split("T")[0]),
  } : null

  const handleDateRangeChange = (range: { start: CalendarDate; end: CalendarDate } | null) => {
    if (range) {
      onFiltersChange({
        startDate: range.start.toString() + "T00:00:00.000Z",
        endDate: range.end.toString() + "T23:59:59.999Z",
      })
    } else {
      onFiltersChange({ startDate: "", endDate: "" })
    }
  }

  const toggleSortOrder = () => {
    onFiltersChange({ sortOrder: filters.sortOrder === "ASC" ? "DESC" : "ASC" })
  }

  // Initial loading state
  if (isLoading && logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner size="lg" color="primary" />
        <p className="text-default-500 mt-4">Cargando registros...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters - Row 1 */}
      <div className="flex flex-wrap items-end gap-3 pb-2">
        {/* Search */}
        <Input
          placeholder="Buscar..."
          size="sm"
          className="w-full sm:w-64"
          value={filters.search}
          onValueChange={(value) => onFiltersChange({ search: value })}
          startContent={<Search size={16} className="text-default-400" />}
          isClearable
          onClear={() => onFiltersChange({ search: "" })}
        />

        {/* Action filter */}
        <Select
          aria-label="Filtrar por acción"
          placeholder="Acción"
          size="sm"
          className="w-48"
          selectedKeys={filters.action ? [filters.action] : []}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string
            onFiltersChange({ action: value || "" })
          }}
        >
          {ACTION_OPTIONS.map((opt) => (
            <SelectItem key={opt.key}>{opt.label}</SelectItem>
          ))}
        </Select>

        {/* Entity type filter */}
        <Select
          aria-label="Filtrar por tipo de entidad"
          placeholder="Tipo"
          size="sm"
          className="w-44"
          selectedKeys={filters.entityType ? [filters.entityType] : []}
          onSelectionChange={(keys) => {
            const value = Array.from(keys)[0] as string
            onFiltersChange({ entityType: value || "" })
          }}
        >
          {ENTITY_OPTIONS.map((opt) => (
            <SelectItem key={opt.key}>{opt.label}</SelectItem>
          ))}
        </Select>
      </div>

      {/* Filters - Row 2 */}
      <div className="flex flex-wrap items-end gap-3 pb-4 border-b border-default-200">
        {/* Date range */}
        <DateRangePicker
          aria-label="Rango de fechas"
          size="sm"
          className="w-64"
          value={dateRangeValue}
          onChange={handleDateRangeChange}
          granularity="day"
        />

        {/* Sort */}
        <div className="flex items-center gap-1">
          <Select
            aria-label="Ordenar por"
            placeholder="Ordenar por"
            size="sm"
            className="w-32"
            selectedKeys={filters.sortBy ? [filters.sortBy] : ["timestamp"]}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as string
              onFiltersChange({ sortBy: value || "timestamp" })
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.key}>{opt.label}</SelectItem>
            ))}
          </Select>
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            onPress={toggleSortOrder}
            aria-label={filters.sortOrder === "ASC" ? "Orden ascendente" : "Orden descendente"}
          >
            <ArrowUpDown size={14} className={filters.sortOrder === "ASC" ? "rotate-180" : ""} />
          </Button>
        </div>

        {/* Reset & Refresh */}
        <div className="flex items-center gap-2 ml-auto">
          {hasActiveFilters && onResetFilters && (
            <Button
              size="sm"
              variant="flat"
              onPress={onResetFilters}
              startContent={<X size={14} />}
            >
              Limpiar
            </Button>
          )}
          {onRefresh && (
            <Button
              isIconOnly
              variant="flat"
              size="sm"
              onPress={onRefresh}
              isLoading={isLoading}
            >
              <RefreshCw size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      {meta && (
        <div className="flex items-center gap-2 text-small text-default-500">
          <Chip variant="flat" size="sm">{meta.total} registro{meta.total === 1 ? "" : "s"}</Chip>
          {filters.sortBy && (
            <span className="text-tiny">
              Ordenado por {SORT_OPTIONS.find(o => o.key === filters.sortBy)?.label?.toLowerCase()} ({filters.sortOrder === "ASC" ? "↑" : "↓"})
            </span>
          )}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && logs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-default-400">
          <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mb-4">
            <FileText size={32} className="opacity-50" />
          </div>
          <p className="text-lg font-medium text-default-600">Sin registros</p>
          <p className="text-small mt-1">No se encontraron logs de auditoría</p>
          {hasActiveFilters && onResetFilters && (
            <Button 
              variant="flat" 
              size="sm"
              className="mt-4"
              onPress={onResetFilters}
            >
              Limpiar filtros
            </Button>
          )}
        </div>
      )}

      {/* Timeline */}
      {logs.length > 0 && (
        <div className="relative pl-1">
          {logs.map((log, index) => (
            <AuditTimelineItem
              key={log.id}
              log={log}
              onClick={onLogClick}
              isLast={index === logs.length - 1 && !hasMore}
            />
          ))}

          {/* Load more trigger */}
          <div ref={loadMoreRef} className="py-2">
            {isLoadingMore && (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 size={16} className="animate-spin text-primary" />
                <span className="text-small text-default-500">Cargando más...</span>
              </div>
            )}
            
            {!hasMore && logs.length > 0 && (
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center gap-2 text-tiny text-default-400">
                  <div className="w-8 h-px bg-default-200" />
                  <span>Fin</span>
                  <div className="w-8 h-px bg-default-200" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
