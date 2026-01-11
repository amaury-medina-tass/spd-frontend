export type RoleAction = {
  code: string
  name: string
  allowed: boolean
}

export type RoleModulePermission = {
  moduleName: string
  actions: RoleAction[]
}

export type RolePermissions = {
  [modulePath: string]: RoleModulePermission
}

export type Role = {
  id: string
  name: string
  description?: string
  is_active: boolean
  is_default?: boolean
  system?: string
  created_at: string
  updated_at: string
  permissions?: RolePermissions
}