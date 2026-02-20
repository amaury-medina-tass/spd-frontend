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
  // SPD-CORE — MASTERS (Más entidades)
  // ========================

  // Rubros
  RUBRIC_CREATED: "RUBRIC_CREATED",
  RUBRIC_UPDATED: "RUBRIC_UPDATED",
  RUBRIC_DELETED: "RUBRIC_DELETED",

  // Productos
  PRODUCT_CREATED: "PRODUCT_CREATED",
  PRODUCT_UPDATED: "PRODUCT_UPDATED",
  PRODUCT_DELETED: "PRODUCT_DELETED",

  // Contratistas
  CONTRACTOR_CREATED: "CONTRACTOR_CREATED",
  CONTRACTOR_UPDATED: "CONTRACTOR_UPDATED",
  CONTRACTOR_DELETED: "CONTRACTOR_DELETED",

  // Contratos Marco
  MASTER_CONTRACT_CREATED: "MASTER_CONTRACT_CREATED",
  MASTER_CONTRACT_UPDATED: "MASTER_CONTRACT_UPDATED",
  MASTER_CONTRACT_DELETED: "MASTER_CONTRACT_DELETED",

  // Necesidades
  NEED_CREATED: "NEED_CREATED",
  NEED_UPDATED: "NEED_UPDATED",
  NEED_DELETED: "NEED_DELETED",

  // Estudios Previos
  PREVIOUS_STUDY_CREATED: "PREVIOUS_STUDY_CREATED",
  PREVIOUS_STUDY_UPDATED: "PREVIOUS_STUDY_UPDATED",
  PREVIOUS_STUDY_DELETED: "PREVIOUS_STUDY_DELETED",

  // Dependencias
  DEPENDENCY_CREATED: "DEPENDENCY_CREATED",
  DEPENDENCY_UPDATED: "DEPENDENCY_UPDATED",
  DEPENDENCY_DELETED: "DEPENDENCY_DELETED",

  // CDPs
  CDP_CREATED: "CDP_CREATED",
  CDP_UPDATED: "CDP_UPDATED",
  CDP_DELETED: "CDP_DELETED",

  // ========================
  // SPD-CORE — SUB (Seguimiento)
  // ========================

  // Avances
  VARIABLE_ADVANCE_CREATED: "VARIABLE_ADVANCE_CREATED",
  VARIABLE_ADVANCE_UPDATED: "VARIABLE_ADVANCE_UPDATED",
  INDICATOR_ADVANCE_CREATED: "INDICATOR_ADVANCE_CREATED",
  INDICATOR_ADVANCE_UPDATED: "INDICATOR_ADVANCE_UPDATED",

  // ========================
  // SPD-CORE — SAP SYNC
  // ========================

  SAP_SYNC_REQUESTED: "SAP_SYNC_REQUESTED",
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

  // Rubros
  [AuditActions.RUBRIC_CREATED]: "Rubro Creado",
  [AuditActions.RUBRIC_UPDATED]: "Rubro Actualizado",
  [AuditActions.RUBRIC_DELETED]: "Rubro Eliminado",

  // Productos
  [AuditActions.PRODUCT_CREATED]: "Producto Creado",
  [AuditActions.PRODUCT_UPDATED]: "Producto Actualizado",
  [AuditActions.PRODUCT_DELETED]: "Producto Eliminado",

  // Contratistas
  [AuditActions.CONTRACTOR_CREATED]: "Contratista Creado",
  [AuditActions.CONTRACTOR_UPDATED]: "Contratista Actualizado",
  [AuditActions.CONTRACTOR_DELETED]: "Contratista Eliminado",

  // Contratos Marco
  [AuditActions.MASTER_CONTRACT_CREATED]: "Contrato Marco Creado",
  [AuditActions.MASTER_CONTRACT_UPDATED]: "Contrato Marco Actualizado",
  [AuditActions.MASTER_CONTRACT_DELETED]: "Contrato Marco Eliminado",

  // Necesidades
  [AuditActions.NEED_CREATED]: "Necesidad Creada",
  [AuditActions.NEED_UPDATED]: "Necesidad Actualizada",
  [AuditActions.NEED_DELETED]: "Necesidad Eliminada",

  // Estudios Previos
  [AuditActions.PREVIOUS_STUDY_CREATED]: "Estudio Previo Creado",
  [AuditActions.PREVIOUS_STUDY_UPDATED]: "Estudio Previo Actualizado",
  [AuditActions.PREVIOUS_STUDY_DELETED]: "Estudio Previo Eliminado",

  // Dependencias
  [AuditActions.DEPENDENCY_CREATED]: "Dependencia Creada",
  [AuditActions.DEPENDENCY_UPDATED]: "Dependencia Actualizada",
  [AuditActions.DEPENDENCY_DELETED]: "Dependencia Eliminada",

  // CDPs
  [AuditActions.CDP_CREATED]: "CDP Creado",
  [AuditActions.CDP_UPDATED]: "CDP Actualizado",
  [AuditActions.CDP_DELETED]: "CDP Eliminado",

  // Avances Variables
  [AuditActions.VARIABLE_ADVANCE_CREATED]: "Avance de Variable Creado",
  [AuditActions.VARIABLE_ADVANCE_UPDATED]: "Avance de Variable Actualizado",

  // Avances Indicadores
  [AuditActions.INDICATOR_ADVANCE_CREATED]: "Avance de Indicador Creado",
  [AuditActions.INDICATOR_ADVANCE_UPDATED]: "Avance de Indicador Actualizado",

  // SAP Sync
  [AuditActions.SAP_SYNC_REQUESTED]: "Sincronización SAP Solicitada",
  [AuditActions.SAP_SYNC_COMPLETED]: "Sincronización SAP Completada",
  [AuditActions.SAP_SYNC_FAILED]: "Sincronización SAP Fallida",
}

