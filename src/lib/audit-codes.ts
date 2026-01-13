/**
 * Audit Log Constants and Translations
 * Estructura estandarizada para logs de auditoría
 */

// === Enum de Acciones ===
export const AuditActions = {
  // Usuarios
  USER_CREATED: "USER_CREATED",
  USER_UPDATED: "USER_UPDATED",
  USER_DELETED: "USER_DELETED",
  USER_ACTIVATED: "USER_ACTIVATED",
  USER_DEACTIVATED: "USER_DEACTIVATED",

  // Roles
  ROLE_ASSIGNED: "ROLE_ASSIGNED",
  ROLE_UNASSIGNED: "ROLE_UNASSIGNED",
  ROLE_CREATED: "ROLE_CREATED",
  ROLE_UPDATED: "ROLE_UPDATED",
  ROLE_DELETED: "ROLE_DELETED",

  // Permisos
  PERMISSION_GRANTED: "PERMISSION_GRANTED",
  PERMISSION_REVOKED: "PERMISSION_REVOKED",

  // Auth
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILED: "LOGIN_FAILED",
  LOGOUT: "LOGOUT",
  PASSWORD_CHANGED: "PASSWORD_CHANGED",
  PASSWORD_RESET_REQUESTED: "PASSWORD_RESET_REQUESTED",

  // Módulos
  MODULE_CREATED: "MODULE_CREATED",
  MODULE_UPDATED: "MODULE_UPDATED",
  MODULE_DELETED: "MODULE_DELETED",

  // Acciones
  ACTION_CREATED: "ACTION_CREATED",
  ACTION_UPDATED: "ACTION_UPDATED",
  ACTION_DELETED: "ACTION_DELETED",
} as const

export type AuditAction = typeof AuditActions[keyof typeof AuditActions]

// === Labels legibles por acción ===
export const ACTION_LABELS: Record<string, string> = {
  [AuditActions.USER_CREATED]: "Usuario Creado",
  [AuditActions.USER_UPDATED]: "Usuario Actualizado",
  [AuditActions.USER_DELETED]: "Usuario Eliminado",
  [AuditActions.USER_ACTIVATED]: "Usuario Activado",
  [AuditActions.USER_DEACTIVATED]: "Usuario Desactivado",
  [AuditActions.ROLE_ASSIGNED]: "Rol Asignado",
  [AuditActions.ROLE_UNASSIGNED]: "Rol Removido",
  [AuditActions.ROLE_CREATED]: "Rol Creado",
  [AuditActions.ROLE_UPDATED]: "Rol Actualizado",
  [AuditActions.ROLE_DELETED]: "Rol Eliminado",
  [AuditActions.PERMISSION_GRANTED]: "Permiso Otorgado",
  [AuditActions.PERMISSION_REVOKED]: "Permiso Revocado",
  [AuditActions.LOGIN_SUCCESS]: "Inicio de Sesión",
  [AuditActions.LOGIN_FAILED]: "Inicio de Sesión Fallido",
  [AuditActions.LOGOUT]: "Cierre de Sesión",
  [AuditActions.PASSWORD_CHANGED]: "Contraseña Cambiada",
  [AuditActions.PASSWORD_RESET_REQUESTED]: "Recuperación de Contraseña",
  [AuditActions.MODULE_CREATED]: "Módulo Creado",
  [AuditActions.MODULE_UPDATED]: "Módulo Actualizado",
  [AuditActions.MODULE_DELETED]: "Módulo Eliminado",
  [AuditActions.ACTION_CREATED]: "Acción Creada",
  [AuditActions.ACTION_UPDATED]: "Acción Actualizada",
  [AuditActions.ACTION_DELETED]: "Acción Eliminada",
}

