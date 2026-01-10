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

    // Access Control
    ROLE_NOT_FOUND: "ROLE_NOT_FOUND",
    ROLE_ALREADY_ASSIGNED: "ROLE_ALREADY_ASSIGNED",
    ROLE_NOT_ASSIGNED: "ROLE_NOT_ASSIGNED",
    EMAIL_IN_USE: "EMAIL_IN_USE",
    DOCUMENT_IN_USE: "DOCUMENT_IN_USE",
    DOCUMENT_ALREADY_REGISTERED: "DOCUMENT_ALREADY_REGISTERED",
    DEFAULT_ROLE_NOT_FOUND: "DEFAULT_ROLE_NOT_FOUND",
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

export const ERROR_CODES: Record<string, string> = {
    [ErrorCodes.INVALID_CREDENTIALS]: "Credenciales inválidas",
    [ErrorCodes.USER_INACTIVE]: "Usuario inactivo contacta al administrador",
    [ErrorCodes.EMAIL_NOT_VERIFIED]: "Correo electrónico no verificado",
    [ErrorCodes.EMAIL_ALREADY_VERIFIED]: "El correo electrónico ya ha sido verificado",
    [ErrorCodes.EMAIL_ALREADY_REGISTERED]: "El correo electrónico ya está registrado",
    [ErrorCodes.USER_NOT_FOUND]: "Usuario no encontrado",
    [ErrorCodes.INVALID_VERIFICATION_CODE]: "Código de verificación inválido",
    [ErrorCodes.INVALID_PASSWORD]: "Contraseña inválida",
    [ErrorCodes.EMAIL_NOT_VERIFIED_FOR_RESET]: "El correo no está verificado para restablecer contraseña",
    [ErrorCodes.INVALID_RESET_CODE]: "Código de restablecimiento inválido",
    [ErrorCodes.INVALID_REFRESH_TOKEN]: "Token de actualización inválido",
    [ErrorCodes.REFRESH_TOKEN_REVOKED]: "Token de actualización revocado",

    // Access Control Messages
    [ErrorCodes.ROLE_NOT_FOUND]: "Rol no encontrado",
    [ErrorCodes.ROLE_ALREADY_ASSIGNED]: "El usuario ya tiene asignado este rol",
    [ErrorCodes.ROLE_NOT_ASSIGNED]: "El usuario no tiene asignado este rol",
    [ErrorCodes.EMAIL_IN_USE]: "El correo electrónico ya está en uso",
    [ErrorCodes.DOCUMENT_IN_USE]: "El documento ya está en uso",
    [ErrorCodes.DOCUMENT_ALREADY_REGISTERED]: "El documento ya está registrado",
    [ErrorCodes.DEFAULT_ROLE_NOT_FOUND]: "Rol por defecto no encontrado",
}

export const getErrorMessage = (code: string): string => {
    return ERROR_CODES[code] ?? "Error inesperado"
}
