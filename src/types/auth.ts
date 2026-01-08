export type ActionPermissions = {
  READ?: boolean
  CREATE?: boolean
  UPDATE?: boolean
  DELETE?: boolean
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
  name: string
  is_active: boolean
  roles: string[]
  permissions: PermissionsMap
}