// === Colores por acción ===
export const ACTION_COLORS: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  // Usuarios
  [AuditActions.USER_CREATED]: "success",
  [AuditActions.USER_UPDATED]: "primary",
  [AuditActions.USER_DELETED]: "danger",
  [AuditActions.USER_ACTIVATED]: "success",
  [AuditActions.USER_DEACTIVATED]: "warning",

  // Roles
  [AuditActions.ROLE_ASSIGNED]: "success",
  [AuditActions.ROLE_UNASSIGNED]: "warning",
  [AuditActions.ROLE_CREATED]: "success",
  [AuditActions.ROLE_UPDATED]: "primary",
  [AuditActions.ROLE_DELETED]: "danger",

  // Permisos
  [AuditActions.PERMISSION_GRANTED]: "success",
  [AuditActions.PERMISSION_REVOKED]: "warning",

  // Auth
  [AuditActions.LOGIN_SUCCESS]: "success",
  [AuditActions.LOGIN_FAILED]: "danger",
  [AuditActions.LOGOUT]: "secondary",
  [AuditActions.PASSWORD_CHANGED]: "primary",
  [AuditActions.PASSWORD_RESET_REQUESTED]: "warning",

  // Módulos
  [AuditActions.MODULE_CREATED]: "success",
  [AuditActions.MODULE_UPDATED]: "primary",
  [AuditActions.MODULE_DELETED]: "danger",

  // Acciones
  [AuditActions.ACTION_CREATED]: "success",
  [AuditActions.ACTION_UPDATED]: "primary",
  [AuditActions.ACTION_DELETED]: "danger",
}

// === Labels legibles por campo ===
export const FIELD_LABELS: Record<string, string> = {
  email: "Correo Electrónico",
  first_name: "Nombre",
  last_name: "Apellido",
  document_number: "Número de Documento",
  is_active: "Estado Activo",
  password: "Contraseña",
  role: "Rol",
  permission: "Permiso",
  name: "Nombre",
  description: "Descripción",
  code: "Código",
  system: "Sistema",
  is_default: "Por Defecto",
}

// === Enum de Tipos de Entidad ===
export const AuditEntityTypes = {
  USER: "User",
  ROLE: "Role",
  ROLE_PERMISSIONS: "RolePermissions",
  USER_ROLE: "UserRole",
  MODULE: "Module",
  PERMISSION: "Permission",
  ACTION: "Action",
} as const

export type AuditEntityType = typeof AuditEntityTypes[keyof typeof AuditEntityTypes]

// === Labels por tipo de entidad ===
export const ENTITY_TYPE_LABELS: Record<string, string> = {
  [AuditEntityTypes.USER]: "Usuario",
  [AuditEntityTypes.ROLE]: "Rol",
  [AuditEntityTypes.ROLE_PERMISSIONS]: "Permisos de Rol",
  [AuditEntityTypes.USER_ROLE]: "Rol de Usuario",
  [AuditEntityTypes.MODULE]: "Módulo",
  [AuditEntityTypes.PERMISSION]: "Permiso",
  [AuditEntityTypes.ACTION]: "Acción",
}

// === Labels para metadatos de auditoría ===
export const METADATA_LABELS: Record<string, string> = {
  // Roles
  roleName: "Nombre del Rol",
  roleId: "ID del Rol",
  is_default: "Por Defecto",

  // Permissions
  added: "Permisos Agregados",
  removed: "Permisos Removidos",
  total: "Total de Permisos",
  addedIds: "IDs de Permisos Agregados",
  removedIds: "IDs de Permisos Removidos",
  moduleId: "ID del Módulo",
  moduleName: "Nombre del Módulo",
  actionId: "ID de la Acción",
  actionCode: "Código de Acción",
  actionName: "Nombre de la Acción",

  // Users
  email: "Correo Electrónico",
  document_number: "Número de Documento",
  userId: "ID del Usuario",
  userName: "Nombre del Usuario",

  // General
  name: "Nombre",
  description: "Descripción",
  code: "Código",
  system: "Sistema",
  path: "Ruta",
  is_active: "Estado Activo",
  is_public: "Público",
  ipAddress: "Dirección IP",
  userAgent: "Agente de Usuario",
  reason: "Razón",
  oldValue: "Valor Anterior",
  newValue: "Nuevo Valor",
}

// === Helpers ===
export function getActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action
}

export function getActionColor(action: string): "default" | "primary" | "secondary" | "success" | "warning" | "danger" {
  return ACTION_COLORS[action] ?? "default"
}

export function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field
}

export function getEntityTypeLabel(entityType: string): string {
  return ENTITY_TYPE_LABELS[entityType] ?? entityType
}

export function getMetadataLabel(key: string): string {
  return METADATA_LABELS[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim()
}

