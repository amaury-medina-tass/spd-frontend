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
            <div className="p-4 bg-default-50 border border-default-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-success-100 flex items-center justify-center">
                  <Plus size={12} className="text-success-600" />
                </div>
                <span className="text-small font-medium text-foreground">
                  Permisos Agregados ({addedIds.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pl-7">
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
            <div className="p-4 bg-default-50 border border-default-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-warning-100 flex items-center justify-center">
                  <Minus size={12} className="text-warning-600" />
                </div>
                <span className="text-small font-medium text-foreground">
                  Permisos Removidos ({removedIds.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pl-7">
                {removedIds.map((id) => (
                  <Chip key={id} size="sm" variant="flat" className="font-mono text-tiny">
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
          className="bg-transparent"
        >
          <AccordionItem
            key="metadata"
            aria-label="Metadatos"
            classNames={{
              trigger: "px-4 py-3",
              content: "px-4 pb-4 pt-0",
            }}
            title={
              <div className="flex items-center gap-2">
                <span className="font-medium">{hasPermissionChanges ? "Otros Metadatos" : "Metadatos"}</span>
                <Chip size="sm" variant="flat" color="default">
                  {otherEntries.length}
                </Chip>
              </div>
            }
          >
            <div className="space-y-2 pb-3 pt-1">
              {otherEntries.map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between items-start gap-4 py-3 px-4 bg-default-50 rounded-lg"
                >
                  <span className="text-small font-medium text-default-500 min-w-[140px]">
                    {getMetadataLabel(key)}
                  </span>
                  <span className="text-small text-foreground text-right break-all font-mono">
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
