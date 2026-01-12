"use client"

import { Button, Breadcrumbs, BreadcrumbItem, SortDescriptor } from "@heroui/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction } from "@/components/tables/DataTable"
import { useDebounce } from "@/hooks/useDebounce"
import { usePermissions } from "@/hooks/usePermissions"
import { ModuleModal } from "@/components/modals/ModuleModal"
import { ModuleActionsModal } from "@/components/modals/ModuleActionsModal"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { get, post, patch, del, PaginatedData, PaginationMeta } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Pencil, Trash2, Plus, RefreshCw, Zap } from "lucide-react"
import { addToast } from "@heroui/toast"
import type { Module, ModuleWithActions } from "@/types/module"
import { getErrorMessage } from "@/lib/error-codes"

const columns: ColumnDef<Module>[] = [
  { key: "name", label: "Nombre", sortable: true },
  { key: "path", label: "Ruta", sortable: true },
  { key: "description", label: "Descripción", sortable: true },
  {
    key: "created_at",
    label: "Creado",
    sortable: true,
    render: (module) => new Date(module.created_at).toLocaleString(),
  },
  {
    key: "updated_at",
    label: "Actualizado",
    sortable: true,
    render: (module) => new Date(module.updated_at).toLocaleString(),
  },
]

export default function AccessControlModulesPage() {
  // Permissions
  const { canRead, canCreate, canUpdate, canDelete, canAssignAction } = usePermissions("/access-control/modules")

  // Data State
  const [items, setItems] = useState<Module[]>([])
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
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Selection State
  const [editing, setEditing] = useState<Module | null>(null)
  const [selectedModuleForActions, setSelectedModuleForActions] = useState<ModuleWithActions | null>(null)
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null)

  const fetchModules = useCallback(async () => {
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

      const result = await get<PaginatedData<Module>>(`${endpoints.accessControl.modules}?${params}`)
      setItems(result.data)
      setMeta(result.meta)
    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : (e.message ?? "Error al cargar módulos")
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [page, search, limit, sortDescriptor])

  useEffect(() => {
    fetchModules()
  }, [fetchModules])

  useEffect(() => {
    setSearch(debouncedSearch)
    setPage(1)
  }, [debouncedSearch])

  const onCreate = () => {
    setEditing(null)
    setIsModalOpen(true)
  }

  const onEdit = async (module: Module) => {
    try {
      const freshModule = await get<Module>(`${endpoints.accessControl.modules}/${module.id}`)
      setEditing(freshModule)
      setIsModalOpen(true)
    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : "Error al obtener detalles del módulo"
      addToast({ title: message, color: "danger" })
    }
  }

  const onManageActions = async (module: Module) => {
    try {
      const moduleWithActions = await get<ModuleWithActions>(`${endpoints.accessControl.modules}/${module.id}/actions`)
      setSelectedModuleForActions(moduleWithActions)
      setIsActionsModalOpen(true)
    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : "Error al obtener acciones del módulo"
      addToast({ title: message, color: "danger" })
    }
  }

  const onSave = async (payload: { name: string; description?: string; path: string }) => {
    setSaving(true)
    try {
      if (editing) {
        await patch(`${endpoints.accessControl.modules}/${editing.id}`, payload)
      } else {
        await post(endpoints.accessControl.modules, payload)
      }

      addToast({
        title: editing ? "Módulo actualizado correctamente" : "Módulo creado correctamente",
        color: "success",
      })
      setIsModalOpen(false)
      setEditing(null)
      fetchModules()
    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : "Error al guardar el módulo"
      addToast({ title: message, color: "danger" })
    } finally {
      setSaving(false)
    }
  }

  const onAssignAction = async (actionId: string) => {
    if (!selectedModuleForActions) return
    setSaving(true)
    try {
      await post(`${endpoints.accessControl.modules}/${selectedModuleForActions.id}/actions`, {
        actionId: actionId,
      })

      // Refresh module actions data
      const moduleWithActions = await get<ModuleWithActions>(`${endpoints.accessControl.modules}/${selectedModuleForActions.id}/actions`)
      setSelectedModuleForActions(moduleWithActions)
      addToast({ title: "Acción asociada correctamente", color: "success" })
    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : "Error al asociar acción"
      addToast({ title: message, color: "danger" })
    } finally {
      setSaving(false)
    }
  }

  const onUnassignAction = async (actionId: string) => {

    if (!selectedModuleForActions) return
    setSaving(true)
    try {
      await del(`${endpoints.accessControl.modules}/${selectedModuleForActions.id}/actions/${actionId}`)

      // Refresh module actions data
      const moduleWithActions = await get<ModuleWithActions>(`${endpoints.accessControl.modules}/${selectedModuleForActions.id}/actions`)
      setSelectedModuleForActions(moduleWithActions)
      addToast({ title: "Acción desasociada correctamente", color: "success" })
    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : "Error al desasociar acción"
      addToast({ title: message, color: "danger" })
    } finally {
      setSaving(false)
    }
  }

  const onDelete = (module: Module) => {
    setModuleToDelete(module)
    setIsDeleteModalOpen(true)
  }

  const onConfirmDelete = async () => {
    if (!moduleToDelete) return
    setSaving(true)
    try {
      await del(`${endpoints.accessControl.modules}/${moduleToDelete.id}`)
      setIsDeleteModalOpen(false)
      setModuleToDelete(null)
      fetchModules()
      addToast({ title: "Módulo eliminado correctamente", color: "success" })
    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : "Error al eliminar módulo"
      addToast({ title: message, color: "danger" })
    } finally {
      setSaving(false)
    }
  }

  const rowActions: RowAction<Module>[] = useMemo(() => {
    const actions: RowAction<Module>[] = []
    if (canUpdate) {
      actions.push({
        key: "edit",
        label: "Editar",
        icon: <Pencil size={16} />,
        onClick: onEdit,
      })
    }
    if (canAssignAction) {
      actions.push({
        key: "actions",
        label: "Gestionar Acciones",
        icon: <Zap size={16} />,
        onClick: onManageActions,
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
  }, [canUpdate, canDelete, canAssignAction])

  const topActions: TopAction[] = useMemo(() => {
    const actions: TopAction[] = [
      {
        key: "refresh",
        label: "Actualizar",
        icon: <RefreshCw size={16} />,
        color: "default",
        onClick: fetchModules,
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
  }, [canCreate, fetchModules])

  const title = useMemo(() => (editing ? "Editar módulo" : "Crear módulo"), [editing])

  return (
    <div className="grid gap-4">
      <Breadcrumbs>
        <BreadcrumbItem>Inicio</BreadcrumbItem>
        <BreadcrumbItem>Control de Acceso</BreadcrumbItem>
        <BreadcrumbItem>Módulos</BreadcrumbItem>
      </Breadcrumbs>

      {!canRead ? (
        <div className="text-center py-16">
          <p className="text-xl font-semibold text-danger">Acceso Denegado</p>
          <p className="text-default-500 mt-2">No tienes permisos para ver este módulo.</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-danger">
          <p>{error}</p>
          <Button variant="flat" className="mt-2" onPress={fetchModules}>
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
          searchPlaceholder="Buscar módulos..."
          ariaLabel="Tabla de módulos"
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

      <ModuleModal
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

      <ModuleActionsModal
        isOpen={isActionsModalOpen}
        module={selectedModuleForActions}
        isLoading={saving}
        onClose={() => {
          setIsActionsModalOpen(false)
          setSelectedModuleForActions(null)
        }}
        onAssign={onAssignAction}
        onUnassign={onUnassignAction}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setModuleToDelete(null)
        }}
        onConfirm={onConfirmDelete}
        title="Eliminar Módulo"
        description={`¿Estás seguro que deseas eliminar el módulo "${moduleToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        confirmColor="danger"
        isLoading={saving}
      />
    </div>
  )
}