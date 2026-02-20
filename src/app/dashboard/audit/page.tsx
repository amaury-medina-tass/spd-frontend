"use client"

import { Button, Breadcrumbs, BreadcrumbItem, Tabs, Tab } from "@heroui/react"
import { usePermissions } from "@/hooks/usePermissions"
import { useAuth } from "@/components/auth/useAuth"
import { useInfiniteAuditLogs } from "@/hooks/useInfiniteAuditLogs"
import { useState, useCallback, Key } from "react"
import type { AuditLog } from "@/types/audit"
import { AuditTimeline } from "@/components/audit/AuditTimeline"
import { AuditLogDetailModal } from "@/components/modals/audit/AuditLogDetailModal"
import { getErrorMessage } from "@/lib/error-codes"
import { ShieldCheck, Server } from "lucide-react"

type AuditTab = "AUTH" | "SPD"

export default function AuditPage() {
  const { me } = useAuth()
  const { canRead } = usePermissions("/audit")

  // Active tab state
  const [activeTab, setActiveTab] = useState<AuditTab>("AUTH")

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
  } = useInfiniteAuditLogs({ system: activeTab })

  // Modal State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  const onViewDetail = (log: AuditLog) => {
    setSelectedLog(log)
    setIsDetailModalOpen(true)
  }

  const handleTabChange = useCallback((key: Key) => {
    setActiveTab(key as AuditTab)
  }, [])

  const errorMessage = error 
    ? getErrorMessage((error as any).data?.errors?.code) || error.message 
    : null

  const canViewCoreSPD = me?.system === "SPD"

  return (
    <div className="grid gap-6">
      <Breadcrumbs>
        <BreadcrumbItem>Inicio</BreadcrumbItem>
        <BreadcrumbItem>Auditoría</BreadcrumbItem>
      </Breadcrumbs>

      {canRead ? (
        <>
          <Tabs
            aria-label="Tipo de auditoría"
            selectedKey={activeTab}
            onSelectionChange={handleTabChange}
            variant="underlined"
            color="primary"
            classNames={{
              tabList: "gap-6",
            }}
          >
            <Tab
              key="AUTH"
              title={
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} />
                  <span>Autenticación</span>
                </div>
              }
            />
            {canViewCoreSPD && (
              <Tab
                key="SPD"
                title={
                  <div className="flex items-center gap-2">
                    <Server size={16} />
                    <span>Core SPD</span>
                  </div>
                }
              />
            )}
          </Tabs>

          {errorMessage ? (
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
        </>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl font-semibold text-danger">Acceso Denegado</p>
          <p className="text-default-500 mt-2">No tienes permisos para ver este módulo.</p>
        </div>
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
