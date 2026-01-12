export type Module = {
  id: string
  name: string
  description?: string
  path: string
  created_at: string
  updated_at: string
}

export type ModuleAction = {
  id: string
  code: string
  name: string
  permissionId: string
}

export type MissingAction = {
  id: string
  code: string
  name: string
}

export type ModuleWithActions = {
  id: string
  name: string
  path: string
  description?: string
  actions: ModuleAction[]
  missingActions: MissingAction[]
}