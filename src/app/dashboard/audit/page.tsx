"use client"

import { Button, Breadcrumbs, BreadcrumbItem } from "@heroui/react"
import { usePermissions } from "@/hooks/usePermissions"
import { useInfiniteAuditLogs } from "@/hooks/useInfiniteAuditLogs"
import { useState } from "react"
import type { AuditLog } from "@/types/audit"
import { AuditTimeline } from "@/components/audit/AuditTimeline"
import { AuditLogDetailModal } from "@/components/modals/audit/AuditLogDetailModal"
import { getErrorMessage } from "@/lib/error-codes"

export default function AuditPage() {
  // Permissions
  const { canRead } = usePermissions("/audit")

  // Infinite scroll hook with filters
  const {
    logs,
    meta,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    filters,
    setFilters,
    resetFilters,
  } = useInfiniteAuditLogs()

  // Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  const onViewDetail = (log: AuditLog) => {
    setSelectedLog(log)
    setIsDetailModalOpen(true)
  }

  const errorMessage = error 
    ? getErrorMessage((error as any).data?.errors?.code) || error.message 
    : null

  return (
    <div className="grid gap-6">
      <Breadcrumbs>
        <BreadcrumbItem>Inicio</BreadcrumbItem>
        <BreadcrumbItem>Auditoría</BreadcrumbItem>
      </Breadcrumbs>

      {!canRead ? (
        <div className="text-center py-16">
          <p className="text-xl font-semibold text-danger">Acceso Denegado</p>
          <p className="text-default-500 mt-2">No tienes permisos para ver este módulo.</p>
        </div>
      ) : errorMessage ? (
        <div className="text-center py-8 text-danger">
          <p>{errorMessage}</p>
          <Button variant="flat" className="mt-2" onPress={refresh}>
            Reintentar
          </Button>
        </div>
      ) : (
        <AuditTimeline
          logs={logs}
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          meta={meta}
          hasMore={hasMore}
          onLogClick={onViewDetail}
          onLoadMore={loadMore}
          filters={filters}
          onFiltersChange={setFilters}
          onResetFilters={resetFilters}
          onRefresh={refresh}
        />
      )}

      <AuditLogDetailModal
        log={selectedLog}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false)
          setSelectedLog(null)
        }}
      />
    </div>
  )
}
