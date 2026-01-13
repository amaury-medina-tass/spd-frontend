"use client"

import { Button, Breadcrumbs, BreadcrumbItem, Chip, SortDescriptor } from "@heroui/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction } from "@/components/tables/DataTable"
import { useDebounce } from "@/hooks/useDebounce"
import { usePermissions } from "@/hooks/usePermissions"
import { RoleModal } from "@/components/modals/roles/RoleModal"
import { RolePermissionsModal } from "@/components/modals/roles/RolePermissionsModal"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { get, post, patch, del, PaginatedData, PaginationMeta } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Pencil, Trash2, Plus, RefreshCw, Shield } from "lucide-react"
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
  // Permissions
  const { canRead, canCreate, canUpdate, canDelete, canAssignPermission } = usePermissions("/access-control/roles")

  // Data State
  const [items, setItems] = useState<Role[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter & Pagination State
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [limit, setLimit] = useState(10)
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "name",
    direction: "ascending",
  })
  const [searchInput, setSearchInput] = useState("")
  const debouncedSearch = useDebounce(searchInput, 400)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Selection State
  const [editing, setEditing] = useState<Role | null>(null)
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<RolePermissionsData | null>(null)
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null)

  const fetchRoles = useCallback(async () => {
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

      const result = await get<PaginatedData<Role>>(`${endpoints.accessControl.roles.base}?${params}`)
      setItems(result.data)
      setMeta(result.meta)
    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : (e.message ?? "Error al cargar roles")
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [page, search, limit, sortDescriptor])

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

  useEffect(() => {
    setSearch(debouncedSearch)
    setPage(1)
  }, [debouncedSearch])

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
      fetchRoles()
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
      fetchRoles()
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
        onClick: onEdit,
      })
    }
    if (canAssignPermission) {
      actions.push({
        key: "permissions",
        label: "Gestionar Permisos",
        icon: <Shield size={16} />,
        onClick: onManagePermissions,
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

  const topActions: TopAction[] = useMemo(() => {
    const actions: TopAction[] = [
      {
        key: "refresh",
        label: "Actualizar",
        icon: <RefreshCw size={16} />,
        color: "default",
        onClick: fetchRoles,
      },
    ]
    if (canCreate) {
      actions.push({
        key: "create",
        label: "Crear",
        icon: <Plus size={16} />,
        color: "primary",
        onClick: onCreate,
      })
    }
    return actions
  }, [canCreate, fetchRoles])

  const title = useMemo(() => (editing ? "Editar rol" : "Crear rol"), [editing])

  return (
    <div className="grid gap-4">
      <Breadcrumbs>
        <BreadcrumbItem>Inicio</BreadcrumbItem>
        <BreadcrumbItem>Control de Acceso</BreadcrumbItem>
        <BreadcrumbItem>Roles</BreadcrumbItem>
      </Breadcrumbs>

      {!canRead ? (
        <div className="text-center py-16">
          <p className="text-xl font-semibold text-danger">Acceso Denegado</p>
          <p className="text-default-500 mt-2">No tienes permisos para ver este módulo.</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-danger">
          <p>{error}</p>
          <Button variant="flat" className="mt-2" onPress={fetchRoles}>
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
          searchPlaceholder="Buscar roles..."
          ariaLabel="Tabla de roles"
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
    </div>
  )
}