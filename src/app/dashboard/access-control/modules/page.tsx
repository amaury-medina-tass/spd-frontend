"use client"

import { useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction } from "@/components/tables/DataTable"
import { usePermissions } from "@/hooks/usePermissions"
import { useDataTable } from "@/hooks/useDataTable"
import { ModuleModal } from "@/components/modals/modules/ModuleModal"
import { ModuleActionsModal } from "@/components/modals/modules/ModuleActionsModal"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { AccessControlPageShell } from "@/components/layout/AccessControlPageShell"
import { buildCrudTopActions } from "@/components/tables/tableActions"
import { get, post, patch, del, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Pencil, Trash2, Zap } from "lucide-react"
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

  const { items, loading, error, searchInput, setSearchInput, sortDescriptor, setSortDescriptor, fetchData, paginationProps } = useDataTable<Module>({
    fetchFn: (params) => get<PaginatedData<Module>>(`${endpoints.accessControl.modules}?${params}`),
    defaultSort: { column: "name", direction: "ascending" },
    defaultLimit: 5,
    useErrorCodes: true,
  })

  const [saving, setSaving] = useState(false)

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Selection State
  const [editing, setEditing] = useState<Module | null>(null)
  const [selectedModuleForActions, setSelectedModuleForActions] = useState<ModuleWithActions | null>(null)
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null)

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
      fetchData()
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
      fetchData()
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
        onClick: (item) => void onEdit(item),
      })
    }
    if (canAssignAction) {
      actions.push({
        key: "actions",
        label: "Gestionar Acciones",
        icon: <Zap size={16} />,
        onClick: (item) => void onManageActions(item),
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

  const topActions = useMemo(() => buildCrudTopActions(fetchData, canCreate, onCreate), [canCreate, fetchData])

  const title = useMemo(() => (editing ? "Editar módulo" : "Crear módulo"), [editing])

  return (
    <AccessControlPageShell breadcrumbLabel="Módulos" canRead={canRead} error={error} onRetry={fetchData} modals={
      <>
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
        searchPlaceholder="Buscar módulos..."
        ariaLabel="Tabla de módulos"
        pagination={paginationProps}
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
      />
    </AccessControlPageShell>
  )
}
