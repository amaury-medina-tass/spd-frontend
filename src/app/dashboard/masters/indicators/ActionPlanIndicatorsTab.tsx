"use client"

import { DataTable, ColumnDef, SortDescriptor, TopAction, RowAction } from "@/components/tables/DataTable"
import { ActionPlanIndicator } from "@/types/masters/indicators"
import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertTriangle, Plus, RefreshCw, Pencil, Trash2, Eye, Target } from "lucide-react"
import { usePermissions } from "@/hooks/usePermissions"
import { useDebounce } from "@/hooks/useDebounce"
import { getActionPlanIndicators, deleteActionPlanIndicator } from "@/services/masters/indicators.service"
import { PaginatedData, PaginationMeta } from "@/lib/http"
import { addToast } from "@heroui/toast"
import { CreateActionPlanIndicatorModal } from "@/components/modals/masters/indicators/action-plan/CreateActionPlanIndicatorModal"
import { EditActionPlanIndicatorModal } from "@/components/modals/masters/indicators/action-plan/EditActionPlanIndicatorModal"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { ActionPlanIndicatorDetailModal } from "@/components/modals/masters/indicators/action-plan/ActionPlanIndicatorDetailModal"
import { ActionPlanIndicatorGoalsModal } from "@/components/modals/masters/indicators/action-plan/ActionPlanIndicatorGoalsModal"
import { createFormula, updateFormula } from "@/services/masters/formulas.service"

