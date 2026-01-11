export type ActionPermission = {
  name: string
  allowed: boolean
}

export type ActionPermissions = {
  [action: string]: ActionPermission
}

export type ModulePermission = {
  name: string
  actions: ActionPermissions
}

export type PermissionsMap = {
  [path: string]: ModulePermission
}

export type SessionMeResponse = {
  id: string
  email: string
  document_number: string
  first_name: string
  last_name: string
  is_active: boolean
  roles: string[]
  permissions: PermissionsMap
}