"use client"

import { useCallback, useEffect, useState } from "react"
import {
    Button,
    Input,
} from "@heroui/react"
import { get, post, patch, del, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { BarChart, Plus, Pencil, X } from "lucide-react"
import { ResourceManager } from "@/components/common/ResourceManager"
import { useDebounce } from "@/hooks/useDebounce"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { addToast } from "@heroui/toast"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import {
    annualGoalColumns,
    quadrenniumGoalColumns,
    quadrenniumGoalSchema,
    goalValueField,
    QUADRENNIUM_DEFAULTS,
    GoalValueCell,
    GoalDateCell,
    GoalActionsCell,
} from "@/config/goal-config"

// --- Annual Goals config ---

const annualSchema = z.object({
    year: z.coerce.number().max(new Date().getFullYear(), "El año no puede ser mayor al actual"),
    value: goalValueField,
})

const annualDefaults = { year: new Date().getFullYear(), value: 0 }

// --- Mode config ---

const MODE_CONFIG = {
    annual: {
        columns: annualGoalColumns,
        schema: annualSchema,
        defaults: annualDefaults,
        endpoint: endpoints.masters.variableGoals,
        paramKey: "variableId",
        sortParams: { sortBy: "year", sortOrder: "DESC" },
        hasSearch: true,
        labels: {
            createSuccess: "Meta creada correctamente",
            updateSuccess: "Meta actualizada correctamente",
            createError: "Error al crear la meta",
            updateError: "Error al actualizar la meta",
            deleteSuccess: "Meta eliminada correctamente",
            deleteTitle: "Eliminar Meta Anual",
            emptyText: "No hay metas registradas para esta variable",
            emptySearchText: "No se encontraron metas para la búsqueda",
        },
        getDeleteDescription: (goal: any) => `¿Estás seguro que deseas eliminar la meta del año ${goal?.year}?`,
        getEditValues: (goal: any) => ({ year: goal.year, value: Number(goal.value) }),
        getCreatePayload: (data: any, variableId: string) => ({ variableId, year: data.year, value: data.value }),
        getUpdatePayload: (data: any) => ({ value: data.value }),
    },
    quadrennium: {
        columns: quadrenniumGoalColumns,
        schema: quadrenniumGoalSchema,
        defaults: QUADRENNIUM_DEFAULTS,
        endpoint: endpoints.masters.variableQuadrenniums,
        paramKey: "variableId",
        sortParams: {},
        hasSearch: false,
        labels: {
            createSuccess: "Meta cuatrenio creada correctamente",
            updateSuccess: "Meta cuatrenio actualizada correctamente",
            createError: "Error al crear meta cuatrenio",
            updateError: "Error al actualizar meta cuatrenio",
            deleteSuccess: "Meta cuatrenio eliminada correctamente",
            deleteTitle: "Eliminar Meta Cuatrenio",
            emptyText: "No hay metas por cuatrenio registradas para esta variable",
            emptySearchText: "",
        },
        getDeleteDescription: (goal: any) => `¿Estás seguro que deseas eliminar la meta del cuatrenio ${goal?.startYear}-${goal?.endYear}?`,
        getEditValues: (goal: any) => ({ startYear: goal.startYear, endYear: goal.endYear, value: Number(goal.value) }),
        getCreatePayload: (data: any, variableId: string) => ({ variableId, startYear: data.startYear, endYear: data.endYear, value: data.value }),
        getUpdatePayload: (data: any) => ({ value: data.value }),
    },
} as const

interface Props {
    variableId: string | null
    mode: "annual" | "quadrennium"
}

export function VariableGoalsTabBase({ variableId, mode }: Readonly<Props>) {
    const config = MODE_CONFIG[mode]

    const [goals, setGoals] = useState<any[]>([])
    const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null)
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(5)

    const [search, setSearch] = useState("")
    const debouncedSearch = useDebounce(search, 500)

    const [editingGoal, setEditingGoal] = useState<any>(null)
    const [goalToDelete, setGoalToDelete] = useState<any>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const { control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(config.schema) as any,
        defaultValues: config.defaults as any,
    })

    const fetchGoals = useCallback(async () => {
        if (!variableId) return
        setLoading(true)
        try {
            const params = new URLSearchParams({
                variableId,
                page: page.toString(),
                limit: limit.toString(),
                ...config.sortParams,
            })
            if (config.hasSearch && debouncedSearch) {
                params.append("search", debouncedSearch)
            }
            const result = await get<PaginatedData<any>>(`${config.endpoint}?${params}`)
            setGoals(result.data)
            setMeta(result.meta)
        } catch (error) {
            console.error(`Error fetching variable ${mode} goals:`, error)
        } finally {
            setLoading(false)
        }
    }, [variableId, page, limit, debouncedSearch, config, mode])

    useEffect(() => {
        if (variableId) fetchGoals()
    }, [variableId, fetchGoals])

    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    const handleEditGoal = (goal: any) => {
        setEditingGoal(goal)
        const values = config.getEditValues(goal)
        Object.entries(values).forEach(([key, val]) => setValue(key, val))
    }

    const handleCancelEditGoal = () => {
        setEditingGoal(null)
        reset(config.defaults as any)
    }

    const handleDeleteGoal = (goal: any) => {
        setGoalToDelete(goal)
        setIsDeleteModalOpen(true)
    }

    const onSubmit = async (data: any) => {
        if (!variableId) return
        try {
            if (editingGoal) {
                await patch(`${config.endpoint}/${editingGoal.id}`, config.getUpdatePayload(data))
                addToast({ title: config.labels.updateSuccess, color: "success" })
                setEditingGoal(null)
            } else {
                await post(config.endpoint, config.getCreatePayload(data, variableId))
                addToast({ title: config.labels.createSuccess, color: "success" })
            }
            reset(config.defaults as any)
            fetchGoals()
        } catch (error: any) {
            addToast({
                title: editingGoal ? config.labels.updateError : config.labels.createError,
                description: error.message || "Ocurrió un error inesperado",
                color: "danger",
            })
        }
    }

    const onConfirmDelete = async () => {
        if (!goalToDelete) return
        setDeleting(true)
        try {
            await del(`${config.endpoint}/${goalToDelete.id}`)
            addToast({ title: config.labels.deleteSuccess, color: "success" })
            fetchGoals()
        } catch (error: any) {
            addToast({ title: "Error al eliminar", description: error.message || "Ocurrió un error inesperado", color: "danger" })
        } finally {
            setDeleting(false)
            setIsDeleteModalOpen(false)
            setGoalToDelete(null)
        }
    }

    const renderCell = (goal: any, columnKey: React.Key) => {
        switch (columnKey) {
            case "year":
                return <span className="font-medium text-small">{goal.year}</span>
            case "startYear":
                return <span className="font-medium text-small">{goal.startYear}</span>
            case "endYear":
                return <span className="font-medium text-small">{goal.endYear}</span>
            case "value":
                return <GoalValueCell value={goal.value} />
            case "createdAt":
                return <GoalDateCell dateString={goal.createAt} />
            case "actions":
                return <GoalActionsCell onEdit={() => handleEditGoal(goal)} onDelete={() => handleDeleteGoal(goal)} />
            default:
                return null
        }
    }

    return (
        <div className="space-y-6 pt-4">
            <div className="bg-default-50 p-4 rounded-medium border border-default-100">
                <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-3">
                    {mode === "annual" ? (
                        <Controller
                            name="year"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    value={field.value?.toString()}
                                    type="number"
                                    label="Año"
                                    placeholder="2025"
                                    errorMessage={errors.year?.message as string}
                                    isInvalid={!!errors.year}
                                    variant="bordered"
                                    size="sm"
                                    className="w-32"
                                />
                            )}
                        />
                    ) : (
                        <>
                            <Controller
                                name="startYear"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        value={field.value?.toString()}
                                        type="number"
                                        label="Año Inicial"
                                        placeholder="2025"
                                        errorMessage={errors.startYear?.message as string}
                                        isInvalid={!!errors.startYear}
                                        variant="bordered"
                                        size="sm"
                                        className="w-28"
                                        isDisabled={!!editingGoal}
                                    />
                                )}
                            />
                            <Controller
                                name="endYear"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        value={field.value?.toString()}
                                        type="number"
                                        label="Año Final"
                                        placeholder="2028"
                                        errorMessage={errors.endYear?.message as string}
                                        isInvalid={!!errors.endYear}
                                        variant="bordered"
                                        size="sm"
                                        className="w-28"
                                        isDisabled={!!editingGoal}
                                    />
                                )}
                            />
                        </>
                    )}
                    <Controller
                        name="value"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                value={field.value?.toString()}
                                type="number"
                                label="Valor Meta"
                                placeholder="0"
                                errorMessage={errors.value?.message as string}
                                isInvalid={!!errors.value}
                                variant="bordered"
                                size="sm"
                                className="flex-1"
                            />
                        )}
                    />
                    {editingGoal ? (
                        <div className="flex gap-2">
                            <Button color="primary" type="submit" size="lg" isLoading={isSubmitting} className="h-[48px]" startContent={<Pencil size={20} />}>
                                Actualizar
                            </Button>
                            <Button isIconOnly color="danger" variant="flat" size="lg" className="h-[48px] w-[48px]" onPress={handleCancelEditGoal}>
                                <X size={20} />
                            </Button>
                        </div>
                    ) : (
                        <Button color="primary" type="submit" size="lg" isLoading={isSubmitting} className="h-[48px]">
                            <Plus size={20} />
                        </Button>
                    )}
                </form>
            </div>

            <ResourceManager
                columns={config.columns}
                items={goals}
                renderCell={renderCell}
                {...(config.hasSearch ? { search, onSearchChange: setSearch, searchPlaceholder: "Buscar año..." } : {})}
                isLoading={loading}
                page={page}
                totalPages={meta?.totalPages}
                onPageChange={setPage}
                limit={limit}
                onLimitChange={(l) => { setLimit(l); setPage(1) }}
                limitOptions={[5, 10, 20]}
                emptyContent={
                    <div className="text-center py-8 text-default-400 border border-dashed border-default-200 rounded-lg">
                        <BarChart className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>{config.hasSearch && search ? config.labels.emptySearchText : config.labels.emptyText}</p>
                    </div>
                }
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={onConfirmDelete}
                title={config.labels.deleteTitle}
                description={config.getDeleteDescription(goalToDelete)}
                confirmText="Eliminar"
                confirmColor="danger"
                isLoading={deleting}
            />
        </div>
    )
}
