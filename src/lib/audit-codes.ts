/**
 * Audit Log Constants and Translations
 * Estructura estandarizada para logs de auditoría
 */

// === Enum de Acciones ===
export const AuditActions = {
  // ========================
  // AUTH-SPD
  // ========================

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

  // ========================
  // SPD-CORE — MASTERS
  // ========================

  // Variables
  VARIABLE_CREATED: "VARIABLE_CREATED",
  VARIABLE_UPDATED: "VARIABLE_UPDATED",
  VARIABLE_DELETED: "VARIABLE_DELETED",

  // Variable Ubicaciones
  VARIABLE_LOCATION_ADDED: "VARIABLE_LOCATION_ADDED",
  VARIABLE_LOCATION_REMOVED: "VARIABLE_LOCATION_REMOVED",

  // Metas de Variable
  VARIABLE_GOAL_CREATED: "VARIABLE_GOAL_CREATED",
  VARIABLE_GOAL_UPDATED: "VARIABLE_GOAL_UPDATED",
  VARIABLE_GOAL_DELETED: "VARIABLE_GOAL_DELETED",

  // Cuatrienios de Variable
  VARIABLE_QUADRENNIUM_CREATED: "VARIABLE_QUADRENNIUM_CREATED",
  VARIABLE_QUADRENNIUM_UPDATED: "VARIABLE_QUADRENNIUM_UPDATED",
  VARIABLE_QUADRENNIUM_DELETED: "VARIABLE_QUADRENNIUM_DELETED",

  // Ubicaciones
  LOCATION_CREATED: "LOCATION_CREATED",

  // Actividades MGA
  MGA_ACTIVITY_CREATED: "MGA_ACTIVITY_CREATED",
  MGA_ACTIVITY_UPDATED: "MGA_ACTIVITY_UPDATED",
  MGA_DETAILED_RELATION_ADDED: "MGA_DETAILED_RELATION_ADDED",
  MGA_DETAILED_RELATION_REMOVED: "MGA_DETAILED_RELATION_REMOVED",

  // Actividades Detalladas
  DETAILED_ACTIVITY_CREATED: "DETAILED_ACTIVITY_CREATED",
  DETAILED_ACTIVITY_UPDATED: "DETAILED_ACTIVITY_UPDATED",
  DETAILED_ACTIVITY_DELETED: "DETAILED_ACTIVITY_DELETED",

  // Modificaciones Presupuestales
  BUDGET_MODIFICATION_CREATED: "BUDGET_MODIFICATION_CREATED",

  // Fórmulas
  FORMULA_CREATED: "FORMULA_CREATED",
  FORMULA_UPDATED: "FORMULA_UPDATED",

  // Indicadores Plan de Acción
  ACTION_INDICATOR_CREATED: "ACTION_INDICATOR_CREATED",
  ACTION_INDICATOR_UPDATED: "ACTION_INDICATOR_UPDATED",
  ACTION_INDICATOR_DELETED: "ACTION_INDICATOR_DELETED",

  // Metas Indicador Plan de Acción
  ACTION_INDICATOR_GOAL_CREATED: "ACTION_INDICATOR_GOAL_CREATED",
  ACTION_INDICATOR_GOAL_UPDATED: "ACTION_INDICATOR_GOAL_UPDATED",
  ACTION_INDICATOR_GOAL_DELETED: "ACTION_INDICATOR_GOAL_DELETED",

  // Cuatrienios Indicador Plan de Acción
  ACTION_INDICATOR_QUADRENNIUM_CREATED: "ACTION_INDICATOR_QUADRENNIUM_CREATED",
  ACTION_INDICATOR_QUADRENNIUM_UPDATED: "ACTION_INDICATOR_QUADRENNIUM_UPDATED",
  ACTION_INDICATOR_QUADRENNIUM_DELETED: "ACTION_INDICATOR_QUADRENNIUM_DELETED",

  // Ubicaciones Indicador Plan de Acción
  ACTION_INDICATOR_LOCATION_ADDED: "ACTION_INDICATOR_LOCATION_ADDED",
  ACTION_INDICATOR_LOCATION_REMOVED: "ACTION_INDICATOR_LOCATION_REMOVED",

  // Relaciones Variable/Proyecto ↔ Indicador Plan de Acción
  VARIABLE_ACTION_ASSOCIATED: "VARIABLE_ACTION_ASSOCIATED",
  VARIABLE_ACTION_DISASSOCIATED: "VARIABLE_ACTION_DISASSOCIATED",
  PROJECT_ACTION_INDICATOR_ASSOCIATED: "PROJECT_ACTION_INDICATOR_ASSOCIATED",
  PROJECT_ACTION_INDICATOR_DISASSOCIATED: "PROJECT_ACTION_INDICATOR_DISASSOCIATED",

  // Indicadores Plan Indicativo
  INDICATIVE_INDICATOR_CREATED: "INDICATIVE_INDICATOR_CREATED",
  INDICATIVE_INDICATOR_UPDATED: "INDICATIVE_INDICATOR_UPDATED",
  INDICATIVE_INDICATOR_DELETED: "INDICATIVE_INDICATOR_DELETED",

  // Metas Indicador Plan Indicativo
  INDICATIVE_INDICATOR_GOAL_CREATED: "INDICATIVE_INDICATOR_GOAL_CREATED",
  INDICATIVE_INDICATOR_GOAL_UPDATED: "INDICATIVE_INDICATOR_GOAL_UPDATED",
  INDICATIVE_INDICATOR_GOAL_DELETED: "INDICATIVE_INDICATOR_GOAL_DELETED",

  // Cuatrienios Indicador Plan Indicativo
  INDICATIVE_INDICATOR_QUADRENNIUM_CREATED: "INDICATIVE_INDICATOR_QUADRENNIUM_CREATED",
  INDICATIVE_INDICATOR_QUADRENNIUM_UPDATED: "INDICATIVE_INDICATOR_QUADRENNIUM_UPDATED",
  INDICATIVE_INDICATOR_QUADRENNIUM_DELETED: "INDICATIVE_INDICATOR_QUADRENNIUM_DELETED",

  // Ubicaciones Indicador Plan Indicativo
  INDICATIVE_INDICATOR_LOCATION_ADDED: "INDICATIVE_INDICATOR_LOCATION_ADDED",
  INDICATIVE_INDICATOR_LOCATION_REMOVED: "INDICATIVE_INDICATOR_LOCATION_REMOVED",

  // Relaciones Variable ↔ Indicador Plan Indicativo
  VARIABLE_INDICATIVE_ASSOCIATED: "VARIABLE_INDICATIVE_ASSOCIATED",
  VARIABLE_INDICATIVE_DISASSOCIATED: "VARIABLE_INDICATIVE_DISASSOCIATED",

  // ========================
  // SPD-CORE — FINANCIAL
  // ========================

  // Proyectos
  PROJECT_CREATED: "PROJECT_CREATED",

  // Fuentes de Financiación
  FUNDING_SOURCE_CREATED: "FUNDING_SOURCE_CREATED",
  FUNDING_SOURCE_UPDATED: "FUNDING_SOURCE_UPDATED",
  FUNDING_SOURCE_DELETED: "FUNDING_SOURCE_DELETED",

  // POAI-PPA
  POAI_PPA_CREATED: "POAI_PPA_CREATED",
  POAI_PPA_UPDATED: "POAI_PPA_UPDATED",
  POAI_PPA_DELETED: "POAI_PPA_DELETED",

  // Posiciones CDP
  CDP_POSITION_OBSERVATIONS_UPDATED: "CDP_POSITION_OBSERVATIONS_UPDATED",
  CDP_POSITION_ACTIVITY_ASSOCIATED: "CDP_POSITION_ACTIVITY_ASSOCIATED",
  CDP_POSITION_ACTIVITY_DISASSOCIATED: "CDP_POSITION_ACTIVITY_DISASSOCIATED",

  // Consumo CDP
  CDP_FUNDING_CONSUMED: "CDP_FUNDING_CONSUMED",

  // ========================
  // SPD-CORE — SUB (Seguimiento)
  // ========================

  // Avances
  VARIABLE_ADVANCE_CREATED: "VARIABLE_ADVANCE_CREATED",
  INDICATOR_ADVANCE_UPDATED: "INDICATOR_ADVANCE_UPDATED",

  // ========================
  // SPD-CORE — SAP SYNC
  // ========================

  SAP_SYNC_ENQUEUED: "SAP_SYNC_ENQUEUED",
  SAP_SYNC_COMPLETED: "SAP_SYNC_COMPLETED",
  SAP_SYNC_FAILED: "SAP_SYNC_FAILED",
} as const

