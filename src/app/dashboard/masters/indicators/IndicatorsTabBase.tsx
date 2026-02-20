"use client"

import { useCallback, useMemo, useState } from "react"
import { DataTable, ColumnDef, TopAction, RowAction } from "@/components/tables/DataTable"
import { usePermissions } from "@/hooks/usePermissions"
import { useDataTable } from "@/hooks/useDataTable"
import { PaginatedData } from "@/lib/http"
import { addToast } from "@heroui/toast"
import { TableErrorView, AccessDeniedView } from "@/components/tables/TableStatusViews"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { ManageIndicatorVariablesModal } from "@/components/modals/masters/indicators/ManageIndicatorVariablesModal"
import { IndicatorLocationModal } from "@/components/modals/masters/indicators/IndicatorLocationModal"
import { FormulaEditorModal } from "@/components/modals/masters/indicators/formulas"
import { AssignUserModal } from "@/components/modals/masters/AssignUserModal"
import { createFormula, updateFormula } from "@/services/masters/formulas.service"
import {
    Plus, Pencil, Trash2, Eye, Target, MapPin,
    Calculator, Briefcase, FunctionSquare, UserPlus,
} from "lucide-react"
import { buildBaseTopActions } from "@/components/tables/tableActions"

interface BaseIndicator {
    id: string
    name: string
    code: string
}

interface IndicatorsTabBaseProps<T extends BaseIndicator> {
    columns: ColumnDef<T>[]
    fetchFn: (query: string) => Promise<PaginatedData<T>>
    deleteFn: (id: string) => Promise<unknown>
    ariaLabel: string
    formulaIdKey: string
    locationType: "action" | "indicative"
    variablesType: "action-plan" | "indicative"
    formulaType?: string
    usersFns: {
        getUsers: (entityId: string, query: string) => Promise<PaginatedData<any>>
        assignUser: (entityId: string, userId: string) => Promise<unknown>
        unassignUser: (entityId: string, userId: string) => Promise<unknown>
    }
    showProjects?: boolean
    showErrorView?: boolean
    renderCreateModal: (props: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) => React.ReactNode
    renderEditModal: (props: { isOpen: boolean; onClose: () => void; onSuccess: () => void; indicator: T | null }) => React.ReactNode
    renderDetailModal: (props: { isOpen: boolean; onClose: () => void; indicator: T | null }) => React.ReactNode
    renderGoalsModal: (props: { isOpen: boolean; onClose: () => void; indicatorId: string | null; indicatorCode?: string }) => React.ReactNode
    renderProjectsModal?: (props: { isOpen: boolean; onClose: () => void; indicatorId: string | null; indicatorCode?: string }) => React.ReactNode
}

