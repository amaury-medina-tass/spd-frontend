"use client"

import { Card, CardBody } from "@heroui/react"
import { AuditLog } from "@/types/audit"
import { AuditActionBadge, AuditEntityBadge } from "./AuditLogBadge"
import { Clock, Database } from "lucide-react"

interface AuditLogCardProps {
  log: AuditLog
  onClick?: (log: AuditLog) => void
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function AuditLogCard({ log, onClick }: Readonly<AuditLogCardProps>) {
  return (
    <Card
      isPressable={!!onClick}
      onPress={() => onClick?.(log)}
      className="w-full hover:bg-default-50 transition-colors"
    >
      <CardBody className="gap-3 p-4">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <AuditActionBadge action={log.action} actionLabel={log.actionLabel} />
            <AuditEntityBadge entityType={log.entityType} />
          </div>
          <div className="flex items-center gap-1 text-small text-default-400">
            <Clock size={14} />
            <span>{formatTimestamp(log.timestamp)}</span>
          </div>
        </div>

        {/* Entity info */}
        <div className="flex items-center gap-2">
          <Database size={16} className="text-default-400" />
          <span className="font-medium">{log.entityName}</span>
          <span className="text-small text-default-400">({log.entityType})</span>
        </div>

        {/* Changes preview if present */}
        {log.changes && log.changes.length > 0 && (
          <div className="text-small text-default-500">
            {log.changes.length} cambio{log.changes.length > 1 ? "s" : ""} realizado
            {log.changes.length > 1 ? "s" : ""}
          </div>
        )}

        {/* Metadata preview */}
        {log.metadata && Object.keys(log.metadata).length > 0 && (
          <div className="text-tiny text-default-400">
            {Object.keys(log.metadata).length} propiedades adicionales
          </div>
        )}
      </CardBody>
    </Card>
  )
}
