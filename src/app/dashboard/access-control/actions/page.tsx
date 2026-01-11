"use client"

import { Button, Breadcrumbs, BreadcrumbItem, SortDescriptor } from "@heroui/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction } from "@/components/tables/DataTable"
import { useDebounce } from "@/hooks/useDebounce"
import { ActionModal } from "@/components/modals/ActionModal"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { get, post, patch, del, PaginatedData, PaginationMeta } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Pencil, Trash2, Plus, RefreshCw } from "lucide-react"
import { addToast } from "@heroui/toast"
import type { Action } from "@/types/action"
import { getErrorMessage } from "@/lib/error-codes"

const columns: ColumnDef<Action>[] = [
    { key: "code_action", label: "Código", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    { key: "description", label: "Descripción", sortable: true },
    { key: "system", label: "Sistema", sortable: true },
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
    // Data State
    const [items, setItems] = useState<Action[]>([])
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
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

    // Selection State
    const [editing, setEditing] = useState<Action | null>(null)
    const [actionToDelete, setActionToDelete] = useState<Action | null>(null)

    const fetchActions = useCallback(async () => {
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

            const result = await get<PaginatedData<Action>>(`${endpoints.accessControl.actions}?${params}`)
            setItems(result.data)
            setMeta(result.meta)
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : (e.message ?? "Error al cargar acciones")
            setError(message)
        } finally {
            setLoading(false)
        }
    }, [page, search, limit, sortDescriptor])

    useEffect(() => {
        fetchActions()
    }, [fetchActions])

    useEffect(() => {
        setSearch(debouncedSearch)
        setPage(1)
    }, [debouncedSearch])

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
            fetchActions()
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
            fetchActions()
            addToast({ title: "Acción eliminada correctamente", color: "success" })
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al eliminar acción"
            addToast({ title: message, color: "danger" })
        } finally {
            setSaving(false)
        }
    }

    const rowActions: RowAction<Action>[] = [
        {
            key: "edit",
            label: "Editar",
            icon: <Pencil size={16} />,
            onClick: onEdit,
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
            onClick: fetchActions,
        },
        {
            key: "create",
            label: "Crear",
            icon: <Plus size={16} />,
            color: "primary",
            onClick: onCreate,
        },
    ]

    const title = useMemo(() => (editing ? "Editar acción" : "Crear acción"), [editing])

    return (
        <div className="grid gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Inicio</BreadcrumbItem>
                <BreadcrumbItem>Control de Acceso</BreadcrumbItem>
                <BreadcrumbItem>Acciones</BreadcrumbItem>
            </Breadcrumbs>

            {error ? (
                <div className="text-center py-8 text-danger">
                    <p>{error}</p>
                    <Button variant="flat" className="mt-2" onPress={fetchActions}>
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
                    searchPlaceholder="Buscar acciones..."
                    ariaLabel="Tabla de acciones"
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
        </div>
    )
}
