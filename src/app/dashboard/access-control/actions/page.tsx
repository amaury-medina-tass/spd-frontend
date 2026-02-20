"use client"

import { useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction } from "@/components/tables/DataTable"
import { usePermissions } from "@/hooks/usePermissions"
import { useDataTable } from "@/hooks/useDataTable"
import { ActionModal } from "@/components/modals/actions/ActionModal"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { AccessControlPageShell } from "@/components/layout/AccessControlPageShell"
import { buildCrudTopActions } from "@/components/tables/tableActions"
import { get, post, patch, del, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Pencil, Trash2 } from "lucide-react"
import { addToast } from "@heroui/toast"
import type { Action } from "@/types/action"
import { getErrorMessage } from "@/lib/error-codes"

const columns: ColumnDef<Action>[] = [
    { key: "code_action", label: "Código", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    { key: "description", label: "Descripción", sortable: true },
    {
        key: "created_at",
        label: "Creado",
        sortable: true,
        render: (action) => new Date(action.created_at).toLocaleString(),
    },
    {
        key: "updated_at",
        label: "Actualizado",
        sortable: true,
        render: (action) => new Date(action.updated_at).toLocaleString(),
    },
]

export default function AccessControlActionsPage() {
    // Permissions
    const { canRead, canCreate, canUpdate, canDelete } = usePermissions("/access-control/actions")

    const { items, loading, error, searchInput, setSearchInput, sortDescriptor, setSortDescriptor, fetchData, paginationProps } = useDataTable<Action>({
        fetchFn: (params) => get<PaginatedData<Action>>(`${endpoints.accessControl.actions}?${params}`),
        defaultSort: { column: "name", direction: "ascending" },
        defaultLimit: 5,
        useErrorCodes: true,
    })

    const [saving, setSaving] = useState(false)

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    // Selection State
    const [editing, setEditing] = useState<Action | null>(null)
    const [actionToDelete, setActionToDelete] = useState<Action | null>(null)

    const onCreate = () => {
        setEditing(null)
        setIsModalOpen(true)
    }

    const onEdit = async (action: Action) => {
        try {
            const freshAction = await get<Action>(`${endpoints.accessControl.actions}/${action.id}`)
            setEditing(freshAction)
            setIsModalOpen(true)
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al obtener detalles de la acción"
            addToast({ title: message, color: "danger" })
        }
    }

    const onSave = async (payload: { code_action: string; name: string; description?: string }) => {
        setSaving(true)
        try {
            if (editing) {
                await patch(`${endpoints.accessControl.actions}/${editing.id}`, payload)
            } else {
                await post(endpoints.accessControl.actions, payload)
            }

            addToast({
                title: editing ? "Acción actualizada correctamente" : "Acción creada correctamente",
                color: "success",
            })
            setIsModalOpen(false)
            setEditing(null)
            fetchData()
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al guardar la acción"
            addToast({ title: message, color: "danger" })
        } finally {
            setSaving(false)
        }
    }

    const onDelete = (action: Action) => {
        setActionToDelete(action)
        setIsDeleteModalOpen(true)
    }

    const onConfirmDelete = async () => {
        if (!actionToDelete) return
        setSaving(true)
        try {
            await del(`${endpoints.accessControl.actions}/${actionToDelete.id}`)
            setIsDeleteModalOpen(false)
            setActionToDelete(null)
            fetchData()
            addToast({ title: "Acción eliminada correctamente", color: "success" })
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al eliminar acción"
            addToast({ title: message, color: "danger" })
        } finally {
            setSaving(false)
        }
    }

    const rowActions: RowAction<Action>[] = useMemo(() => {
        const actions: RowAction<Action>[] = []
        if (canUpdate) {
            actions.push({
                key: "edit",
                label: "Editar",
                icon: <Pencil size={16} />,
                onClick: (item) => void onEdit(item),
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
    }, [canUpdate, canDelete])

    const topActions = useMemo(() => buildCrudTopActions(fetchData, canCreate, onCreate), [canCreate, fetchData])

    const title = useMemo(() => (editing ? "Editar acción" : "Crear acción"), [editing])

    return (
        <AccessControlPageShell breadcrumbLabel="Acciones" canRead={canRead} error={error} onRetry={fetchData} modals={
            <>
                <ActionModal
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

                <ConfirmationModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false)
                        setActionToDelete(null)
                    }}
                    onConfirm={onConfirmDelete}
                    title="Eliminar Acción"
                    description={`¿Estás seguro que deseas eliminar la acción "${actionToDelete?.name}"? Esta acción no se puede deshacer.`}
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
                searchPlaceholder="Buscar acciones..."
                ariaLabel="Tabla de acciones"
                pagination={paginationProps}
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
            />
        </AccessControlPageShell>
    )
}
