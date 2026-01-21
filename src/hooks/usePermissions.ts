// src/hooks/usePermissions.ts
"use client"

import { useAuth } from "@/components/auth/useAuth"
import { useCallback, useMemo } from "react"

export type ActionCode = "CREATE" | "READ" | "UPDATE" | "DELETE" | "ASSIGN_ROLE" | "ASSIGN_PERMISSION" | "ASSIGN_ACTION" | "BUDGET_MODIFICATION"

export function usePermissions(modulePath: string) {
    const { me } = useAuth()

    const modulePermissions = useMemo(() => {
        if (!me?.permissions) return null
        return me.permissions[modulePath] ?? null
    }, [me, modulePath])

    const hasPermission = useCallback((actionCode: ActionCode): boolean => {
        if (!modulePermissions?.actions) return false
        const action = modulePermissions.actions[actionCode]
        return action?.allowed === true
    }, [modulePermissions])

    const canCreate = useMemo(() => hasPermission("CREATE"), [hasPermission])
    const canRead = useMemo(() => hasPermission("READ"), [hasPermission])
    const canUpdate = useMemo(() => hasPermission("UPDATE"), [hasPermission])
    const canDelete = useMemo(() => hasPermission("DELETE"), [hasPermission])
    const canAssignRole = useMemo(() => hasPermission("ASSIGN_ROLE"), [hasPermission])
    const canAssignPermission = useMemo(() => hasPermission("ASSIGN_PERMISSION"), [hasPermission])
    const canAssignAction = useMemo(() => hasPermission("ASSIGN_ACTION"), [hasPermission])
    const canModifyBudget = useMemo(() => hasPermission("BUDGET_MODIFICATION"), [hasPermission])

    return {
        modulePermissions,
        hasPermission,
        canCreate,
        canRead,
        canUpdate,
        canDelete,
        canAssignRole,
        canAssignPermission,
        canAssignAction,
        canModifyBudget,
    }
}