export type AuditAction = typeof AuditActions[keyof typeof AuditActions]

// === Labels legibles por acción ===
export const ACTION_LABELS: Record<string, string> = {
  // Auth
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

  // Masters — Variables
  [AuditActions.VARIABLE_CREATED]: "Variable Creada",
  [AuditActions.VARIABLE_UPDATED]: "Variable Actualizada",
  [AuditActions.VARIABLE_DELETED]: "Variable Eliminada",
  [AuditActions.VARIABLE_LOCATION_ADDED]: "Ubicación de Variable Agregada",
  [AuditActions.VARIABLE_LOCATION_REMOVED]: "Ubicación de Variable Removida",
  [AuditActions.VARIABLE_GOAL_CREATED]: "Meta de Variable Creada",
  [AuditActions.VARIABLE_GOAL_UPDATED]: "Meta de Variable Actualizada",
  [AuditActions.VARIABLE_GOAL_DELETED]: "Meta de Variable Eliminada",
  [AuditActions.VARIABLE_QUADRENNIUM_CREATED]: "Cuatrienio de Variable Creado",
  [AuditActions.VARIABLE_QUADRENNIUM_UPDATED]: "Cuatrienio de Variable Actualizado",
  [AuditActions.VARIABLE_QUADRENNIUM_DELETED]: "Cuatrienio de Variable Eliminado",

  // Masters — Ubicaciones
  [AuditActions.LOCATION_CREATED]: "Ubicación Creada",

  // Masters — Actividades MGA
  [AuditActions.MGA_ACTIVITY_CREATED]: "Actividad MGA Creada",
  [AuditActions.MGA_ACTIVITY_UPDATED]: "Actividad MGA Actualizada",
  [AuditActions.MGA_DETAILED_RELATION_ADDED]: "Relación Detallada MGA Agregada",
  [AuditActions.MGA_DETAILED_RELATION_REMOVED]: "Relación Detallada MGA Removida",

  // Masters — Actividades Detalladas
  [AuditActions.DETAILED_ACTIVITY_CREATED]: "Actividad Detallada Creada",
  [AuditActions.DETAILED_ACTIVITY_UPDATED]: "Actividad Detallada Actualizada",
  [AuditActions.DETAILED_ACTIVITY_DELETED]: "Actividad Detallada Eliminada",

  // Masters — Modificaciones Presupuestales
  [AuditActions.BUDGET_MODIFICATION_CREATED]: "Modificación Presupuestal Creada",

  // Masters — Fórmulas
  [AuditActions.FORMULA_CREATED]: "Fórmula Creada",
  [AuditActions.FORMULA_UPDATED]: "Fórmula Actualizada",

  // Masters — Indicadores Plan de Acción
  [AuditActions.ACTION_INDICATOR_CREATED]: "Indicador de Plan de Acción Creado",
  [AuditActions.ACTION_INDICATOR_UPDATED]: "Indicador de Plan de Acción Actualizado",
  [AuditActions.ACTION_INDICATOR_DELETED]: "Indicador de Plan de Acción Eliminado",
  [AuditActions.ACTION_INDICATOR_GOAL_CREATED]: "Meta de Indicador (Plan de Acción) Creada",
  [AuditActions.ACTION_INDICATOR_GOAL_UPDATED]: "Meta de Indicador (Plan de Acción) Actualizada",
  [AuditActions.ACTION_INDICATOR_GOAL_DELETED]: "Meta de Indicador (Plan de Acción) Eliminada",
  [AuditActions.ACTION_INDICATOR_QUADRENNIUM_CREATED]: "Cuatrienio de Indicador (Plan de Acción) Creado",
  [AuditActions.ACTION_INDICATOR_QUADRENNIUM_UPDATED]: "Cuatrienio de Indicador (Plan de Acción) Actualizado",
  [AuditActions.ACTION_INDICATOR_QUADRENNIUM_DELETED]: "Cuatrienio de Indicador (Plan de Acción) Eliminado",
  [AuditActions.ACTION_INDICATOR_LOCATION_ADDED]: "Ubicación de Indicador (Plan de Acción) Agregada",
  [AuditActions.ACTION_INDICATOR_LOCATION_REMOVED]: "Ubicación de Indicador (Plan de Acción) Removida",
  [AuditActions.VARIABLE_ACTION_ASSOCIATED]: "Variable Asociada a Indicador de Plan de Acción",
  [AuditActions.VARIABLE_ACTION_DISASSOCIATED]: "Variable Desasociada de Indicador de Plan de Acción",
  [AuditActions.PROJECT_ACTION_INDICATOR_ASSOCIATED]: "Proyecto Asociado a Indicador de Plan de Acción",
  [AuditActions.PROJECT_ACTION_INDICATOR_DISASSOCIATED]: "Proyecto Desasociado de Indicador de Plan de Acción",

  // Masters — Indicadores Plan Indicativo
  [AuditActions.INDICATIVE_INDICATOR_CREATED]: "Indicador de Plan Indicativo Creado",
  [AuditActions.INDICATIVE_INDICATOR_UPDATED]: "Indicador de Plan Indicativo Actualizado",
  [AuditActions.INDICATIVE_INDICATOR_DELETED]: "Indicador de Plan Indicativo Eliminado",
  [AuditActions.INDICATIVE_INDICATOR_GOAL_CREATED]: "Meta de Indicador (Plan Indicativo) Creada",
  [AuditActions.INDICATIVE_INDICATOR_GOAL_UPDATED]: "Meta de Indicador (Plan Indicativo) Actualizada",
  [AuditActions.INDICATIVE_INDICATOR_GOAL_DELETED]: "Meta de Indicador (Plan Indicativo) Eliminada",
  [AuditActions.INDICATIVE_INDICATOR_QUADRENNIUM_CREATED]: "Cuatrienio de Indicador (Plan Indicativo) Creado",
  [AuditActions.INDICATIVE_INDICATOR_QUADRENNIUM_UPDATED]: "Cuatrienio de Indicador (Plan Indicativo) Actualizado",
  [AuditActions.INDICATIVE_INDICATOR_QUADRENNIUM_DELETED]: "Cuatrienio de Indicador (Plan Indicativo) Eliminado",
  [AuditActions.INDICATIVE_INDICATOR_LOCATION_ADDED]: "Ubicación de Indicador (Plan Indicativo) Agregada",
  [AuditActions.INDICATIVE_INDICATOR_LOCATION_REMOVED]: "Ubicación de Indicador (Plan Indicativo) Removida",
  [AuditActions.VARIABLE_INDICATIVE_ASSOCIATED]: "Variable Asociada a Indicador de Plan Indicativo",
  [AuditActions.VARIABLE_INDICATIVE_DISASSOCIATED]: "Variable Desasociada de Indicador de Plan Indicativo",

  // Financial
  [AuditActions.PROJECT_CREATED]: "Proyecto Creado",
  [AuditActions.FUNDING_SOURCE_CREATED]: "Fuente de Financiación Creada",
  [AuditActions.FUNDING_SOURCE_UPDATED]: "Fuente de Financiación Actualizada",
  [AuditActions.FUNDING_SOURCE_DELETED]: "Fuente de Financiación Eliminada",
  [AuditActions.POAI_PPA_CREATED]: "POAI-PPA Creado",
  [AuditActions.POAI_PPA_UPDATED]: "POAI-PPA Actualizado",
  [AuditActions.POAI_PPA_DELETED]: "POAI-PPA Eliminado",
  [AuditActions.CDP_POSITION_OBSERVATIONS_UPDATED]: "Observaciones de Posición CDP Actualizadas",
  [AuditActions.CDP_POSITION_ACTIVITY_ASSOCIATED]: "Actividad Asociada a Posición CDP",
  [AuditActions.CDP_POSITION_ACTIVITY_DISASSOCIATED]: "Actividad Desasociada de Posición CDP",
  [AuditActions.CDP_FUNDING_CONSUMED]: "Financiamiento CDP Consumido",

  // Sub — Avances
  [AuditActions.VARIABLE_ADVANCE_CREATED]: "Avance de Variable Creado",
  [AuditActions.INDICATOR_ADVANCE_UPDATED]: "Avance de Indicador Actualizado",

  // SAP Sync
  [AuditActions.SAP_SYNC_ENQUEUED]: "Sincronización SAP Encolada",
  [AuditActions.SAP_SYNC_COMPLETED]: "Sincronización SAP Completada",
  [AuditActions.SAP_SYNC_FAILED]: "Sincronización SAP Fallida",
}

