"use client"

import { Button } from "@heroui/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction, SortDescriptor } from "@/components/tables/DataTable"
import { useDebounce } from "@/hooks/useDebounce"
import { usePermissions } from "@/hooks/usePermissions"
import { PaginatedData, PaginationMeta } from "@/lib/http"
import { RefreshCw, Eye, Plus, Trash2 } from "lucide-react"
import { addToast } from "@heroui/toast"
import { Indicator } from "@/types/masters/indicators"
import { getIndicators } from "@/services/masters/indicators.service"
import { IndicatorDetailModal } from "@/components/modals/masters/indicators/indicative-plan/IndicatorDetailModal"
import { CreateIndicatorModal } from "@/components/modals/masters/indicators/indicative-plan/CreateIndicatorModal"
import { deleteIndicator } from "@/services/masters/indicators.service"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { EditIndicatorModal } from "@/components/modals/masters/indicators/indicative-plan/EditIndicatorModal"
import { Pencil, Target, MapPin } from "lucide-react"
import { IndicativePlanIndicatorGoalsModal } from "@/components/modals/masters/indicators/indicative-plan/IndicativePlanIndicatorGoalsModal"
import { createFormula, updateFormula } from "@/services/masters/formulas.service"

const indicatorColumns: ColumnDef<Indicator>[] = [
    { key: "code", label: "Código", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    { key: "pillarName", label: "Pilar", sortable: false, render: (i) => i.pillarName },
    { key: "programName", label: "Programa", sortable: false, render: (i) => i.programName },
    {
        key: "indicatorType",
        label: "Tipo",
        sortable: false,
        render: (i) => (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-default-100 text-default-600">
                {i.indicatorType?.name || "N/A"}
            </span>
        )
    },
    { key: "unitMeasure", label: "Unidad", sortable: false, render: (i) => i.unitMeasure?.name || "N/A" },
    { key: "baseline", label: "Línea Base", sortable: false },
    {
        key: "advancePercentage",
        label: "Avance",
        sortable: false,
        render: (i) => (
            <span className={`font-semibold ${Number(i.advancePercentage) >= 100 ? "text-success" : "text-warning"}`}>
                {i.advancePercentage}%
            </span>
        )
    },
]

import { ManageIndicatorVariablesModal } from "@/components/modals/masters/indicators/ManageIndicatorVariablesModal"
import { Calculator, FunctionSquare, UserPlus, Download } from "lucide-react"
import { FormulaEditorModal } from "@/components/modals/masters/indicators/formulas"
import { IndicatorLocationModal } from "@/components/modals/masters/indicators/IndicatorLocationModal"
import { AssignUserModal } from "@/components/modals/masters/AssignUserModal"
import { getIndicatorUsers, assignIndicatorUser, unassignIndicatorUser } from "@/services/masters/indicators.service"
import { requestExport } from "@/services/exports.service"

export function IndicativePlanIndicatorsTab() {
    const { canRead, canCreate, canUpdate, canDelete } = usePermissions("/masters/indicators")

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [indicatorToEdit, setIndicatorToEdit] = useState<Indicator | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [indicatorToDelete, setIndicatorToDelete] = useState<Indicator | null>(null)
    const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false)
    const [indicatorForGoals, setIndicatorForGoals] = useState<Indicator | null>(null)
    const [isVariablesModalOpen, setIsVariablesModalOpen] = useState(false)

    const [indicatorForVariables, setIndicatorForVariables] = useState<Indicator | null>(null)
    const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false)
    const [indicatorForFormula, setIndicatorForFormula] = useState<Indicator | null>(null)
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false)
    const [indicatorForLocation, setIndicatorForLocation] = useState<Indicator | null>(null)
    const [isUsersModalOpen, setIsUsersModalOpen] = useState(false)
    const [indicatorForUsers, setIndicatorForUsers] = useState<Indicator | null>(null)

    // Export State
    const [exporting, setExporting] = useState(false)

    // Table State
    const [items, setItems] = useState<Indicator[]>([])
    const [meta, setMeta] = useState<PaginationMeta | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [limit, setLimit] = useState(10)
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "code",
        direction: "ascending",
    })
    const [searchInput, setSearchInput] = useState("")
    const debouncedSearch = useDebounce(searchInput, 400)

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

            const result = await getIndicators(params.toString())
            setItems(result.data)
            setMeta(result.meta)
        } catch (e: any) {
            setError(e.message ?? "Error al cargar indicadores")
        } finally {
            setLoading(false)
        }
    }, [page, search, limit, sortDescriptor])

    useEffect(() => {
        fetchIndicators()
    }, [fetchIndicators])

    useEffect(() => {
        setSearch(debouncedSearch)
        setPage(1)
    }, [debouncedSearch])

    async function handleExport() {
        try {
            setExporting(true)
            await requestExport({ system: "SPD", type: "INDICATORS" })
            addToast({
                title: "Exportación solicitada",
                description: "Recibirás una notificación cuando el archivo esté listo para descargar.",
                color: "primary",
                timeout: 5000,
            })
        } catch {
            addToast({
                title: "Error",
                description: "No se pudo solicitar la exportación. Intenta de nuevo.",
                color: "danger",
                timeout: 5000,
            })
        } finally {
            setExporting(false)
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

        actions.push({
            key: "export",
            label: "Exportar Indicadores",
            icon: <Download size={16} />,
            color: "primary",
            onClick: handleExport,
            isLoading: exporting,
        })

        return actions
    }, [fetchIndicators, canCreate, exporting])

    const handleDeleteClick = (indicator: Indicator) => {
        setIndicatorToDelete(indicator)
        setIsDeleteModalOpen(true)
    }

    const handleConfirmDelete = async () => {
        if (!indicatorToDelete) return

        try {
            await deleteIndicator(indicatorToDelete.id)
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

    const rowActions: RowAction<Indicator>[] = useMemo(() => {
        const actions: RowAction<Indicator>[] = [
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
                key: "formula",
                label: "Fórmula",
                icon: <FunctionSquare size={16} />,
                onClick: (item) => {
                    setIndicatorForFormula(item)
                    setIsFormulaModalOpen(true)
                },
            })

            actions.push({
                key: "location",
                label: "Ubicación",
                icon: <MapPin size={16} />,
                onClick: (item) => {
                    setIndicatorForLocation(item)
                    setIsLocationModalOpen(true)
                },
            })

            actions.push({
                key: "users",
                label: "Usuarios",
                icon: <UserPlus size={16} />,
                onClick: (item) => {
                    setIndicatorForUsers(item)
                    setIsUsersModalOpen(true)
                },
            })
        }

        return actions
    }, [canDelete])

    if (error) {
        return (
            <div className="text-center py-8 text-danger">
                <p>{error}</p>
                <Button variant="flat" className="mt-2" onPress={fetchIndicators}>
                    Reintentar
                </Button>
            </div>
        )
    }

    if (!canRead) {
        return (
            <div className="text-center py-16">
                <p className="text-xl font-semibold text-danger">Acceso Denegado</p>
                <p className="text-default-500 mt-2">No tienes permisos para ver este módulo.</p>
            </div>
        )
    }

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
                ariaLabel="Tabla de indicadores plan indicativo"
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
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
            />

            <CreateIndicatorModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchIndicators}
            />

            <IndicatorDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                indicator={selectedIndicator}
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

            <EditIndicatorModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={fetchIndicators}
                indicator={indicatorToEdit}
            />

            <IndicativePlanIndicatorGoalsModal
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
                type="indicative"
            />

            <FormulaEditorModal
                isOpen={isFormulaModalOpen}
                onClose={() => setIsFormulaModalOpen(false)}
                type="indicative"
                onSave={async (payload: any) => {
                    try {
                        if (payload.id) {
                            await updateFormula(payload.id, {
                                expression: payload.expression,
                                ast: payload.ast,
                                indicativeIndicatorId: indicatorForFormula?.id
                            });
                        } else {
                            await createFormula({
                                expression: payload.expression,
                                ast: payload.ast,
                                indicativeIndicatorId: indicatorForFormula?.id
                            });
                        }
                        addToast({
                            title: "Fórmula Guardada",
                            description: "La fórmula se ha guardado correctamente",
                            color: "success"
                        })
                        fetchIndicators();
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

            <IndicatorLocationModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                indicatorId={indicatorForLocation?.id ?? null}
                type="indicative"
            />

            <AssignUserModal
                isOpen={isUsersModalOpen}
                onClose={() => setIsUsersModalOpen(false)}
                entityId={indicatorForUsers?.id ?? null}
                entityCode={indicatorForUsers?.code}
                entityLabel="Indicador"
                getAssignedUsers={getIndicatorUsers}
                assignUser={assignIndicatorUser}
                unassignUser={unassignIndicatorUser}
            />
        </>
    )
}
