export type Role = {
  id: string
  name: string
}

export type User = {
  id: string
  email: string
  document_number: string
  first_name: string
  last_name: string
  is_active: boolean
  created_at: string
  updated_at: string
  roles: Role[]
}

export type UserWithRoles = {
  id: string
  first_name: string
  last_name: string
  email: string
  document_number: string
  roles: Role[]
  missingRoles: Role[]
}