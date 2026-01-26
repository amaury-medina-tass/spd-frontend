"use client"

import { Button, Breadcrumbs, BreadcrumbItem } from "@heroui/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction, SortDescriptor } from "@/components/tables/DataTable"
import { useDebounce } from "@/hooks/useDebounce"
import { usePermissions } from "@/hooks/usePermissions"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { get, post, patch, del, PaginatedData, PaginationMeta } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Pencil, Trash2, Plus, RefreshCw, Eye, Target } from "lucide-react"
import { addToast } from "@heroui/toast"
import { getErrorMessage } from "@/lib/error-codes"
import { VariableModal } from "@/components/modals/masters/variables/VariableModal"
import { VariableDetailModal } from "@/components/modals/masters/variables/VariableDetailModal"
import { VariableGoalsModal } from "@/components/modals/masters/variables/VariableGoalsModal"
import type { Variable } from "@/types/variable"

const columns: ColumnDef<Variable>[] = [
    { key: "code", label: "Código", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    {
        key: "observations",
        label: "Observaciones",
        sortable: false,
        render: (variable) => variable.observations ?? "N/A"
    },
    {
        key: "createAt",
        label: "Creado",
        sortable: true,
        render: (variable) => new Date(variable.createAt).toLocaleString(),
    },
    {
        key: "updateAt",
        label: "Actualizado",
        sortable: true,
        render: (variable) => new Date(variable.updateAt).toLocaleString(),
    },
]

export default function MastersVariablesPage() {
    // Permissions
    const { canRead, canCreate, canUpdate, canDelete } = usePermissions("/masters/variables")

    // Data State
    const [items, setItems] = useState<Variable[]>([])
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
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false)

    // Selection State
    const [editing, setEditing] = useState<Variable | null>(null)
    const [selectedVariable, setSelectedVariable] = useState<Variable | null>(null)
    const [variableToDelete, setVariableToDelete] = useState<Variable | null>(null)

    const fetchVariables = useCallback(async () => {
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

            const result = await get<PaginatedData<Variable>>(`${endpoints.masters.variables}?${params}`)
            setItems(result.data)
            setMeta(result.meta)
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : (e.message ?? "Error al cargar variables")
            setError(message)
        } finally {
            setLoading(false)
        }
    }, [page, search, limit, sortDescriptor])

    useEffect(() => {
        fetchVariables()
    }, [fetchVariables])

    useEffect(() => {
        setSearch(debouncedSearch)
        setPage(1)
    }, [debouncedSearch])

    const onCreate = () => {
        setEditing(null)
        setIsModalOpen(true)
    }

    const onView = (variable: Variable) => {
        setSelectedVariable(variable)
        setIsDetailModalOpen(true)
    }

    const onViewGoals = (variable: Variable) => {
        setSelectedVariable(variable)
        setIsGoalsModalOpen(true)
    }

    const onEdit = async (variable: Variable) => {
        try {
            const freshVariable = await get<Variable>(`${endpoints.masters.variables}/${variable.id}`)
            setEditing(freshVariable)
            setIsModalOpen(true)
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al obtener detalles de la variable"
            addToast({ title: message, color: "danger" })
        }
    }

    const onSave = async (payload: { code: string; name: string; observations?: string }) => {
        setSaving(true)
        try {
            if (editing) {
                // Only send name and observations for update
                const updatePayload = {
                    name: payload.name,
                    observations: payload.observations,
                }
                await patch(`${endpoints.masters.variables}/${editing.id}`, updatePayload)
            } else {
                await post(endpoints.masters.variables, payload)
            }

            addToast({
                title: editing ? "Variable actualizada correctamente" : "Variable creada correctamente",
                color: "success",
            })
            setIsModalOpen(false)
            setEditing(null)
            fetchVariables()
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al guardar la variable"
            addToast({ title: message, color: "danger" })
        } finally {
            setSaving(false)
        }
    }

    const onDelete = (variable: Variable) => {
        setVariableToDelete(variable)
        setIsDeleteModalOpen(true)
    }

    const onConfirmDelete = async () => {
        if (!variableToDelete) return
        setSaving(true)
        try {
            await del(`${endpoints.masters.variables}/${variableToDelete.id}`)
            setIsDeleteModalOpen(false)
            setVariableToDelete(null)
            fetchVariables()
            addToast({ title: "Variable eliminada correctamente", color: "success" })
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al eliminar variable"
            addToast({ title: message, color: "danger" })
        } finally {
            setSaving(false)
        }
    }

    const rowActions: RowAction<Variable>[] = useMemo(() => {
        const actions: RowAction<Variable>[] = [
            {
                key: "view",
                label: "Ver",
                icon: <Eye size={16} />,
                onClick: onView,
            },
            {
                key: "goals",
                label: "Metas",
                icon: <Target size={16} />,
                onClick: onViewGoals,
            },
        ]
        if (canUpdate) {
            actions.push({
                key: "edit",
                label: "Editar",
                icon: <Pencil size={16} />,
                onClick: onEdit,
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

    const topActions: TopAction[] = useMemo(() => {
        const actions: TopAction[] = [
            {
                key: "refresh",
                label: "Actualizar",
                icon: <RefreshCw size={16} />,
                color: "default",
                onClick: fetchVariables,
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
    }, [canCreate, fetchVariables])

    const title = useMemo(() => (editing ? "Editar variable" : "Crear variable"), [editing])

    return (
        <div className="grid gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Inicio</BreadcrumbItem>
                <BreadcrumbItem>Maestros</BreadcrumbItem>
                <BreadcrumbItem>Variables</BreadcrumbItem>
            </Breadcrumbs>

            {!canRead ? (
                <div className="text-center py-16">
                    <p className="text-xl font-semibold text-danger">Acceso Denegado</p>
                    <p className="text-default-500 mt-2">No tienes permisos para ver este módulo.</p>
                </div>
            ) : error ? (
                <div className="text-center py-8 text-danger">
                    <p>{error}</p>
                    <Button variant="flat" className="mt-2" onPress={fetchVariables}>
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
                    searchPlaceholder="Buscar variables..."
                    ariaLabel="Tabla de variables"
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

            <VariableModal
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

            <VariableDetailModal
                isOpen={isDetailModalOpen}
                variable={selectedVariable}
                onClose={() => {
                    setIsDetailModalOpen(false)
                    setSelectedVariable(null)
                }}
            />

            <VariableGoalsModal
                isOpen={isGoalsModalOpen}
                variableId={selectedVariable?.id || null}
                variableName={selectedVariable?.name}
                onClose={() => {
                    setIsGoalsModalOpen(false)
                    setSelectedVariable(null)
                }}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false)
                    setVariableToDelete(null)
                }}
                onConfirm={onConfirmDelete}
                title="Eliminar Variable"
                description={`¿Estás seguro que deseas eliminar la variable "${variableToDelete?.name}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                confirmColor="danger"
                isLoading={saving}
            />
        </div>
    )
}