// === Colores por acción ===
export const ACTION_COLORS: Record<string, "default" | "primary" | "secondary" | "success" | "warning" | "danger"> = {
  // Auth — Usuarios
  [AuditActions.USER_CREATED]: "success",
  [AuditActions.USER_UPDATED]: "primary",
  [AuditActions.USER_DELETED]: "danger",
  [AuditActions.USER_ACTIVATED]: "success",
  [AuditActions.USER_DEACTIVATED]: "warning",

  // Auth — Roles
  [AuditActions.ROLE_ASSIGNED]: "success",
  [AuditActions.ROLE_UNASSIGNED]: "warning",
  [AuditActions.ROLE_CREATED]: "success",
  [AuditActions.ROLE_UPDATED]: "primary",
  [AuditActions.ROLE_DELETED]: "danger",

  // Auth — Permisos
  [AuditActions.PERMISSION_GRANTED]: "success",
  [AuditActions.PERMISSION_REVOKED]: "warning",

  // Auth
  [AuditActions.LOGIN_SUCCESS]: "success",
  [AuditActions.LOGIN_FAILED]: "danger",
  [AuditActions.LOGOUT]: "secondary",
  [AuditActions.PASSWORD_CHANGED]: "primary",
  [AuditActions.PASSWORD_RESET_REQUESTED]: "warning",

  // Auth — Módulos
  [AuditActions.MODULE_CREATED]: "success",
  [AuditActions.MODULE_UPDATED]: "primary",
  [AuditActions.MODULE_DELETED]: "danger",

  // Auth — Acciones
  [AuditActions.ACTION_CREATED]: "success",
  [AuditActions.ACTION_UPDATED]: "primary",
  [AuditActions.ACTION_DELETED]: "danger",

  // Masters — Variables
  [AuditActions.VARIABLE_CREATED]: "success",
  [AuditActions.VARIABLE_UPDATED]: "primary",
  [AuditActions.VARIABLE_DELETED]: "danger",
  [AuditActions.VARIABLE_LOCATION_ADDED]: "success",
  [AuditActions.VARIABLE_LOCATION_REMOVED]: "warning",
  [AuditActions.VARIABLE_GOAL_CREATED]: "success",
  [AuditActions.VARIABLE_GOAL_UPDATED]: "primary",
  [AuditActions.VARIABLE_GOAL_DELETED]: "danger",
  [AuditActions.VARIABLE_QUADRENNIUM_CREATED]: "success",
  [AuditActions.VARIABLE_QUADRENNIUM_UPDATED]: "primary",
  [AuditActions.VARIABLE_QUADRENNIUM_DELETED]: "danger",

  // Masters — Ubicaciones
  [AuditActions.LOCATION_CREATED]: "success",

  // Masters — Actividades MGA
  [AuditActions.MGA_ACTIVITY_CREATED]: "success",
  [AuditActions.MGA_ACTIVITY_UPDATED]: "primary",
  [AuditActions.MGA_DETAILED_RELATION_ADDED]: "success",
  [AuditActions.MGA_DETAILED_RELATION_REMOVED]: "warning",

  // Masters — Actividades Detalladas
  [AuditActions.DETAILED_ACTIVITY_CREATED]: "success",
  [AuditActions.DETAILED_ACTIVITY_UPDATED]: "primary",
  [AuditActions.DETAILED_ACTIVITY_DELETED]: "danger",

  // Masters — Modificaciones Presupuestales
  [AuditActions.BUDGET_MODIFICATION_CREATED]: "warning",

  // Masters — Fórmulas
  [AuditActions.FORMULA_CREATED]: "success",
  [AuditActions.FORMULA_UPDATED]: "primary",

  // Masters — Indicadores Plan de Acción
  [AuditActions.ACTION_INDICATOR_CREATED]: "success",
  [AuditActions.ACTION_INDICATOR_UPDATED]: "primary",
  [AuditActions.ACTION_INDICATOR_DELETED]: "danger",
  [AuditActions.ACTION_INDICATOR_GOAL_CREATED]: "success",
  [AuditActions.ACTION_INDICATOR_GOAL_UPDATED]: "primary",
  [AuditActions.ACTION_INDICATOR_GOAL_DELETED]: "danger",
  [AuditActions.ACTION_INDICATOR_QUADRENNIUM_CREATED]: "success",
  [AuditActions.ACTION_INDICATOR_QUADRENNIUM_UPDATED]: "primary",
  [AuditActions.ACTION_INDICATOR_QUADRENNIUM_DELETED]: "danger",
  [AuditActions.ACTION_INDICATOR_LOCATION_ADDED]: "success",
  [AuditActions.ACTION_INDICATOR_LOCATION_REMOVED]: "warning",
  [AuditActions.VARIABLE_ACTION_ASSOCIATED]: "success",
  [AuditActions.VARIABLE_ACTION_DISASSOCIATED]: "warning",
  [AuditActions.PROJECT_ACTION_INDICATOR_ASSOCIATED]: "success",
  [AuditActions.PROJECT_ACTION_INDICATOR_DISASSOCIATED]: "warning",

  // Masters — Indicadores Plan Indicativo
  [AuditActions.INDICATIVE_INDICATOR_CREATED]: "success",
  [AuditActions.INDICATIVE_INDICATOR_UPDATED]: "primary",
  [AuditActions.INDICATIVE_INDICATOR_DELETED]: "danger",
  [AuditActions.INDICATIVE_INDICATOR_GOAL_CREATED]: "success",
  [AuditActions.INDICATIVE_INDICATOR_GOAL_UPDATED]: "primary",
  [AuditActions.INDICATIVE_INDICATOR_GOAL_DELETED]: "danger",
  [AuditActions.INDICATIVE_INDICATOR_QUADRENNIUM_CREATED]: "success",
  [AuditActions.INDICATIVE_INDICATOR_QUADRENNIUM_UPDATED]: "primary",
  [AuditActions.INDICATIVE_INDICATOR_QUADRENNIUM_DELETED]: "danger",
  [AuditActions.INDICATIVE_INDICATOR_LOCATION_ADDED]: "success",
  [AuditActions.INDICATIVE_INDICATOR_LOCATION_REMOVED]: "warning",
  [AuditActions.VARIABLE_INDICATIVE_ASSOCIATED]: "success",
  [AuditActions.VARIABLE_INDICATIVE_DISASSOCIATED]: "warning",

  // Financial
  [AuditActions.PROJECT_CREATED]: "success",
  [AuditActions.FUNDING_SOURCE_CREATED]: "success",
  [AuditActions.FUNDING_SOURCE_UPDATED]: "primary",
  [AuditActions.FUNDING_SOURCE_DELETED]: "danger",
  [AuditActions.POAI_PPA_CREATED]: "success",
  [AuditActions.POAI_PPA_UPDATED]: "primary",
  [AuditActions.POAI_PPA_DELETED]: "danger",
  [AuditActions.CDP_POSITION_OBSERVATIONS_UPDATED]: "primary",
  [AuditActions.CDP_POSITION_ACTIVITY_ASSOCIATED]: "success",
  [AuditActions.CDP_POSITION_ACTIVITY_DISASSOCIATED]: "warning",
  [AuditActions.CDP_FUNDING_CONSUMED]: "warning",

  // Sub — Avances
  [AuditActions.VARIABLE_ADVANCE_CREATED]: "success",
  [AuditActions.INDICATOR_ADVANCE_UPDATED]: "primary",

  // SAP Sync
  [AuditActions.SAP_SYNC_ENQUEUED]: "secondary",
  [AuditActions.SAP_SYNC_COMPLETED]: "success",
  [AuditActions.SAP_SYNC_FAILED]: "danger",
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