const indicatorColumns: ColumnDef<ActionPlanIndicator>[] = [
    { key: "code", label: "Código", sortable: true },
    { key: "statisticalCode", label: "Cód. Est.", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    { key: "unitMeasure", label: "Unidad", sortable: false, render: (i) => i.unitMeasure?.name || "N/A" },
    { key: "plannedQuantity", label: "Meta", sortable: false },
    { key: "executionCut", label: "Corte Ej.", sortable: false },
    {
        key: "compliancePercentage",
        label: "Cumplimiento",
        sortable: false,
        render: (i) => (
            <span className={`font-semibold ${Number(i.compliancePercentage) >= 100 ? "text-success" : "text-warning"}`}>
                {i.compliancePercentage}%
            </span>
        )
    },
]

import { ManageIndicatorVariablesModal } from "@/components/modals/masters/indicators/ManageIndicatorVariablesModal"
import { ManageActionPlanProjectsModal } from "@/components/modals/masters/indicators/action-plan/ManageActionPlanProjectsModal"
import { Calculator, Briefcase, FunctionSquare } from "lucide-react"
import { FormulaEditorModal } from "@/components/modals/common/FormulaEditorModal"

export function ActionPlanIndicatorsTab() {
    const { canRead, canCreate, canUpdate, canDelete } = usePermissions("/masters/indicators") // Adjust permission path if needed

    // State
    const [items, setItems] = useState<ActionPlanIndicator[]>([])
    const [meta, setMeta] = useState<PaginationMeta | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Pagination & Search
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [search, setSearch] = useState("")
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "code",
        direction: "ascending",
    })
    const [searchInput, setSearchInput] = useState("")
    const debouncedSearch = useDebounce(searchInput, 400)

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [indicatorToEdit, setIndicatorToEdit] = useState<ActionPlanIndicator | null>(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedIndicator, setSelectedIndicator] = useState<ActionPlanIndicator | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [indicatorToDelete, setIndicatorToDelete] = useState<ActionPlanIndicator | null>(null)
    const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false)
    const [indicatorForGoals, setIndicatorForGoals] = useState<ActionPlanIndicator | null>(null)
    const [isVariablesModalOpen, setIsVariablesModalOpen] = useState(false)
    const [indicatorForVariables, setIndicatorForVariables] = useState<ActionPlanIndicator | null>(null)
    const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false)
    const [indicatorForProjects, setIndicatorForProjects] = useState<ActionPlanIndicator | null>(null)
    const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false)
    const [indicatorForFormula, setIndicatorForFormula] = useState<ActionPlanIndicator | null>(null)

    const fetchIndicators = useCallback(async () => {
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

            const result = await getActionPlanIndicators(params.toString())
            setItems(result.data)
            setMeta(result.meta)
        } catch (e: any) {
            setError(e.message ?? "Error al cargar indicadores")
        } finally {
            setLoading(false)
        }
    }, [page, limit, search, sortDescriptor])

    useEffect(() => {
        fetchIndicators()
    }, [fetchIndicators])

    useEffect(() => {
        setSearch(debouncedSearch)
        setPage(1)
    }, [debouncedSearch])

    const handleDeleteClick = (indicator: ActionPlanIndicator) => {
        setIndicatorToDelete(indicator)
        setIsDeleteModalOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!indicatorToDelete) return

        try {
            await deleteActionPlanIndicator(indicatorToDelete.id)
            addToast({
                title: "Éxito",
                description: "Indicador eliminado correctamente",
                color: "success",
            })
            fetchIndicators()
            setIsDeleteModalOpen(false)
            setIndicatorToDelete(null)
        } catch (error: any) {
            addToast({
                title: "Error",
                description: error.message || "Error al eliminar indicador",
                color: "danger",
            })
        }
    }

    const topActions: TopAction[] = useMemo(() => {
        const actions: TopAction[] = [
            {
                key: "refresh",
                label: "Actualizar",
                icon: <RefreshCw size={16} />,
                color: "default",
                onClick: fetchIndicators,
            },
        ]

        if (canCreate) {
            actions.push({
                key: "create",
                label: "Crear",
                icon: <Plus size={16} />,
                color: "primary",
                onClick: () => setIsCreateModalOpen(true),
            })
        }

        return actions
    }, [fetchIndicators, canCreate])

    const rowActions: RowAction<ActionPlanIndicator>[] = useMemo(() => {
        const actions: RowAction<ActionPlanIndicator>[] = [
            {
                key: "view",
                label: "Ver Detalle",
                icon: <Eye size={16} />,
                onClick: (item) => {
                    setSelectedIndicator(item)
                    setIsDetailModalOpen(true)
                },
            },
        ]

        if (canUpdate) {
            actions.push({
                key: "edit",
                label: "Editar",
                icon: <Pencil size={16} />,
                onClick: (item) => {
                    setIndicatorToEdit(item)
                    setIsEditModalOpen(true)
                },
            })
        }

        if (canDelete) {
            actions.push({
                key: "delete",
                label: "Eliminar",
                icon: <Trash2 size={16} />,
                color: "danger",
                onClick: (item) => handleDeleteClick(item),
            })
        }

        actions.push({
            key: "goals",
            label: "Ver Metas",
            icon: <Target size={16} />,
            onClick: (item) => {
                setIndicatorForGoals(item)
                setIsGoalsModalOpen(true)
            },
        })

        if (canUpdate) {
            actions.push({
                key: "variables",
                label: "Variables",
                icon: <Calculator size={16} />,
                onClick: (item) => {
                    setIndicatorForVariables(item)
                    setIsVariablesModalOpen(true)
                },
            })

            actions.push({
                key: "projects",
                label: "Proyectos",
                icon: <Briefcase size={16} />,
                onClick: (item) => {
                    setIndicatorForProjects(item)
                    setIsProjectsModalOpen(true)
                },
            })

            actions.push({
                key: "formula",
                label: "Fórmula",
                icon: <FunctionSquare size={16} />,
                onClick: (item) => {
                    setIndicatorForFormula(item)
                    setIsFormulaModalOpen(true)
                },
            })
        }

        return actions
    }, [canUpdate, canDelete])

    return (
        <>
            <DataTable
                items={items}
                columns={indicatorColumns}
                isLoading={loading}
                rowActions={rowActions}
                topActions={topActions}
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                searchPlaceholder="Buscar indicadores..."
                ariaLabel="Tabla de indicadores plan de acción"
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
                pagination={meta ? {
                    page: page,
                    totalPages: meta.totalPages,
                    onChange: setPage,
                    pageSize: limit,
                    onPageSizeChange: (newLimit) => {
                        setLimit(newLimit)
                        setPage(1)
                    }
                } : undefined}
            />

            <CreateActionPlanIndicatorModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchIndicators}
            />

            <EditActionPlanIndicatorModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={fetchIndicators}
                indicator={indicatorToEdit}
            />

            <ActionPlanIndicatorDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                indicator={selectedIndicator}
            />

            <ActionPlanIndicatorGoalsModal
                isOpen={isGoalsModalOpen}
                onClose={() => setIsGoalsModalOpen(false)}
                indicatorId={indicatorForGoals?.id ?? null}
                indicatorCode={indicatorForGoals?.code}
            />

            <ManageIndicatorVariablesModal
                isOpen={isVariablesModalOpen}
                onClose={() => setIsVariablesModalOpen(false)}
                indicatorId={indicatorForVariables?.id ?? null}
                indicatorCode={indicatorForVariables?.code}
                type="action-plan"
            />

            <ManageActionPlanProjectsModal
                isOpen={isProjectsModalOpen}
                onClose={() => setIsProjectsModalOpen(false)}
                indicatorId={indicatorForProjects?.id ?? null}
                indicatorCode={indicatorForProjects?.code}
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
                onSave={async (payload: any) => {
                    console.log("PAYLOAD TO BACKEND:", payload)
                    try {
                        if (payload.id) {
                            await updateFormula(payload.id, {
                                expression: payload.expression,
                                ast: payload.ast,
                                actionIndicatorId: indicatorForFormula?.id
                            });
                        } else {
                            await createFormula({
                                expression: payload.expression,
                                ast: payload.ast,
                                actionIndicatorId: indicatorForFormula?.id
                            });
                        }
                        addToast({
                            title: "Fórmula Guardada",
                            description: "La fórmula se ha guardado correctamente",
                            color: "success"
                        })
                        fetchIndicators(); // Refresh to update status if needed
                        setIsFormulaModalOpen(false);
                    } catch (error: any) {
                        addToast({
                            title: "Error al guardar fórmula",
                            description: error.message || "Ocurrió un error inesperado",
                            color: "danger"
                        })
                    }
                }}
                title={`Editor de Fórmula - ${indicatorForFormula?.code || ''}`}
                indicatorId={indicatorForFormula?.id || ''}
            />
        </>
    )
}
