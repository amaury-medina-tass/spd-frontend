"use client"

import { Button, Breadcrumbs, BreadcrumbItem, Chip, SortDescriptor } from "@heroui/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction } from "@/components/tables/DataTable"
import { useDebounce } from "@/hooks/useDebounce"
import { UserInfoModal } from "@/components/modals/users/UserInfoModal"
import { UserRoleModal } from "@/components/modals/users/UserRoleModal"
import { get, post, patch, del, PaginatedData, PaginationMeta } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Pencil, Trash2, Plus, Shield } from "lucide-react"
import type { User } from "@/types/user"

// Definición de columnas
const columns: ColumnDef<User>[] = [
  { key: "first_name", label: "Nombre", sortable: true },
  { key: "last_name", label: "Apellido", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "roles", label: "Roles", sortable: false, render: (user) => user.roles?.map((r) => r.name).join(", ") ?? "N/A" },
  { key: "document_number", label: "Documento", sortable: true },
  {
    key: "created_at",
    label: "Creado",
    sortable: true,
    render: (user) => new Date(user.created_at).toLocaleString(),
  },
  {
    key: "updated_at",
    label: "Actualizado",
    sortable: true,
    render: (user) => new Date(user.updated_at).toLocaleString(),
  },
  {
    key: "is_active",
    label: "Estado",
    sortable: true,
    render: (user) => (
      <Chip color={user.is_active ? "success" : "danger"} variant="flat" size="sm">
        {user.is_active ? "Activo" : "Inactivo"}
      </Chip>
    ),
  },
]

