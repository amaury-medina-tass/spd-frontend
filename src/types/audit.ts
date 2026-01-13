import { AuditAction } from "@/lib/audit-codes"

/** Change tracking for entity updates */
export interface AuditLogChange {
  field: string
  fieldLabel: string
  oldValue: unknown
  newValue: unknown
}

/** Actor info (who performed the action) */
export interface AuditActor {
  id: string
  email: string
  name?: string
}

/** Error info (if action failed) */
export interface AuditError {
  code: string
  message: string
}

/** Metadata for audit log */
export interface AuditMetadata {
  // Roles
  name?: string
  description?: string
  is_default?: boolean
  roleName?: string

  // Permissions
  action?: string
  added?: number
  removed?: number
  total?: number
  addedIds?: string[]
  removedIds?: string[]
  moduleId?: string
  moduleName?: string
  actionId?: string
  actionCode?: string
  actionName?: string

  // Users
  email?: string
  document_number?: string

  // Allow other fields
  [key: string]: unknown
}

/** Core audit log entry */
export interface AuditLog {
  id: string
  timestamp: string
  action: string
  actionLabel: string
  success: boolean
  entityType: string
  entityId: string
  entityName?: string
  actor?: AuditActor
  system?: string
  ipAddress?: string
  userAgent?: string
  changes?: AuditLogChange[]
  error?: AuditError
  metadata?: AuditMetadata
}

/** Parameters for fetching audit logs */
export interface AuditLogsParams {
  page?: number
  limit?: number
  action?: string
  entityType?: string
  startDate?: string
  endDate?: string
  search?: string
  sortBy?: string
  sortOrder?: "ASC" | "DESC"
}
