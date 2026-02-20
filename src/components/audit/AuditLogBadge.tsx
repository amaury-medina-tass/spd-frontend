"use client"

import { Chip } from "@heroui/react"
import { getActionLabel, getActionColor, getEntityTypeLabel } from "@/lib/audit-codes"
import {
  CheckCircle,
  XCircle,
  Shield,
  ShieldOff,
  UserPlus,
  UserCog,
  UserMinus,
  Key,
  LogIn,
  LogOut,
  Lock,
  Package,
  Zap,
} from "lucide-react"
import { ReactNode } from "react"

type BadgeSize = "sm" | "md" | "lg"

interface AuditActionBadgeProps {
  action: string
  actionLabel?: string
  size?: BadgeSize
}

const ACTION_ICONS: Record<string, ReactNode> = {
  USER_CREATED: <UserPlus size={14} />,
  USER_UPDATED: <UserCog size={14} />,
  USER_DELETED: <UserMinus size={14} />,
  USER_ACTIVATED: <UserPlus size={14} />,
  USER_DEACTIVATED: <UserMinus size={14} />,
  ROLE_ASSIGNED: <Shield size={14} />,
  ROLE_UNASSIGNED: <ShieldOff size={14} />,
  ROLE_CREATED: <Shield size={14} />,
  ROLE_UPDATED: <Shield size={14} />,
  ROLE_DELETED: <ShieldOff size={14} />,
  PERMISSION_GRANTED: <Key size={14} />,
  PERMISSION_REVOKED: <Key size={14} />,
  LOGIN_SUCCESS: <LogIn size={14} />,
  LOGIN_FAILED: <LogIn size={14} />,
  LOGOUT: <LogOut size={14} />,
  PASSWORD_CHANGED: <Lock size={14} />,
  PASSWORD_RESET_REQUESTED: <Lock size={14} />,
  MODULE_CREATED: <Package size={14} />,
  MODULE_UPDATED: <Package size={14} />,
  MODULE_DELETED: <Package size={14} />,
  ACTION_CREATED: <Zap size={14} />,
  ACTION_UPDATED: <Zap size={14} />,
  ACTION_DELETED: <Zap size={14} />,
}

export function AuditActionBadge({
  action,
  actionLabel,
  size = "sm",
}: Readonly<AuditActionBadgeProps>) {
  const color = getActionColor(action)
  const label = actionLabel || getActionLabel(action)

  return (
    <Chip
      color={color}
      variant="flat"
      size={size}
      startContent={ACTION_ICONS[action]}
      classNames={{
        base: "gap-1",
      }}
    >
      {label}
    </Chip>
  )
}

interface AuditStatusBadgeProps {
  success: boolean
  size?: BadgeSize
}

export function AuditStatusBadge({ success, size = "sm" }: Readonly<AuditStatusBadgeProps>) {
  return (
    <Chip
      color={success ? "success" : "danger"}
      variant="dot"
      size={size}
      startContent={success ? <CheckCircle size={12} /> : <XCircle size={12} />}
    >
      {success ? "Exitoso" : "Fallido"}
    </Chip>
  )
}

interface AuditEntityBadgeProps {
  entityType: string
  size?: BadgeSize
}

export function AuditEntityBadge({ entityType, size = "sm" }: Readonly<AuditEntityBadgeProps>) {
  return (
    <Chip color="default" variant="bordered" size={size}>
      {getEntityTypeLabel(entityType)}
    </Chip>
  )
}

