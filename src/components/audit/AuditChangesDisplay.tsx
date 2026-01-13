"use client"

import { AuditLogChange } from "@/types/audit"
import { ArrowRight } from "lucide-react"

interface AuditChangesDisplayProps {
  changes: AuditLogChange[]
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—"
  if (typeof value === "boolean") return value ? "Sí" : "No"
  if (typeof value === "object") return JSON.stringify(value)
  return String(value)
}

export function AuditChangesDisplay({ changes }: AuditChangesDisplayProps) {
  if (!changes || changes.length === 0) {
    return (
      <div className="text-small text-default-400 italic">
        No hay cambios registrados
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {changes.map((change, index) => (
        <div
          key={`${change.field}-${index}`}
          className="p-3 bg-default-50 rounded-lg border border-default-200"
        >
          <div className="font-medium text-small mb-2 text-default-700">
            {change.fieldLabel || change.field}
          </div>
          <div className="flex items-center gap-3 text-small">
            <div className="flex-1 p-2 bg-danger-50 text-danger-600 rounded border border-danger-200">
              <span className="font-mono">{formatValue(change.oldValue)}</span>
            </div>
            <ArrowRight size={16} className="text-default-400 flex-shrink-0" />
            <div className="flex-1 p-2 bg-success-50 text-success-600 rounded border border-success-200">
              <span className="font-mono">{formatValue(change.newValue)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