// === Colores por acción (derivados automáticamente del sufijo) ===
type AuditActionColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger"

const ACTION_COLOR_OVERRIDES: Partial<Record<string, AuditActionColor>> = {
  [AuditActions.LOGOUT]: "secondary",
  [AuditActions.BUDGET_MODIFICATION_CREATED]: "warning",
  [AuditActions.CDP_FUNDING_CONSUMED]: "warning",
  [AuditActions.SAP_SYNC_REQUESTED]: "secondary",
}

function deriveActionColor(action: string): AuditActionColor {
  const override = ACTION_COLOR_OVERRIDES[action]
  if (override) return override
  if (/_CREATED$|_ADDED$|_ASSIGNED$|_ASSOCIATED$|_ACTIVATED$|_COMPLETED$|_GRANTED$|_SUCCESS$/.test(action)) return "success"
  if (/_UPDATED$|_CHANGED$/.test(action)) return "primary"
  if (/_DELETED$|_FAILED$/.test(action)) return "danger"
  if (/_REMOVED$|_UNASSIGNED$|_DISASSOCIATED$|_REVOKED$|_DEACTIVATED$|_REQUESTED$/.test(action)) return "warning"
  return "default"
}

export const ACTION_COLORS: Record<string, AuditActionColor> = Object.fromEntries(
  Object.values(AuditActions).map((action) => [action, deriveActionColor(action)])
)

// === Labels legibles por campo ===
export const FIELD_LABELS: Record<string, string> = {
  // Auth
  email: "Correo Electrónico",
  first_name: "Nombre",
  last_name: "Apellido",
  document_number: "Número de Documento",
  is_active: "Estado Activo",
  password: "Contraseña",
  role: "Rol",
  permission: "Permiso",

  // General
  name: "Nombre",
  description: "Descripción",
  code: "Código",
  system: "Sistema",
  is_default: "Por Defecto",
  observations: "Observaciones",
  state: "Estado",

  // Financial
  number: "Número",
  totalValue: "Valor Total",
  balance: "Saldo",
  value: "Valor",
  dateIssue: "Fecha de Emisión",
  positionNumber: "Número de Posición",
  assignedValue: "Valor Asignado",
  initialBudget: "Presupuesto Inicial",
  currentBudget: "Presupuesto Actual",
  execution: "Ejecución",
  origin: "Origen",
  amount: "Monto",
  previousBalance: "Saldo Anterior",
  newBalance: "Nuevo Saldo",

  // POAI PPA
  year: "Año",
  projectedPoai: "POAI Proyectado",
  assignedPoai: "POAI Asignado",
  projectCode: "Código de Proyecto",

  // Activities
  activityDate: "Fecha de Actividad",
  budgetCeiling: "Techo Presupuestal",
  cpc: "CPC",

  // Indicators
  programName: "Nombre del Programa",
  pillarName: "Nombre del Pilar",
  componentName: "Nombre del Componente",
  statisticalCode: "Código Estadístico",
  sequenceNumber: "Número de Secuencia",
  plannedQuantity: "Cantidad Planificada",
  executionCut: "Corte de Ejecución",
  compliancePercentage: "Porcentaje de Cumplimiento",
  startYear: "Año Inicio",
  endYear: "Año Fin",
  measureUnit: "Unidad de Medida",
  baselineValue: "Valor Línea Base",

  // Formulas
  expression: "Expresión",
  formulaType: "Tipo de Fórmula",

  // Budget Modifications
  modificationType: "Tipo de Modificación",
  legalDocument: "Documento Legal",
  previousRubricId: "Rubro Anterior",
  newRubricId: "Nuevo Rubro",

  // SAP
  nit: "NIT",
  object: "Objeto",
}

