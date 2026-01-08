export type SessionMeResponse = {
  user: {
    id: string
    email: string
    is_active: boolean
    created_at?: string
    updated_at?: string
  }
  roles: Array<{
    id: string
    name: string
    description?: string
    is_active?: boolean
  }>
  permissions: Array<{
    module: {id: string; name: string; path: string}
    action: {id: string; name: string}
    allowed: boolean
  }>
}