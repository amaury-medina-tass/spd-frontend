export const ErrorCodes = {
    // Auth
    INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
    USER_INACTIVE: "USER_INACTIVE",
    EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
    EMAIL_ALREADY_VERIFIED: "EMAIL_ALREADY_VERIFIED",
    EMAIL_ALREADY_REGISTERED: "EMAIL_ALREADY_REGISTERED",
    USER_NOT_FOUND: "USER_NOT_FOUND",
    INVALID_VERIFICATION_CODE: "INVALID_VERIFICATION_CODE",
    INVALID_PASSWORD: "INVALID_PASSWORD",
    EMAIL_NOT_VERIFIED_FOR_RESET: "EMAIL_NOT_VERIFIED_FOR_RESET",
    INVALID_RESET_CODE: "INVALID_RESET_CODE",

    // Token
    INVALID_REFRESH_TOKEN: "INVALID_REFRESH_TOKEN",
    REFRESH_TOKEN_REVOKED: "REFRESH_TOKEN_REVOKED",

    // Roles
    ROLE_NOT_FOUND: "ROLE_NOT_FOUND",
    ROLE_ALREADY_ASSIGNED: "ROLE_ALREADY_ASSIGNED",
    ROLE_NOT_ASSIGNED: "ROLE_NOT_ASSIGNED",
    ROLE_ALREADY_EXISTS: "ROLE_ALREADY_EXISTS",
    ROLE_HAS_USERS: "ROLE_HAS_USERS",

    // Modules
    MODULE_NOT_FOUND: "MODULE_NOT_FOUND",
    MODULE_ALREADY_EXISTS: "MODULE_ALREADY_EXISTS",
    MODULE_PUBLIC_CANNOT_MODIFY: "MODULE_PUBLIC_CANNOT_MODIFY",
    MODULE_PUBLIC_CANNOT_DELETE: "MODULE_PUBLIC_CANNOT_DELETE",

    // Actions
    ACTION_NOT_FOUND: "ACTION_NOT_FOUND",
    ACTION_ALREADY_EXISTS: "ACTION_ALREADY_EXISTS",

    // Permissions
    PERMISSION_NOT_FOUND: "PERMISSION_NOT_FOUND",
    PERMISSION_ALREADY_EXISTS: "PERMISSION_ALREADY_EXISTS",

    // Users
    EMAIL_IN_USE: "EMAIL_IN_USE",
    DOCUMENT_IN_USE: "DOCUMENT_IN_USE",
    DOCUMENT_ALREADY_REGISTERED: "DOCUMENT_ALREADY_REGISTERED",
    DEFAULT_ROLE_NOT_FOUND: "DEFAULT_ROLE_NOT_FOUND",
    NOT_REGISTERED_IN_SYSTEM: "NOT_REGISTERED_IN_SYSTEM",
    CANNOT_REMOVE_LAST_ROLE: "CANNOT_REMOVE_LAST_ROLE",

    // Authorization
    FORBIDDEN: "FORBIDDEN",
    NO_ACTIVE_ROLE: "NO_ACTIVE_ROLE",

    // ========================
    // SPD-CORE ERRORS
    // ========================

    // Proyectos
    PROJECT_NOT_FOUND: "PROJECT_NOT_FOUND",
    PROJECT_ALREADY_EXISTS: "PROJECT_ALREADY_EXISTS",
    PROJECT_HAS_DEPENDENCIES: "PROJECT_HAS_DEPENDENCIES",

    // Dependencias
    DEPENDENCY_NOT_FOUND: "DEPENDENCY_NOT_FOUND",

    // Fuentes de Financiación
    FUNDING_SOURCE_NOT_FOUND: "FUNDING_SOURCE_NOT_FOUND",
    FUNDING_SOURCE_ALREADY_EXISTS: "FUNDING_SOURCE_ALREADY_EXISTS",
    FUNDING_SOURCE_IN_USE: "FUNDING_SOURCE_IN_USE",

    // CDP
    CDP_NOT_FOUND: "CDP_NOT_FOUND",
    CDP_POSITION_NOT_FOUND: "CDP_POSITION_NOT_FOUND",
    CDP_POSITION_HAS_FUNDS: "CDP_POSITION_HAS_FUNDS",
    CDP_ACTIVITY_ALREADY_ASSOCIATED: "CDP_ACTIVITY_ALREADY_ASSOCIATED",
    CDP_ACTIVITY_NOT_ASSOCIATED: "CDP_ACTIVITY_NOT_ASSOCIATED",
    CDP_ACTIVITY_HAS_FUNDS: "CDP_ACTIVITY_HAS_FUNDS",
    CDP_ACTIVITY_IN_USE: "CDP_ACTIVITY_IN_USE",
    CDP_ACTIVITY_WRONG_PROJECT: "CDP_ACTIVITY_WRONG_PROJECT",
    CDP_INSUFFICIENT_BALANCE: "CDP_INSUFFICIENT_BALANCE",
    CDP_INVALID_AMOUNT: "CDP_INVALID_AMOUNT",

    // Contratos Marco
    MASTER_CONTRACT_NOT_FOUND: "MASTER_CONTRACT_NOT_FOUND",

    // Necesidades
    NEED_NOT_FOUND: "NEED_NOT_FOUND",

    // Estudios Previos
    PREVIOUS_STUDY_NOT_FOUND: "PREVIOUS_STUDY_NOT_FOUND",

    // Contratistas
    CONTRACTOR_NOT_FOUND: "CONTRACTOR_NOT_FOUND",

    // POAI PPA
    POAI_PPA_NOT_FOUND: "POAI_PPA_NOT_FOUND",
    POAI_PPA_ALREADY_EXISTS: "POAI_PPA_ALREADY_EXISTS",

    // Actividades Detalladas
    DETAILED_ACTIVITY_NOT_FOUND: "DETAILED_ACTIVITY_NOT_FOUND",
    DETAILED_ACTIVITY_ALREADY_EXISTS: "DETAILED_ACTIVITY_ALREADY_EXISTS",
    DETAILED_ACTIVITY_IN_USE: "DETAILED_ACTIVITY_IN_USE",

    // Actividades MGA
    MGA_ACTIVITY_NOT_FOUND: "MGA_ACTIVITY_NOT_FOUND",
    MGA_ACTIVITY_ALREADY_EXISTS: "MGA_ACTIVITY_ALREADY_EXISTS",
    MGA_DETAILED_RELATION_ALREADY_EXISTS: "MGA_DETAILED_RELATION_ALREADY_EXISTS",
    MGA_DETAILED_RELATION_NOT_FOUND: "MGA_DETAILED_RELATION_NOT_FOUND",

    // Variables
    VARIABLE_NOT_FOUND: "VARIABLE_NOT_FOUND",
    VARIABLE_ALREADY_EXISTS: "VARIABLE_ALREADY_EXISTS",
    VARIABLE_IN_USE: "VARIABLE_IN_USE",
    VARIABLE_GOAL_NOT_FOUND: "VARIABLE_GOAL_NOT_FOUND",
    VARIABLE_GOAL_ALREADY_EXISTS: "VARIABLE_GOAL_ALREADY_EXISTS",
    VARIABLE_QUADRENNIUM_NOT_FOUND: "VARIABLE_QUADRENNIUM_NOT_FOUND",
    VARIABLE_QUADRENNIUM_ALREADY_EXISTS: "VARIABLE_QUADRENNIUM_ALREADY_EXISTS",
    VARIABLE_LOCATION_NOT_FOUND: "VARIABLE_LOCATION_NOT_FOUND",
    VARIABLE_LOCATION_ALREADY_EXISTS: "VARIABLE_LOCATION_ALREADY_EXISTS",

    // Rubros
    RUBRIC_NOT_FOUND: "RUBRIC_NOT_FOUND",

    // Productos
    PRODUCT_NOT_FOUND: "PRODUCT_NOT_FOUND",

    // Indicadores Plan Indicativo
    INDICATIVE_INDICATOR_NOT_FOUND: "INDICATIVE_INDICATOR_NOT_FOUND",
    INDICATIVE_INDICATOR_ALREADY_EXISTS: "INDICATIVE_INDICATOR_ALREADY_EXISTS",
    INDICATIVE_INDICATOR_GOAL_NOT_FOUND: "INDICATIVE_INDICATOR_GOAL_NOT_FOUND",
    INDICATIVE_INDICATOR_QUADRENNIUM_NOT_FOUND: "INDICATIVE_INDICATOR_QUADRENNIUM_NOT_FOUND",

    // Indicadores Plan de Acción
    ACTION_INDICATOR_NOT_FOUND: "ACTION_INDICATOR_NOT_FOUND",
    ACTION_INDICATOR_ALREADY_EXISTS: "ACTION_INDICATOR_ALREADY_EXISTS",
    ACTION_INDICATOR_GOAL_NOT_FOUND: "ACTION_INDICATOR_GOAL_NOT_FOUND",
    ACTION_INDICATOR_QUADRENNIUM_NOT_FOUND: "ACTION_INDICATOR_QUADRENNIUM_NOT_FOUND",

    // Relaciones Variable-Indicador
    VARIABLE_INDICATOR_RELATION_ALREADY_EXISTS: "VARIABLE_INDICATOR_RELATION_ALREADY_EXISTS",
    VARIABLE_INDICATOR_RELATION_NOT_FOUND: "VARIABLE_INDICATOR_RELATION_NOT_FOUND",

    // Relaciones Proyecto-Indicador
    PROJECT_ACTION_INDICATOR_RELATION_ALREADY_EXISTS: "PROJECT_ACTION_INDICATOR_RELATION_ALREADY_EXISTS",
    PROJECT_ACTION_INDICATOR_RELATION_NOT_FOUND: "PROJECT_ACTION_INDICATOR_RELATION_NOT_FOUND",

    // Ubicaciones de Indicadores
    INDICATOR_LOCATION_NOT_FOUND: "INDICATOR_LOCATION_NOT_FOUND",
    INDICATOR_LOCATION_ALREADY_EXISTS: "INDICATOR_LOCATION_ALREADY_EXISTS",

    // Fórmulas
    FORMULA_NOT_FOUND: "FORMULA_NOT_FOUND",
    FORMULA_INVALID_INDICATOR: "FORMULA_INVALID_INDICATOR",

    // Modificaciones Presupuestales
    BUDGET_MODIFICATION_NOT_FOUND: "BUDGET_MODIFICATION_NOT_FOUND",
    BUDGET_MODIFICATION_INVALID_VALUE: "BUDGET_MODIFICATION_INVALID_VALUE",
    BUDGET_MODIFICATION_INSUFFICIENT_BALANCE: "BUDGET_MODIFICATION_INSUFFICIENT_BALANCE",
    BUDGET_MODIFICATION_SAME_RUBRIC: "BUDGET_MODIFICATION_SAME_RUBRIC",
    BUDGET_MODIFICATION_UNSUPPORTED_TYPE: "BUDGET_MODIFICATION_UNSUPPORTED_TYPE",

    // Avances
    VARIABLE_ADVANCE_NOT_FOUND: "VARIABLE_ADVANCE_NOT_FOUND",
    INDICATOR_ADVANCE_NOT_FOUND: "INDICATOR_ADVANCE_NOT_FOUND",

    // SAP
    SAP_SYNC_FAILED: "SAP_SYNC_FAILED",

    // Registros Presupuestales
    BUDGET_RECORD_NOT_FOUND: "BUDGET_RECORD_NOT_FOUND",

    // Ubicaciones
    LOCATION_NOT_FOUND: "LOCATION_NOT_FOUND",
    COMMUNE_NOT_FOUND: "COMMUNE_NOT_FOUND",

    // General
    DUPLICATE_ENTRY: "DUPLICATE_ENTRY",
    VALIDATION_ERROR: "VALIDATION_ERROR",
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

export const ERROR_CODES: Record<string, string> = {
    // Auth Messages
    [ErrorCodes.INVALID_CREDENTIALS]: "Credenciales inválidas",
    [ErrorCodes.USER_INACTIVE]: "Usuario inactivo, contacta al administrador",
    [ErrorCodes.EMAIL_NOT_VERIFIED]: "Correo electrónico no verificado",
    [ErrorCodes.EMAIL_ALREADY_VERIFIED]: "El correo electrónico ya ha sido verificado",
    [ErrorCodes.EMAIL_ALREADY_REGISTERED]: "El correo electrónico ya está registrado",
    [ErrorCodes.USER_NOT_FOUND]: "Usuario no encontrado",
    [ErrorCodes.INVALID_VERIFICATION_CODE]: "Código de verificación inválido",
    [ErrorCodes.INVALID_PASSWORD]: "Contraseña inválida",
    [ErrorCodes.EMAIL_NOT_VERIFIED_FOR_RESET]: "El correo no está verificado para restablecer contraseña",
    [ErrorCodes.INVALID_RESET_CODE]: "Código de restablecimiento inválido",

    // Token Messages
    [ErrorCodes.INVALID_REFRESH_TOKEN]: "Token de actualización inválido",
    [ErrorCodes.REFRESH_TOKEN_REVOKED]: "Token de actualización revocado",

    // Roles Messages
    [ErrorCodes.ROLE_NOT_FOUND]: "Rol no encontrado",
    [ErrorCodes.ROLE_ALREADY_ASSIGNED]: "El usuario ya tiene asignado este rol",
    [ErrorCodes.ROLE_NOT_ASSIGNED]: "El usuario no tiene asignado este rol",
    [ErrorCodes.ROLE_ALREADY_EXISTS]: "El rol ya existe",
    [ErrorCodes.ROLE_HAS_USERS]: "El rol tiene usuarios asignados y no puede ser eliminado",

    // Modules Messages
    [ErrorCodes.MODULE_NOT_FOUND]: "Módulo no encontrado",
    [ErrorCodes.MODULE_ALREADY_EXISTS]: "El módulo ya existe",
    [ErrorCodes.MODULE_PUBLIC_CANNOT_MODIFY]: "No se puede modificar un módulo público",
    [ErrorCodes.MODULE_PUBLIC_CANNOT_DELETE]: "No se puede eliminar un módulo público",

    // Actions Messages
    [ErrorCodes.ACTION_NOT_FOUND]: "Acción no encontrada",
    [ErrorCodes.ACTION_ALREADY_EXISTS]: "La acción ya existe",

    // Permissions Messages
    [ErrorCodes.PERMISSION_NOT_FOUND]: "Permiso no encontrado",
    [ErrorCodes.PERMISSION_ALREADY_EXISTS]: "El permiso ya existe",

    // Users Messages
    [ErrorCodes.EMAIL_IN_USE]: "El correo electrónico ya está en uso",
    [ErrorCodes.DOCUMENT_IN_USE]: "El documento ya está en uso",
    [ErrorCodes.DOCUMENT_ALREADY_REGISTERED]: "El documento ya está registrado",
    [ErrorCodes.DEFAULT_ROLE_NOT_FOUND]: "Rol por defecto no encontrado",
    [ErrorCodes.NOT_REGISTERED_IN_SYSTEM]: "Usuario no registrado en este sistema",
    [ErrorCodes.CANNOT_REMOVE_LAST_ROLE]: "No se puede remover el último rol del usuario",

    // Authorization Messages
    [ErrorCodes.FORBIDDEN]: "No tienes permisos para realizar esta acción",
    [ErrorCodes.NO_ACTIVE_ROLE]: "No tienes un rol activo en el sistema",

    // Proyectos Messages
    [ErrorCodes.PROJECT_NOT_FOUND]: "Proyecto no encontrado",
    [ErrorCodes.PROJECT_ALREADY_EXISTS]: "El proyecto ya existe",
    [ErrorCodes.PROJECT_HAS_DEPENDENCIES]: "El proyecto tiene dependencias y no puede ser eliminado",

    // Dependencias Messages
    [ErrorCodes.DEPENDENCY_NOT_FOUND]: "Dependencia no encontrada",

    // Fuentes de Financiación Messages
    [ErrorCodes.FUNDING_SOURCE_NOT_FOUND]: "Fuente de financiación no encontrada",
    [ErrorCodes.FUNDING_SOURCE_ALREADY_EXISTS]: "La fuente de financiación ya existe",
    [ErrorCodes.FUNDING_SOURCE_IN_USE]: "La fuente de financiación está en uso",

    // CDP Messages
    [ErrorCodes.CDP_NOT_FOUND]: "CDP no encontrado",
    [ErrorCodes.CDP_POSITION_NOT_FOUND]: "Posición CDP no encontrada",
    [ErrorCodes.CDP_POSITION_HAS_FUNDS]: "La posición CDP tiene fondos asignados",
    [ErrorCodes.CDP_ACTIVITY_ALREADY_ASSOCIATED]: "La actividad ya está asociada",
    [ErrorCodes.CDP_ACTIVITY_NOT_ASSOCIATED]: "La actividad no está asociada",
    [ErrorCodes.CDP_ACTIVITY_HAS_FUNDS]: "La actividad tiene fondos asignados",
    [ErrorCodes.CDP_ACTIVITY_IN_USE]: "La actividad está en uso",
    [ErrorCodes.CDP_ACTIVITY_WRONG_PROJECT]: "La actividad no pertenece a este proyecto",
    [ErrorCodes.CDP_INSUFFICIENT_BALANCE]: "Saldo insuficiente en CDP",
    [ErrorCodes.CDP_INVALID_AMOUNT]: "Monto inválido",

    // Contratos Marco Messages
    [ErrorCodes.MASTER_CONTRACT_NOT_FOUND]: "Contrato marco no encontrado",

    // Necesidades Messages
    [ErrorCodes.NEED_NOT_FOUND]: "Necesidad no encontrada",

    // Estudios Previos Messages
    [ErrorCodes.PREVIOUS_STUDY_NOT_FOUND]: "Estudio previo no encontrado",

    // Contratistas Messages
    [ErrorCodes.CONTRACTOR_NOT_FOUND]: "Contratista no encontrado",

    // POAI PPA Messages
    [ErrorCodes.POAI_PPA_NOT_FOUND]: "POAI-PPA no encontrado",
    [ErrorCodes.POAI_PPA_ALREADY_EXISTS]: "El POAI-PPA ya existe",

    // Actividades Detalladas Messages
    [ErrorCodes.DETAILED_ACTIVITY_NOT_FOUND]: "Actividad detallada no encontrada",
    [ErrorCodes.DETAILED_ACTIVITY_ALREADY_EXISTS]: "La actividad detallada ya existe",
    [ErrorCodes.DETAILED_ACTIVITY_IN_USE]: "La actividad detallada está en uso",

    // Actividades MGA Messages
    [ErrorCodes.MGA_ACTIVITY_NOT_FOUND]: "Actividad MGA no encontrada",
    [ErrorCodes.MGA_ACTIVITY_ALREADY_EXISTS]: "La actividad MGA ya existe",
    [ErrorCodes.MGA_DETAILED_RELATION_ALREADY_EXISTS]: "La relación ya existe",
    [ErrorCodes.MGA_DETAILED_RELATION_NOT_FOUND]: "La relación no existe",

    // Variables Messages
    [ErrorCodes.VARIABLE_NOT_FOUND]: "Variable no encontrada",
    [ErrorCodes.VARIABLE_ALREADY_EXISTS]: "La variable ya existe",
    [ErrorCodes.VARIABLE_IN_USE]: "La variable está en uso",
    [ErrorCodes.VARIABLE_GOAL_NOT_FOUND]: "Meta de variable no encontrada",
    [ErrorCodes.VARIABLE_GOAL_ALREADY_EXISTS]: "La meta de variable ya existe",
    [ErrorCodes.VARIABLE_QUADRENNIUM_NOT_FOUND]: "Cuatrienio de variable no encontrado",
    [ErrorCodes.VARIABLE_QUADRENNIUM_ALREADY_EXISTS]: "El cuatrienio de variable ya existe",
    [ErrorCodes.VARIABLE_LOCATION_NOT_FOUND]: "Ubicación de variable no encontrada",
    [ErrorCodes.VARIABLE_LOCATION_ALREADY_EXISTS]: "La ubicación de variable ya existe",

    // Rubros Messages
    [ErrorCodes.RUBRIC_NOT_FOUND]: "Rubro no encontrado",

    // Productos Messages
    [ErrorCodes.PRODUCT_NOT_FOUND]: "Producto no encontrado",

    // Indicadores Plan Indicativo Messages
    [ErrorCodes.INDICATIVE_INDICATOR_NOT_FOUND]: "Indicador de plan indicativo no encontrado",
    [ErrorCodes.INDICATIVE_INDICATOR_ALREADY_EXISTS]: "El indicador de plan indicativo ya existe",
    [ErrorCodes.INDICATIVE_INDICATOR_GOAL_NOT_FOUND]: "Meta de indicador de plan indicativo no encontrada",
    [ErrorCodes.INDICATIVE_INDICATOR_QUADRENNIUM_NOT_FOUND]: "Cuatrienio de indicador de plan indicativo no encontrado",

    // Indicadores Plan de Acción Messages
    [ErrorCodes.ACTION_INDICATOR_NOT_FOUND]: "Indicador de plan de acción no encontrado",
    [ErrorCodes.ACTION_INDICATOR_ALREADY_EXISTS]: "El indicador de plan de acción ya existe",
    [ErrorCodes.ACTION_INDICATOR_GOAL_NOT_FOUND]: "Meta de indicador de plan de acción no encontrada",
    [ErrorCodes.ACTION_INDICATOR_QUADRENNIUM_NOT_FOUND]: "Cuatrienio de indicador de plan de acción no encontrado",

    // Relaciones Variable-Indicador Messages
    [ErrorCodes.VARIABLE_INDICATOR_RELATION_ALREADY_EXISTS]: "La relación entre variable e indicador ya existe",
    [ErrorCodes.VARIABLE_INDICATOR_RELATION_NOT_FOUND]: "La relación entre variable e indicador no existe",

    // Relaciones Proyecto-Indicador Messages
    [ErrorCodes.PROJECT_ACTION_INDICATOR_RELATION_ALREADY_EXISTS]: "La relación entre proyecto e indicador ya existe",
    [ErrorCodes.PROJECT_ACTION_INDICATOR_RELATION_NOT_FOUND]: "La relación entre proyecto e indicador no existe",

    // Ubicaciones de Indicadores Messages
    [ErrorCodes.INDICATOR_LOCATION_NOT_FOUND]: "Ubicación de indicador no encontrada",
    [ErrorCodes.INDICATOR_LOCATION_ALREADY_EXISTS]: "La ubicación de indicador ya existe",

    // Fórmulas Messages
    [ErrorCodes.FORMULA_NOT_FOUND]: "Fórmula no encontrada",
    [ErrorCodes.FORMULA_INVALID_INDICATOR]: "Indicador inválido para la fórmula",

    // Modificaciones Presupuestales Messages
    [ErrorCodes.BUDGET_MODIFICATION_NOT_FOUND]: "Modificación presupuestal no encontrada",
    [ErrorCodes.BUDGET_MODIFICATION_INVALID_VALUE]: "Valor de modificación inválido",
    [ErrorCodes.BUDGET_MODIFICATION_INSUFFICIENT_BALANCE]: "Saldo insuficiente para la modificación",
    [ErrorCodes.BUDGET_MODIFICATION_SAME_RUBRIC]: "El rubro de origen y destino no pueden ser iguales",
    [ErrorCodes.BUDGET_MODIFICATION_UNSUPPORTED_TYPE]: "Tipo de modificación no soportado",

    // Avances Messages
    [ErrorCodes.VARIABLE_ADVANCE_NOT_FOUND]: "Avance de variable no encontrado",
    [ErrorCodes.INDICATOR_ADVANCE_NOT_FOUND]: "Avance de indicador no encontrado",

    // SAP Messages
    [ErrorCodes.SAP_SYNC_FAILED]: "La sincronización con SAP falló",

    // Registros Presupuestales Messages
    [ErrorCodes.BUDGET_RECORD_NOT_FOUND]: "Registro presupuestal no encontrado",

    // Ubicaciones Messages
    [ErrorCodes.LOCATION_NOT_FOUND]: "Ubicación no encontrada",
    [ErrorCodes.COMMUNE_NOT_FOUND]: "Comuna no encontrada",

    // General Messages
    [ErrorCodes.DUPLICATE_ENTRY]: "Entrada duplicada",
    [ErrorCodes.VALIDATION_ERROR]: "Error de validación",
}

export const getErrorMessage = (code: string): string => {
    return ERROR_CODES[code] ?? "Error inesperado"
}
