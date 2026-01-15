"use client"

import { AuditLog } from "@/types/audit"
import { getActionColor, getEntityTypeLabel } from "@/lib/audit-codes"
import { ChevronRight, Copy, Check } from "lucide-react"
import { addToast, Tooltip } from "@heroui/react"
import { useState } from "react"

interface AuditTimelineItemProps {
  log: AuditLog
  onClick?: (log: AuditLog) => void
  isLast?: boolean
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Ahora"
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`

  return date.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
  })
}

const DOT_COLORS: Record<string, string> = {
  success: "bg-success-500",
  danger: "bg-danger-500",
  warning: "bg-warning-500",
  primary: "bg-primary-500",
  secondary: "bg-default-400",
  default: "bg-default-400",
}

export function AuditTimelineItem({ log, onClick, isLast = false }: AuditTimelineItemProps) {
  const actionColor = getActionColor(log.action)
  const dotColor = DOT_COLORS[actionColor] || DOT_COLORS.default

  // Build detail text based on what data we have
  const getDetailText = (): string | null => {
    // For changes, show what changed
    if (log.changes && log.changes.length > 0) {
      const change = log.changes[0]
      if (log.changes.length === 1) {
        return `${change.fieldLabel}: ${change.oldValue} → ${change.newValue}`
      }
      return `${log.changes.length} campos modificados`
    }

    // For permissions
    if (log.metadata) {
      if (log.metadata.added && log.metadata.addedIds) {
        const ids = log.metadata.addedIds as string[]
        if (ids.length <= 2) {
          return ids.join(", ")
        }
        return `${ids[0]}, ${ids[1]} y ${ids.length - 2} más`
      }
      if (log.metadata.removed && log.metadata.removedIds) {
        const ids = log.metadata.removedIds as string[]
        if (ids.length <= 2) {
          return ids.join(", ")
        }
        return `${ids[0]}, ${ids[1]} y ${ids.length - 2} más`
      }
      // Show email if available
      if (log.metadata.email) {
        return log.metadata.email as string
      }
    }

    return null
  }

  const detailText = getDetailText()

  return (
    <div
      className="flex gap-3 group cursor-pointer hover:bg-default-100/50 rounded-md py-2.5 px-2 -mx-2 transition-colors"
      onClick={() => onClick?.(log)}
    >
      {/* Timeline dot and line */}
      <div className="flex flex-col items-center pt-1.5 flex-shrink-0">
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
        {!isLast && (
          <div className="w-px flex-1 bg-default-200 mt-1.5" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pb-3">
        {/* Main row */}
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            {/* Action + Entity */}
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="font-medium text-default-900">
                {log.actionLabel}
              </span>
              <span className="text-default-500">en</span>
              <span className="text-default-700">
                {getEntityTypeLabel(log.entityType)}
              </span>
              <span className="font-medium text-default-800 truncate">
                "{log.entityName || log.entityId}"
              </span>
            </div>

            {/* Detail text - show changes or permissions */}
            {detailText && (
              <div className="text-small text-default-500 mt-0.5 truncate">
                {detailText}
              </div>
            )}

            {/* Time */}
            <div className="text-tiny text-default-400 mt-1 flex items-center gap-2">
              <span>{formatRelativeTime(log.timestamp)}</span>
              {!log.success && (
                <span className="text-danger">• Fallido</span>
              )}

              {/* Copy ID Button - Visible on hover */}
              <CopyIdButton id={log.id} />
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight
            size={16}
            className="text-default-300 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity mt-0.5"
          />
        </div>
      </div>
    </div>
  )
}

function CopyIdButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(id)
    setCopied(true)
    addToast({
      title: "ID copiado",
      color: "success",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Tooltip content="Copiar ID del registro" delay={0} closeDelay={0}>
      <button
        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-default-200 rounded-full text-default-400 hover:text-default-600 focus:opacity-100"
        onClick={(e) => {
          e.stopPropagation()
          handleCopy()
        }}
        aria-label="Copiar ID del registro"
      >
        {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
      </button>
    </Tooltip>
  )
}