export default function AccessControlUsersPage() {
  const [items, setItems] = useState<User[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filtros y paginación
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [limit, setLimit] = useState(10)
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "created_at",
    direction: "descending",
  })

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (search.trim()) {
        params.set("search", search.trim())
      }

      if (sortDescriptor.column) {
        params.set("sortBy", sortDescriptor.column as string)
        params.set("sortOrder", sortDescriptor.direction === "ascending" ? "ASC" : "DESC")
      }

      const result = await get<PaginatedData<User>>(`${endpoints.accessControl.users}?${params}`)
      setItems(result.data)
      setMeta(result.meta)
    } catch (e: any) {
      setError(e.message ?? "Error al cargar usuarios")
    } finally {
      setLoading(false)
    }
  }, [page, search, limit, sortDescriptor])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebounce(searchInput, 400)

  useEffect(() => {
    setSearch(debouncedSearch)
    setPage(1) // Reset page on search
  }, [debouncedSearch])

  const onCreate = () => {
    setEditing(null)
    setIsInfoModalOpen(true)
  }

  const onEdit = async (user: User) => {
    try {
      const freshUser = await get<User>(`${endpoints.accessControl.users}/${user.id}`)
      setEditing(freshUser)
      setIsInfoModalOpen(true)
    } catch (error) {
      console.error("Error fetching user details:", error)
    }
  }

  const onManageRole = async (user: User) => {
    try {
      const freshUser = await get<User>(`${endpoints.accessControl.users}/${user.id}`)
      setSelectedUserForRole(freshUser)
      setIsRoleModalOpen(true)
    } catch (error) {
      console.error("Error fetching user details:", error)
    }
  }

  const onDelete = (user: User) => {
    // TODO: Implementar confirmación y llamada al API para eliminar
    console.log("Eliminar usuario:", user.id)
  }

  const onSaveInfo = async (payload: any) => {
    setSaving(true)
    try {
      if (editing) {
        // En modo edición solo enviamos los campos permitidos
        const updatePayload = {
          first_name: payload.firstName,
          last_name: payload.lastName,
          document_number: payload.documentNumber,
          email: payload.email,
          is_active: payload.is_active,
        }
        await patch(`${endpoints.accessControl.users}/${editing.id}`, updatePayload)
      } else {
        // En modo creación se envía todo el payload original
        const createPayload = {
          first_name: payload.firstName,
          last_name: payload.lastName,
          document_number: payload.documentNumber,
          email: payload.email,
          password: payload.password,
          is_active: payload.is_active,
        }
        await post(endpoints.accessControl.users, createPayload)
      }
      setIsInfoModalOpen(false)
      setEditing(null)
      fetchUsers()
    } catch (error) {
      console.error("Error saving user:", error)
      // Aquí podrías setear un estado de error para mostrar en el modal o un toast
    } finally {
      setSaving(false)
    }
  }

  const onSaveRole = async (roleId: string) => {
    if (!selectedUserForRole) return
    setSaving(true)
    try {
      // TODO: Implement actual assignment if endpoint is available.
      // For now simulating delay.
      console.log("Updating role:", selectedUserForRole.id, roleId)
      await new Promise(resolve => setTimeout(resolve, 100000))

      setIsRoleModalOpen(false)
      setSelectedUserForRole(null)
      fetchUsers()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const onUnassignRole = async (roleId: string) => {
    if (!selectedUserForRole) return
    setSaving(true)
    try {
      await del(endpoints.accessControl.roles.unassign, {
        body: {
          userId: selectedUserForRole.id,
          roleId: roleId
        }
      })
      const freshUser = await get<User>(`${endpoints.accessControl.users}/${selectedUserForRole.id}`)
      setSelectedUserForRole(freshUser)
      fetchUsers()
    } catch (error) {
      console.error("Error unassigning role:", error)
    } finally {
      setSaving(false)
    }
  }

  // Acciones de fila
  const rowActions: RowAction<User>[] = [
    {
      key: "edit",
      label: "Editar",
      icon: <Pencil size={16} />,
      onClick: onEdit,
    },
    {
      key: "role",
      label: "Gestionar Rol",
      icon: <Shield size={16} />,
      onClick: onManageRole,
    },
    {
      key: "delete",
      label: "Eliminar",
      icon: <Trash2 size={16} />,
      color: "danger",
      onClick: onDelete,
    },
  ]

  // Acciones de barra superior
  const topActions: TopAction[] = [
    {
      key: "create",
      label: "Crear",
      icon: <Plus size={16} />,
      color: "primary",
      onClick: onCreate,
    },
  ]

  const title = useMemo(() => (editing ? "Editar usuario" : "Crear usuario"), [editing])

  return (
    <div className="grid gap-4">
      <Breadcrumbs>
        <BreadcrumbItem>Inicio</BreadcrumbItem>
        <BreadcrumbItem>Control de Acceso</BreadcrumbItem>
        <BreadcrumbItem>Usuarios</BreadcrumbItem>
      </Breadcrumbs>

      {error ? (
        <div className="text-center py-8 text-danger">
          <p>{error}</p>
          <Button variant="flat" className="mt-2" onPress={fetchUsers}>
            Reintentar
          </Button>
        </div>
      ) : (
        <DataTable
          items={items}
          columns={columns}
          isLoading={loading}
          rowActions={rowActions}
          topActions={topActions}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Buscar usuarios..."
          ariaLabel="Tabla de usuarios"
          pagination={meta ? {
            page,
            totalPages: meta.totalPages,
            onChange: setPage,
            pageSize: limit,
            onPageSizeChange: (newLimit) => {
              setLimit(newLimit)
              setPage(1)
            }
          } : undefined}
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
        />
      )}

      <UserInfoModal
        isOpen={isInfoModalOpen}
        title={title}
        initial={editing}
        isLoading={saving}
        onClose={() => {
          setIsInfoModalOpen(false)
          setEditing(null)
        }}
        onSave={onSaveInfo}
      />

      <UserRoleModal
        isOpen={isRoleModalOpen}
        user={selectedUserForRole}
        isLoading={saving}
        onClose={() => {
          setIsRoleModalOpen(false)
          setSelectedUserForRole(null)
        }}
        onSave={onSaveRole}
        onUnassign={onUnassignRole}
      />
    </div>
  )
}