// === Enum de Tipos de Entidad ===
export const AuditEntityTypes = {
  // Auth
  USER: "User",
  ROLE: "Role",
  ROLE_PERMISSIONS: "RolePermissions",
  USER_ROLE: "UserRole",
  MODULE: "Module",
  PERMISSION: "Permission",
  ACTION: "Action",

  // SPD-Core — Masters
  VARIABLE: "Variable",
  VARIABLE_GOAL: "VariableGoal",
  VARIABLE_QUADRENNIUM: "VariableQuadrennium",
  VARIABLE_LOCATION: "VariableLocation",
  LOCATION: "Location",
  MGA_ACTIVITY: "MgaActivity",
  MGA_DETAILED_RELATION: "MgaDetailedRelation",
  DETAILED_ACTIVITY: "DetailedActivity",
  BUDGET_MODIFICATION: "BudgetModification",
  FORMULA: "Formula",
  RUBRIC: "Rubric",
  PRODUCT: "Product",

  // SPD-Core — Indicators
  INDICATIVE_INDICATOR: "IndicativePlanIndicator",
  INDICATIVE_INDICATOR_GOAL: "IndicativePlanIndicatorGoal",
  INDICATIVE_INDICATOR_QUADRENNIUM: "IndicativePlanIndicatorQuadrennium",
  INDICATIVE_INDICATOR_LOCATION: "IndicativePlanIndicatorLocation",
  ACTION_INDICATOR: "ActionPlanIndicator",
  ACTION_INDICATOR_GOAL: "ActionPlanIndicatorGoal",
  ACTION_INDICATOR_QUADRENNIUM: "ActionPlanIndicatorQuadrennium",
  ACTION_INDICATOR_LOCATION: "ActionPlanIndicatorLocation",
  VARIABLE_INDICATIVE_RELATION: "VariableIndicativeRelation",
  VARIABLE_ACTION_RELATION: "VariableActionRelation",
  PROJECT_ACTION_INDICATOR_RELATION: "ProjectActionIndicatorRelation",
  INDICATOR_LOCATION: "IndicatorLocation",

  // SPD-Core — Financial
  PROJECT: "Project",
  DEPENDENCY: "Dependency",
  FUNDING_SOURCE: "FundingSource",
  POAI_PPA: "PoaiPpa",
  CDP: "Cdp",
  CDP_POSITION: "CdpPosition",
  CDP_POSITION_FUNDING: "CdpPositionFunding",
  CDP_FUNDING: "CdpFunding",
  MASTER_CONTRACT: "MasterContract",
  NEED: "Need",
  PREVIOUS_STUDY: "PreviousStudy",
  CONTRACTOR: "Contractor",

  // SPD-Core — Sub (Seguimiento)
  VARIABLE_ADVANCE: "VariableAdvance",
  INDICATOR_ADVANCE: "IndicatorAdvance",

  // SPD-Core — Budget & SAP
  BUDGET_RECORD: "BudgetRecord",
  SAP_SYNC: "SapSync",
} as const

export type AuditEntityType = typeof AuditEntityTypes[keyof typeof AuditEntityTypes]

