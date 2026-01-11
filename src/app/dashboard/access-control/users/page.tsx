"use client"

import { Button, Breadcrumbs, BreadcrumbItem, Chip, SortDescriptor } from "@heroui/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction } from "@/components/tables/DataTable"
import { useDebounce } from "@/hooks/useDebounce"
import { UserInfoModal } from "@/components/modals/users/UserInfoModal"
import { UserRoleModal } from "@/components/modals/users/UserRoleModal"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { get, post, patch, del, PaginatedData, PaginationMeta } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Pencil, Trash2, Plus, Shield, RefreshCw } from "lucide-react"
import { addToast } from "@heroui/toast";
import type { User, UserWithRoles } from "@/types/user"
import { getErrorMessage } from "@/lib/error-codes"

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
  // Data State
  const [items, setItems] = useState<User[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter & Pagination State
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [limit, setLimit] = useState(10)
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "created_at",
    direction: "descending",
  })
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebounce(searchInput, 400)

  // Modal State
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Selection State
  const [editing, setEditing] = useState<User | null>(null)
  const [selectedUserForRole, setSelectedUserForRole] = useState<UserWithRoles | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

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
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : (e.message ?? "Error al cargar usuarios")
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [page, search, limit, sortDescriptor])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    setSearch(debouncedSearch)
    setPage(1)
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
    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : "Error al obtener detalles del usuario"
      addToast({ title: message, color: "danger" })
    }
  }

  const onManageRole = async (user: User) => {
    try {
      const userWithRoles = await get<UserWithRoles>(`${endpoints.accessControl.users}/${user.id}/roles`)
      setSelectedUserForRole(userWithRoles)
      setIsRoleModalOpen(true)
    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : "Error al obtener roles del usuario"
      addToast({ title: message, color: "danger" })
    }
  }

  const onSaveInfo = async (payload: any) => {
    setSaving(true)
    try {
      if (editing) {
        const updatePayload = {
          first_name: payload.firstName,
          last_name: payload.lastName,
          document_number: payload.documentNumber,
          email: payload.email,
          is_active: payload.is_active,
        }
        await patch(`${endpoints.accessControl.users}/${editing.id}`, updatePayload)
      } else {
        const createPayload = {
          firstName: payload.firstName,
          lastName: payload.lastName,
          documentNumber: payload.documentNumber,
          email: payload.email,
          password: payload.password,
          system: process.env.NEXT_PUBLIC_SYSTEM,
        }
        await post(endpoints.auth.register, createPayload)
      }

      addToast({
        title: editing ? "Usuario actualizado correctamente" : "Usuario creado correctamente",
        color: "success",
      })
      setIsInfoModalOpen(false)
      setEditing(null)
      fetchUsers()
    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : "Error al guardar el usuario"
      addToast({ title: message, color: "danger" })
    } finally {
      setSaving(false)
    }
  }

  const onSaveRole = async (roleId: string) => {
    if (!selectedUserForRole) return
    setSaving(true)
    try {
      await post(`${endpoints.accessControl.users}/${selectedUserForRole.id}/roles`, {
        roleId: roleId,
      })

      // Refresh user roles data
      const userWithRoles = await get<UserWithRoles>(`${endpoints.accessControl.users}/${selectedUserForRole.id}/roles`)
      setSelectedUserForRole(userWithRoles)
      fetchUsers()
      addToast({ title: "Rol asignado correctamente", color: "success" })
    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : "Error al asignar rol"
      addToast({ title: message, color: "danger" })
    } finally {
      setSaving(false)
    }
  }

  const onUnassignRole = async (roleId: string) => {
    if (!selectedUserForRole) return
    setSaving(true)
    try {
      await del(`${endpoints.accessControl.users}/${selectedUserForRole.id}/roles/${roleId}`)

      // Refresh user roles data
      const userWithRoles = await get<UserWithRoles>(`${endpoints.accessControl.users}/${selectedUserForRole.id}/roles`)
      setSelectedUserForRole(userWithRoles)
      fetchUsers()
      addToast({ title: "Rol removido correctamente", color: "success" })
    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : "Error al remover rol"
      addToast({ title: message, color: "danger" })
    } finally {
      setSaving(false)
    }
  }

  const onDelete = (user: User) => {
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  const onConfirmDelete = async () => {
    if (!userToDelete) return
    setSaving(true)
    try {
      await del(`${endpoints.accessControl.users}/${userToDelete.id}`)
      setIsDeleteModalOpen(false)
      setUserToDelete(null)
      fetchUsers()
      addToast({ title: "Usuario eliminado correctamente", color: "success" })
    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : "Error al eliminar usuario"
      addToast({ title: message, color: "danger" })
    } finally {
      setSaving(false)
    }
  }

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

  const topActions: TopAction[] = [
    {
      key: "refresh",
      label: "Actualizar",
      icon: <RefreshCw size={16} />,
      color: "default",
      onClick: fetchUsers,
    },
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

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setUserToDelete(null)
        }}
        onConfirm={onConfirmDelete}
        title="Eliminar Usuario"
        description={`¿Estás seguro que deseas eliminar al usuario ${userToDelete?.first_name} ${userToDelete?.last_name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        confirmColor="danger"
        isLoading={saving}
      />
    </div>
  )
}