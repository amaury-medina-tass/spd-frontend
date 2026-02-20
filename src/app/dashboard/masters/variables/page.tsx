"use client"

import { Breadcrumbs, BreadcrumbItem } from "@heroui/react"
import { useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction } from "@/components/tables/DataTable"
import { usePermissions } from "@/hooks/usePermissions"
import { useDataTable } from "@/hooks/useDataTable"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { get, post, patch, del, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Pencil, Trash2, Plus, Eye, Target, MapPin, UserPlus } from "lucide-react"
import { buildBaseTopActions } from "@/components/tables/tableActions"
import { addToast } from "@heroui/toast"
import { getErrorMessage } from "@/lib/error-codes"
import { VariableModal } from "@/components/modals/masters/variables/VariableModal"
import { VariableDetailModal } from "@/components/modals/masters/variables/VariableDetailModal"
import { VariableGoalsModal } from "@/components/modals/masters/variables/VariableGoalsModal"
import { VariableLocationModal } from "@/components/modals/masters/variables/VariableLocationModal"
import { AssignUserModal } from "@/components/modals/masters/AssignUserModal"
import { getVariableUsers, assignVariableUser, unassignVariableUser } from "@/services/masters/variables.service"
import type { Variable } from "@/types/variable"
import { TableErrorView, AccessDeniedView } from "@/components/tables/TableStatusViews"

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

    // CRUD State
    const [saving, setSaving] = useState(false)

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false)
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
    const [isUsersModalOpen, setIsUsersModalOpen] = useState(false)
    const [variableForUsers, setVariableForUsers] = useState<Variable | null>(null)

    // Selection State
    const [editing, setEditing] = useState<Variable | null>(null)
    const [selectedVariable, setSelectedVariable] = useState<Variable | null>(null)
    const [variableToDelete, setVariableToDelete] = useState<Variable | null>(null)

    const {
        items, loading, error, searchInput, setSearchInput,
        sortDescriptor, setSortDescriptor, fetchData, exporting, handleExport, paginationProps,
    } = useDataTable<Variable>({
        fetchFn: (qs) => get<PaginatedData<Variable>>(`${endpoints.masters.variables}?${qs}`),
        defaultSort: { column: "name", direction: "ascending" },
        errorMessage: "Error al cargar variables",
        exportConfig: { system: "SPD", type: "VARIABLES" },
        useErrorCodes: true,
    })

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

    const onViewLocations = (variable: Variable) => {
        setSelectedVariable(variable)
        setIsLocationModalOpen(true)
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
            fetchData()
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
            fetchData()
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
            {
                key: "location",
                label: "Ubicación",
                icon: <MapPin size={16} />,
                onClick: onViewLocations,
            },
        ]
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
        if (canUpdate) {
            actions.push({
                key: "users",
                label: "Usuarios",
                icon: <UserPlus size={16} />,
                onClick: (variable) => {
                    setVariableForUsers(variable)
                    setIsUsersModalOpen(true)
                },
            })
        }
        return actions
    }, [canUpdate, canDelete])

    const topActions: TopAction[] = useMemo(() => {
        const actions = buildBaseTopActions(fetchData, handleExport, exporting, "Exportar Variables")
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
    }, [canCreate, fetchData, exporting, handleExport])

    const title = useMemo(() => (editing ? "Editar variable" : "Crear variable"), [editing])

    return (
        <div className="grid gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Inicio</BreadcrumbItem>
                <BreadcrumbItem>Maestros</BreadcrumbItem>
                <BreadcrumbItem>Variables</BreadcrumbItem>
            </Breadcrumbs>

            {canRead && error && (
                <TableErrorView error={error} onRetry={fetchData} />
            )}
            {canRead && !error && (
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
                    pagination={paginationProps}
                    sortDescriptor={sortDescriptor}
                    onSortChange={setSortDescriptor}
                />
            )}
            {!canRead && (
                <AccessDeniedView />
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
                variableCode={selectedVariable?.code}
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

            <VariableLocationModal
                isOpen={isLocationModalOpen}
                onClose={() => {
                    setIsLocationModalOpen(false)
                    setSelectedVariable(null)
                }}
                variableId={selectedVariable?.id || null}
                variableCode={selectedVariable?.code}
            />

            <AssignUserModal
                isOpen={isUsersModalOpen}
                onClose={() => {
                    setIsUsersModalOpen(false)
                    setVariableForUsers(null)
                }}
                entityId={variableForUsers?.id ?? null}
                entityCode={variableForUsers?.code}
                entityLabel="Variable"
                getAssignedUsers={getVariableUsers}
                assignUser={assignVariableUser}
                unassignUser={unassignVariableUser}
            />
        </div>
    )
}