export function IndicatorsTabBase<T extends BaseIndicator>({
    columns,
    fetchFn,
    deleteFn,
    ariaLabel,
    formulaIdKey,
    locationType,
    variablesType,
    formulaType,
    usersFns,
    showProjects = false,
    showErrorView = false,
    renderCreateModal,
    renderEditModal,
    renderDetailModal,
    renderGoalsModal,
    renderProjectsModal,
}: Readonly<IndicatorsTabBaseProps<T>>) {
    const { canRead, canCreate, canUpdate, canDelete } = usePermissions("/masters/indicators")

    const {
        items, loading, error, searchInput, setSearchInput,
        sortDescriptor, setSortDescriptor, fetchData,
        exporting, handleExport, paginationProps,
    } = useDataTable<T>({
        fetchFn,
        defaultSort: { column: "code", direction: "ascending" },
        exportConfig: { system: "SPD", type: "INDICATORS" },
    })

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [indicatorToEdit, setIndicatorToEdit] = useState<T | null>(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedIndicator, setSelectedIndicator] = useState<T | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [indicatorToDelete, setIndicatorToDelete] = useState<T | null>(null)
    const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false)
    const [indicatorForGoals, setIndicatorForGoals] = useState<T | null>(null)
    const [isVariablesModalOpen, setIsVariablesModalOpen] = useState(false)
    const [indicatorForVariables, setIndicatorForVariables] = useState<T | null>(null)
    const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false)
    const [indicatorForProjects, setIndicatorForProjects] = useState<T | null>(null)
    const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false)
    const [indicatorForFormula, setIndicatorForFormula] = useState<T | null>(null)
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
    const [indicatorForLocation, setIndicatorForLocation] = useState<T | null>(null)
    const [isUsersModalOpen, setIsUsersModalOpen] = useState(false)
    const [indicatorForUsers, setIndicatorForUsers] = useState<T | null>(null)

    const handleDeleteClick = (indicator: T) => {
        setIndicatorToDelete(indicator)
        setIsDeleteModalOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!indicatorToDelete) return
        try {
            await deleteFn(indicatorToDelete.id)
            addToast({ title: "Éxito", description: "Indicador eliminado correctamente", color: "success" })
            fetchData()
            setIsDeleteModalOpen(false)
            setIndicatorToDelete(null)
        } catch (error: any) {
            addToast({ title: "Error", description: error.message || "Error al eliminar indicador", color: "danger" })
        }
    }

    const topActions: TopAction[] = useMemo(() => {
        const actions = buildBaseTopActions(fetchData, handleExport, exporting, "Exportar Indicadores")
        if (canCreate) {
            actions.splice(1, 0, { key: "create", label: "Crear", icon: <Plus size={16} />, color: "primary", onClick: () => setIsCreateModalOpen(true) })
        }
        return actions
    }, [fetchData, canCreate, exporting, handleExport])

    const rowActions: RowAction<T>[] = useMemo(() => {
        const actions: RowAction<T>[] = [
            { key: "view", label: "Ver Detalle", icon: <Eye size={16} />, onClick: (item) => { setSelectedIndicator(item); setIsDetailModalOpen(true) } },
        ]
        if (canUpdate) {
            actions.push({ key: "edit", label: "Editar", icon: <Pencil size={16} />, onClick: (item) => { setIndicatorToEdit(item); setIsEditModalOpen(true) } })
        }
        if (canDelete) {
            actions.push({ key: "delete", label: "Eliminar", icon: <Trash2 size={16} />, color: "danger", onClick: (item) => handleDeleteClick(item) })
        }
        actions.push({ key: "goals", label: "Ver Metas", icon: <Target size={16} />, onClick: (item) => { setIndicatorForGoals(item); setIsGoalsModalOpen(true) } })
        if (canUpdate) {
            actions.push({ key: "variables", label: "Variables", icon: <Calculator size={16} />, onClick: (item) => { setIndicatorForVariables(item); setIsVariablesModalOpen(true) } })
            if (showProjects) {
                actions.push({ key: "projects", label: "Proyectos", icon: <Briefcase size={16} />, onClick: (item) => { setIndicatorForProjects(item); setIsProjectsModalOpen(true) } })
            }
            actions.push(
                { key: "formula", label: "Fórmula", icon: <FunctionSquare size={16} />, onClick: (item) => { setIndicatorForFormula(item); setIsFormulaModalOpen(true) } },
                { key: "location", label: "Ubicación", icon: <MapPin size={16} />, onClick: (item) => { setIndicatorForLocation(item); setIsLocationModalOpen(true) } },
                { key: "users", label: "Usuarios", icon: <UserPlus size={16} />, onClick: (item) => { setIndicatorForUsers(item); setIsUsersModalOpen(true) } },
            )
        }
        return actions
    }, [canUpdate, canDelete, showProjects])

    const handleFormulaSave = useCallback(async (payload: any) => {
        console.log("PAYLOAD TO BACKEND:", payload)
        try {
            const formulaData = {
                expression: payload.expression,
                ast: payload.ast,
                [formulaIdKey]: indicatorForFormula?.id,
            }
            if (payload.id) {
                await updateFormula(payload.id, formulaData)
            } else {
                await createFormula(formulaData)
            }
            addToast({ title: "Fórmula Guardada", description: "La fórmula se ha guardado correctamente", color: "success" })
            fetchData()
            setIsFormulaModalOpen(false)
        } catch (error: any) {
            addToast({ title: "Error al guardar fórmula", description: error.message || "Ocurrió un error inesperado", color: "danger" })
        }
    }, [formulaIdKey, indicatorForFormula, fetchData])

    if (showErrorView && error) return <TableErrorView error={error} onRetry={fetchData} />
    if (showErrorView && !canRead) return <AccessDeniedView />

    return (
        <>
            <DataTable
                items={items}
                columns={columns}
                isLoading={loading}
                rowActions={rowActions}
                topActions={topActions}
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                searchPlaceholder="Buscar indicadores..."
                ariaLabel={ariaLabel}
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
                pagination={paginationProps}
            />

            {renderCreateModal({ isOpen: isCreateModalOpen, onClose: () => setIsCreateModalOpen(false), onSuccess: () => void fetchData() })}
            {renderEditModal({ isOpen: isEditModalOpen, onClose: () => setIsEditModalOpen(false), onSuccess: () => void fetchData(), indicator: indicatorToEdit })}
            {renderDetailModal({ isOpen: isDetailModalOpen, onClose: () => setIsDetailModalOpen(false), indicator: selectedIndicator })}
            {renderGoalsModal({ isOpen: isGoalsModalOpen, onClose: () => setIsGoalsModalOpen(false), indicatorId: indicatorForGoals?.id ?? null, indicatorCode: indicatorForGoals?.code })}

            {showProjects && renderProjectsModal?.({
                isOpen: isProjectsModalOpen,
                onClose: () => setIsProjectsModalOpen(false),
                indicatorId: indicatorForProjects?.id ?? null,
                indicatorCode: indicatorForProjects?.code,
            })}

            <ManageIndicatorVariablesModal
                isOpen={isVariablesModalOpen}
                onClose={() => setIsVariablesModalOpen(false)}
                indicatorId={indicatorForVariables?.id ?? null}
                indicatorCode={indicatorForVariables?.code}
                type={variablesType}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Eliminar Indicador"
                description={`¿Estás seguro de que deseas eliminar el indicador "${indicatorToDelete?.name}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                confirmColor="danger"
            />

            <FormulaEditorModal
                isOpen={isFormulaModalOpen}
                onClose={() => setIsFormulaModalOpen(false)}
                onSave={handleFormulaSave}
                title={`Editor de Fórmula - ${indicatorForFormula?.code || ''}`}
                indicatorId={indicatorForFormula?.id || ''}
                {...(formulaType ? { type: formulaType } : {})}
            />

            <IndicatorLocationModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                indicatorId={indicatorForLocation?.id ?? null}
                type={locationType}
            />

            <AssignUserModal
                isOpen={isUsersModalOpen}
                onClose={() => setIsUsersModalOpen(false)}
                entityId={indicatorForUsers?.id ?? null}
                entityCode={indicatorForUsers?.code}
                entityLabel="Indicador"
                getAssignedUsers={usersFns.getUsers}
                assignUser={usersFns.assignUser}
                unassignUser={usersFns.unassignUser}
            />
        </>
    )
}
