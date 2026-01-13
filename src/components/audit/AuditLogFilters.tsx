"use client"

import { Input, Select, SelectItem, Button } from "@heroui/react"
import { Search, X } from "lucide-react"
import { AuditActions, ACTION_LABELS, ENTITY_TYPE_LABELS } from "@/lib/audit-codes"
import { AuditLogsParams } from "@/types/audit"

interface AuditLogFiltersProps {
  filters: AuditLogsParams
  onFilterChange: (filters: Partial<AuditLogsParams>) => void
  onReset?: () => void
}

const ENTITY_TYPES = [
  { key: "", label: "Todos" },
  ...Object.entries(ENTITY_TYPE_LABELS).map(([key, label]) => ({
    key,
    label,
  })),
]

const ACTION_TYPES = [
  { key: "", label: "Todas" },
  ...Object.entries(AuditActions).map(([, value]) => ({
    key: value,
    label: ACTION_LABELS[value] || value,
  })),
]

export function AuditLogFilters({
  filters,
  onFilterChange,
  onReset,
}: AuditLogFiltersProps) {
  const hasActiveFilters =
    filters.search || filters.action || filters.entityType

  return (
    <div className="flex flex-wrap items-end gap-3">
      {/* Search */}
      <Input
        placeholder="Buscar por entidad..."
        size="sm"
        className="w-64"
        value={filters.search || ""}
        onValueChange={(value) => onFilterChange({ search: value })}
        startContent={<Search size={16} className="text-default-400" />}
        isClearable
        onClear={() => onFilterChange({ search: "" })}
      />

      {/* Action filter */}
      <Select
        placeholder="Acción"
        size="sm"
        className="w-52"
        selectedKeys={filters.action ? [filters.action] : []}
        onSelectionChange={(keys) => {
          const value = Array.from(keys)[0] as string
          onFilterChange({ action: value || undefined })
        }}
      >
        {ACTION_TYPES.map((action) => (
          <SelectItem key={action.key}>{action.label}</SelectItem>
        ))}
      </Select>

      {/* Entity type filter */}
      <Select
        placeholder="Tipo de entidad"
        size="sm"
        className="w-48"
        selectedKeys={filters.entityType ? [filters.entityType] : []}
        onSelectionChange={(keys) => {
          const value = Array.from(keys)[0] as string
          onFilterChange({ entityType: value || undefined })
        }}
      >
        {ENTITY_TYPES.map((entity) => (
          <SelectItem key={entity.key}>{entity.label}</SelectItem>
        ))}
      </Select>

      {/* Reset button */}
      {hasActiveFilters && onReset && (
        <Button
          size="sm"
          variant="flat"
          color="default"
          onPress={onReset}
          startContent={<X size={14} />}
        >
          Limpiar
        </Button>
      )}
    </div>
  )
}
