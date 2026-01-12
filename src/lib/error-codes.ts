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
}

export const getErrorMessage = (code: string): string => {
    return ERROR_CODES[code] ?? "Error inesperado"
}
