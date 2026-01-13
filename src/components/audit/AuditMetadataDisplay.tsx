"use client"

import { Accordion, AccordionItem, Chip } from "@heroui/react"
import { Info, Plus, Minus } from "lucide-react"
import { getMetadataLabel } from "@/lib/audit-codes"

interface AuditMetadataDisplayProps {
  metadata: Record<string, unknown>
  defaultExpanded?: boolean
}

function formatMetadataValue(value: unknown): string {
  if (value === null || value === undefined) return "—"
  if (typeof value === "boolean") return value ? "Sí" : "No"
  if (typeof value === "object" && !Array.isArray(value)) return JSON.stringify(value, null, 2)
  return String(value)
}

function isArrayOfStrings(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
}

// Keys that should be rendered as lists
const LIST_KEYS = ["addedIds", "removedIds"]

// Keys that should be hidden if we have permission changes
const PERMISSION_SUMMARY_KEYS = ["added", "removed", "total"]

export function AuditMetadataDisplay({
  metadata,
  defaultExpanded = false,
}: AuditMetadataDisplayProps) {
  const entries = Object.entries(metadata)

  if (entries.length === 0) {
    return (
      <div className="text-small text-default-400 italic flex items-center gap-2">
        <Info size={14} />
        No hay metadatos adicionales
      </div>
    )
  }

  // Check if we have list data to show
  const addedIds = isArrayOfStrings(metadata.addedIds) ? metadata.addedIds : []
  const removedIds = isArrayOfStrings(metadata.removedIds) ? metadata.removedIds : []
  const hasAddedIds = addedIds.length > 0
  const hasRemovedIds = removedIds.length > 0
  const hasPermissionChanges = hasAddedIds || hasRemovedIds

  const addedCount = typeof metadata.added === "number" ? metadata.added : 0
  const removedCount = typeof metadata.removed === "number" ? metadata.removed : 0
  const totalCount = typeof metadata.total === "number" ? metadata.total : undefined

  // Filter entries for "other metadata"
  const otherEntries = entries.filter(([key]) => {
    if (LIST_KEYS.includes(key)) return false
    if (hasPermissionChanges && PERMISSION_SUMMARY_KEYS.includes(key)) return false
    return true
  })

  return (
    <div className="space-y-4">
      {/* Permission Changes Section */}
      {hasPermissionChanges && (
        <div className="space-y-3">
          <h4 className="font-medium text-default-700">Cambios de Permisos</h4>
          
          {/* Summary chips */}
          <div className="flex gap-2 flex-wrap">
            {addedCount > 0 && (
              <Chip color="success" variant="flat" size="sm" startContent={<Plus size={12} />}>
                {addedCount} agregado{addedCount !== 1 ? "s" : ""}
              </Chip>
            )}
            {removedCount > 0 && (
              <Chip color="warning" variant="flat" size="sm" startContent={<Minus size={12} />}>
                {removedCount} removido{removedCount !== 1 ? "s" : ""}
              </Chip>
            )}
            {totalCount !== undefined && (
              <Chip color="default" variant="bordered" size="sm">
                Total: {totalCount}
              </Chip>
            )}
          </div>

          {/* Added IDs */}
          {hasAddedIds && (
            <div className="p-3 bg-success-50 border border-success-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Plus size={14} className="text-success-600" />
                <span className="text-small font-medium text-success-700">
                  Permisos Agregados ({addedIds.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {addedIds.map((id) => (
                  <Chip key={id} size="sm" variant="flat" className="font-mono text-tiny">
                    {id}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {/* Removed IDs */}
          {hasRemovedIds && (
            <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Minus size={14} className="text-warning-600" />
                <span className="text-small font-medium text-warning-700">
                  Permisos Removidos ({removedIds.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                {removedIds.map((id) => (
                  <Chip key={id} size="sm" variant="flat" color="warning" className="font-mono text-tiny">
                    {id}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Other Metadata Accordion */}
      {otherEntries.length > 0 && (
        <Accordion
          defaultExpandedKeys={defaultExpanded && !hasPermissionChanges ? ["metadata"] : []}
          variant="bordered"
          className="p-0"
        >
          <AccordionItem
            key="metadata"
            aria-label="Metadatos"
            title={
              <div className="flex items-center gap-2">
                <span className="font-medium">{hasPermissionChanges ? "Otros Metadatos" : "Metadatos"}</span>
                <Chip size="sm" variant="flat" color="default">
                  {otherEntries.length}
                </Chip>
              </div>
            }
          >
            <div className="space-y-2 pb-2">
              {otherEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between items-start gap-4 py-2 px-3 bg-default-50 rounded-lg"
                >
                  <span className="text-small font-medium text-default-600 min-w-[140px]">
                    {getMetadataLabel(key)}
                  </span>
                  <span className="text-small text-default-800 text-right break-all font-mono">
                    {formatMetadataValue(value)}
                  </span>
                </div>
              ))}
            </div>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  )
}
