"use client"

import { Chip } from "@heroui/react"
import { useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction } from "@/components/tables/DataTable"
import { usePermissions } from "@/hooks/usePermissions"
import { useDataTable } from "@/hooks/useDataTable"
import { UserInfoModal } from "@/components/modals/users/UserInfoModal"
import { UserRoleModal } from "@/components/modals/users/UserRoleModal"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { AccessControlPageShell } from "@/components/layout/AccessControlPageShell"
import { buildCrudTopActions } from "@/components/tables/tableActions"
import { get, post, patch, del, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Pencil, Trash2, Shield } from "lucide-react"
import { addToast } from "@heroui/toast";
import type { User, UserWithRoles } from "@/types/user"
import { getErrorMessage } from "@/lib/error-codes"

const columns: ColumnDef<User>[] = [
  { key: "first_name", label: "Nombre", sortable: true },
  { key: "last_name", label: "Apellido", sortable: true },
  { key: "email", label: "Email", sortable: true },
  {
    key: "roles",
    label: "Roles",
    sortable: false,
    render: (user) => user.roles?.map((r) => r.name).join(", ") ?? "N/A",
  },
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
  const { canRead, canCreate, canUpdate, canDelete, canAssignRole } = usePermissions("/access-control/users")

  const { items, loading, error, searchInput, setSearchInput, sortDescriptor, setSortDescriptor, fetchData, paginationProps } = useDataTable<User>({
    fetchFn: (params) => get<PaginatedData<User>>(`${endpoints.accessControl.users}?${params}`),
    defaultSort: { column: "created_at", direction: "descending" },
    defaultLimit: 5,
    useErrorCodes: true,
  })

  const [saving, setSaving] = useState(false)

  // Modal State
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Selection State
  const [editing, setEditing] = useState<User | null>(null)
  const [selectedUserForRole, setSelectedUserForRole] = useState<UserWithRoles | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

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
      fetchData()
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
      fetchData()
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
      fetchData()
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
      fetchData()
      addToast({ title: "Usuario eliminado correctamente", color: "success" })
    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : "Error al eliminar usuario"
      addToast({ title: message, color: "danger" })
    } finally {
      setSaving(false)
    }
  }

  const rowActions: RowAction<User>[] = useMemo(() => {
    const actions: RowAction<User>[] = []
    if (canUpdate) {
      actions.push({
        key: "edit",
        label: "Editar",
        icon: <Pencil size={16} />,
        onClick: (item) => void onEdit(item),
      })
    }
    if (canAssignRole) {
      actions.push({
        key: "role",
        label: "Gestionar Rol",
        icon: <Shield size={16} />,
        onClick: (item) => void onManageRole(item),
      })
    }
    if (canDelete) {
      actions.push({
        key: "delete",
        label: "Eliminar",
        icon: <Trash2 size={16} />,
        color: "danger",
        onClick: onDelete,
      })
    }
    return actions
  }, [canUpdate, canDelete, canAssignRole])

  const topActions = useMemo(() => buildCrudTopActions(fetchData, canCreate, onCreate), [canCreate, fetchData])

  const title = useMemo(() => (editing ? "Editar usuario" : "Crear usuario"), [editing])

  return (
    <AccessControlPageShell breadcrumbLabel="Usuarios" canRead={canRead} error={error} onRetry={fetchData} modals={
      <>
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
      </>
    }>
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
        pagination={paginationProps}
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
      />
    </AccessControlPageShell>
  )
}