// === Labels por tipo de entidad ===
export const ENTITY_TYPE_LABELS: Record<string, string> = {
  // Auth
  [AuditEntityTypes.USER]: "Usuario",
  [AuditEntityTypes.ROLE]: "Rol",
  [AuditEntityTypes.ROLE_PERMISSIONS]: "Permisos de Rol",
  [AuditEntityTypes.USER_ROLE]: "Rol de Usuario",
  [AuditEntityTypes.MODULE]: "Módulo",
  [AuditEntityTypes.PERMISSION]: "Permiso",
  [AuditEntityTypes.ACTION]: "Acción",

  // SPD-Core — Masters
  [AuditEntityTypes.VARIABLE]: "Variable",
  [AuditEntityTypes.VARIABLE_GOAL]: "Meta de Variable",
  [AuditEntityTypes.VARIABLE_QUADRENNIUM]: "Cuatrienio de Variable",
  [AuditEntityTypes.VARIABLE_LOCATION]: "Ubicación de Variable",
  [AuditEntityTypes.LOCATION]: "Ubicación",
  [AuditEntityTypes.MGA_ACTIVITY]: "Actividad MGA",
  [AuditEntityTypes.MGA_DETAILED_RELATION]: "Relación MGA-Detallada",
  [AuditEntityTypes.DETAILED_ACTIVITY]: "Actividad Detallada",
  [AuditEntityTypes.BUDGET_MODIFICATION]: "Modificación Presupuestal",
  [AuditEntityTypes.FORMULA]: "Fórmula",
  [AuditEntityTypes.RUBRIC]: "Rubro",
  [AuditEntityTypes.PRODUCT]: "Producto",

  // SPD-Core — Indicators
  [AuditEntityTypes.INDICATIVE_INDICATOR]: "Indicador Plan Indicativo",
  [AuditEntityTypes.INDICATIVE_INDICATOR_GOAL]: "Meta de Indicador (Plan Indicativo)",
  [AuditEntityTypes.INDICATIVE_INDICATOR_QUADRENNIUM]: "Cuatrienio de Indicador (Plan Indicativo)",
  [AuditEntityTypes.INDICATIVE_INDICATOR_LOCATION]: "Ubicación de Indicador (Plan Indicativo)",
  [AuditEntityTypes.ACTION_INDICATOR]: "Indicador Plan de Acción",
  [AuditEntityTypes.ACTION_INDICATOR_GOAL]: "Meta de Indicador (Plan de Acción)",
  [AuditEntityTypes.ACTION_INDICATOR_QUADRENNIUM]: "Cuatrienio de Indicador (Plan de Acción)",
  [AuditEntityTypes.ACTION_INDICATOR_LOCATION]: "Ubicación de Indicador (Plan de Acción)",
  [AuditEntityTypes.VARIABLE_INDICATIVE_RELATION]: "Relación Variable-Indicador Indicativo",
  [AuditEntityTypes.VARIABLE_ACTION_RELATION]: "Relación Variable-Indicador de Acción",
  [AuditEntityTypes.PROJECT_ACTION_INDICATOR_RELATION]: "Relación Proyecto-Indicador de Acción",
  [AuditEntityTypes.INDICATOR_LOCATION]: "Ubicación de Indicador",

  // SPD-Core — Financial
  [AuditEntityTypes.PROJECT]: "Proyecto",
  [AuditEntityTypes.DEPENDENCY]: "Dependencia",
  [AuditEntityTypes.FUNDING_SOURCE]: "Fuente de Financiación",
  [AuditEntityTypes.POAI_PPA]: "POAI-PPA",
  [AuditEntityTypes.CDP]: "CDP",
  [AuditEntityTypes.CDP_POSITION]: "Posición CDP",
  [AuditEntityTypes.CDP_POSITION_FUNDING]: "Financiamiento Posición CDP",
  [AuditEntityTypes.CDP_FUNDING]: "Financiamiento CDP",
  [AuditEntityTypes.MASTER_CONTRACT]: "Contrato Marco",
  [AuditEntityTypes.NEED]: "Necesidad",
  [AuditEntityTypes.PREVIOUS_STUDY]: "Estudio Previo",
  [AuditEntityTypes.CONTRACTOR]: "Contratista",

  // SPD-Core — Sub (Seguimiento)
  [AuditEntityTypes.VARIABLE_ADVANCE]: "Avance de Variable",
  [AuditEntityTypes.INDICATOR_ADVANCE]: "Avance de Indicador",

  // SPD-Core — Budget & SAP
  [AuditEntityTypes.BUDGET_RECORD]: "Registro Presupuestal",
  [AuditEntityTypes.SAP_SYNC]: "Sincronización SAP",
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

export function getActionColor(action: string): AuditActionColor {
  return ACTION_COLORS[action] ?? "default"
}

export function getFieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field
}

export function getEntityTypeLabel(entityType: string): string {
  return ENTITY_TYPE_LABELS[entityType] ?? entityType
}

export function getMetadataLabel(key: string): string {
  return METADATA_LABELS[key] ?? key.replaceAll(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).trim()
}

