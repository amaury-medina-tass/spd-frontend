"use client"

import { Chip } from "@heroui/react"
import { useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction } from "@/components/tables/DataTable"
import { usePermissions } from "@/hooks/usePermissions"
import { useDataTable } from "@/hooks/useDataTable"
import { RoleModal } from "@/components/modals/roles/RoleModal"
import { RolePermissionsModal } from "@/components/modals/roles/RolePermissionsModal"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { AccessControlPageShell } from "@/components/layout/AccessControlPageShell"
import { buildCrudTopActions } from "@/components/tables/tableActions"
import { get, post, patch, del, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Pencil, Trash2, Shield } from "lucide-react"
import { addToast } from "@heroui/toast"
import type { Role, RolePermissionsData, RoleModulePermissions } from "@/types/role"
import { getErrorMessage } from "@/lib/error-codes"

const columns: ColumnDef<Role>[] = [
  { key: "name", label: "Nombre", sortable: true },
  { key: "description", label: "Descripción", sortable: true },
  {
    key: "created_at",
    label: "Creado",
    sortable: true,
    render: (role) => new Date(role.created_at).toLocaleString(),
  },
  {
    key: "updated_at",
    label: "Actualizado",
    sortable: true,
    render: (role) => new Date(role.updated_at).toLocaleString(),
  },
  {
    key: "is_active",
    label: "Estado",
    sortable: true,
    render: (role) => (
      <Chip color={role.is_active ? "success" : "danger"} variant="flat" size="sm">
        {role.is_active ? "Activo" : "Inactivo"}
      </Chip>
    ),
  },
]

export default function AccessControlRolesPage() {
  const { canRead, canCreate, canUpdate, canDelete, canAssignPermission } = usePermissions("/access-control/roles")

  const { items, loading, error, searchInput, setSearchInput, sortDescriptor, setSortDescriptor, fetchData, paginationProps } = useDataTable<Role>({
    fetchFn: (params) => get<PaginatedData<Role>>(`${endpoints.accessControl.roles.base}?${params}`),
    defaultSort: { column: "name", direction: "ascending" },
    defaultLimit: 5,
    useErrorCodes: true,
  })

  const [saving, setSaving] = useState(false)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Selection State
  const [editing, setEditing] = useState<Role | null>(null)
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<RolePermissionsData | null>(null)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  const onCreate = () => {
    setEditing(null)
    setIsModalOpen(true)
  }

  const onEdit = async (role: Role) => {
    try {
      const freshRole = await get<Role>(`${endpoints.accessControl.roles.base}/${role.id}`)
      setEditing(freshRole)
      setIsModalOpen(true)
    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : "Error al obtener detalles del rol"
      addToast({ title: message, color: "danger" })
    }
  }

  const onManagePermissions = async (role: Role) => {
    try {
      const permissionsData = await get<RolePermissionsData>(`${endpoints.accessControl.roles.base}/${role.id}/permissions`)
      setSelectedRolePermissions(permissionsData)
      setIsPermissionsModalOpen(true)
    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : "Error al obtener permisos del rol"
      addToast({ title: message, color: "danger" })
    }
  }

  const onSave = async (payload: { name: string; description?: string; is_active: boolean }) => {
    setSaving(true)
    try {
      if (editing) {
        await patch(`${endpoints.accessControl.roles.base}/${editing.id}`, payload)
      } else {
        await post(endpoints.accessControl.roles.base, payload)
      }

      addToast({
        title: editing ? "Rol actualizado correctamente" : "Rol creado correctamente",
        color: "success",
      })
      setIsModalOpen(false)
      setEditing(null)
      fetchData()
    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : "Error al guardar el rol"
      addToast({ title: message, color: "danger" })
    } finally {
      setSaving(false)
    }
  }

  const onSavePermissions = async (permissions: { [modulePath: string]: RoleModulePermissions }) => {
    if (!selectedRolePermissions) return
    setSaving(true)
    try {
      // Collect only the permissionIds that are allowed
      const permissionIds: string[] = []
      Object.values(permissions).forEach((module) => {
        module.actions.forEach((action) => {
          if (action.allowed) {
            permissionIds.push(action.permissionId)
          }
        })
      })

      await patch(`${endpoints.accessControl.roles.base}/${selectedRolePermissions.role.id}/permissions`, {
        permissionIds,
      })

      addToast({ title: "Permisos actualizados correctamente", color: "success" })
      setIsPermissionsModalOpen(false)
      setSelectedRolePermissions(null)
    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : "Error al guardar permisos"
      addToast({ title: message, color: "danger" })
    } finally {
      setSaving(false)
    }
  }

  const onDelete = (role: Role) => {
    setRoleToDelete(role)
    setIsDeleteModalOpen(true)
  }

  const onConfirmDelete = async () => {
    if (!roleToDelete) return
    setSaving(true)
    try {
      await del(`${endpoints.accessControl.roles.base}/${roleToDelete.id}`)
      setIsDeleteModalOpen(false)
      setRoleToDelete(null)
      fetchData()
      addToast({ title: "Rol eliminado correctamente", color: "success" })
    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : "Error al eliminar rol"
      addToast({ title: message, color: "danger" })
    } finally {
      setSaving(false)
    }
  }

  const rowActions: RowAction<Role>[] = useMemo(() => {
    const actions: RowAction<Role>[] = []
    if (canUpdate) {
      actions.push({
        key: "edit",
        label: "Editar",
        icon: <Pencil size={16} />,
        onClick: (item) => void onEdit(item),
      })
    }
    if (canAssignPermission) {
      actions.push({
        key: "permissions",
        label: "Gestionar Permisos",
        icon: <Shield size={16} />,
        onClick: (item) => void onManagePermissions(item),
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
  }, [canUpdate, canDelete, canAssignPermission])

  const topActions = useMemo(() => buildCrudTopActions(fetchData, canCreate, onCreate), [canCreate, fetchData])

  const title = useMemo(() => (editing ? "Editar rol" : "Crear rol"), [editing])

  return (
    <AccessControlPageShell breadcrumbLabel="Roles" canRead={canRead} error={error} onRetry={fetchData} modals={
      <>
        <RoleModal
          isOpen={isModalOpen}
          title={title}
          initial={editing}
          isLoading={saving}
          onClose={() => {
            setIsModalOpen(false)
            setEditing(null)
          }}
          onSave={onSave}
        />

        <RolePermissionsModal
          isOpen={isPermissionsModalOpen}
          permissionsData={selectedRolePermissions}
          isLoading={saving}
          onClose={() => {
            setIsPermissionsModalOpen(false)
            setSelectedRolePermissions(null)
          }}
          onSave={onSavePermissions}
        />

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setRoleToDelete(null)
          }}
          onConfirm={onConfirmDelete}
          title="Eliminar Rol"
          description={`¿Estás seguro que deseas eliminar el rol "${roleToDelete?.name}"? Esta acción no se puede deshacer.`}
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
        searchPlaceholder="Buscar roles..."
        ariaLabel="Tabla de roles"
        pagination={paginationProps}
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
      />
    </AccessControlPageShell>
  )
}
