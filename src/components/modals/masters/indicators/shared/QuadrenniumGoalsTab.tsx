"use client"

import { useCallback, useEffect, useState } from "react"
import {
    Input,
} from "@heroui/react"
import { PaginatedData } from "@/lib/http"
import { BarChart } from "lucide-react"
import { ResourceManager } from "@/components/common/ResourceManager"
import { quadrenniumGoalColumns, quadrenniumGoalSchema, QUADRENNIUM_DEFAULTS, GoalValueCell, GoalDateCell, GoalActionsCell, GoalValueController, GoalFormActions } from "@/config/goal-config"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { addToast } from "@heroui/toast"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"

export interface QuadrenniumGoalItem {
    id: string
    startYear: number
    endYear: number
    value: string | number
    createAt: string
}

interface QuadrenniumGoalsTabProps<T extends QuadrenniumGoalItem> {
    indicatorId: string | null
    fetchGoals: (query: string) => Promise<PaginatedData<T>>
    createGoal: (data: { indicatorId: string; startYear: number; endYear: number; value: number }) => Promise<unknown>
    updateGoal: (id: string, data: { value: number }) => Promise<unknown>
    deleteGoal: (id: string) => Promise<unknown>
    paginated?: boolean
}

type QuadrenniumFormValues = z.infer<typeof quadrenniumGoalSchema>

export function QuadrenniumGoalsTab<T extends QuadrenniumGoalItem>({
    indicatorId,
    fetchGoals,
    createGoal,
    updateGoal,
    deleteGoal,
    paginated = true,
}: Readonly<QuadrenniumGoalsTabProps<T>>) {
    const [goals, setGoals] = useState<T[]>([])
    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [meta, setMeta] = useState<{ totalPages: number } | null>(null)

    const [editingGoal, setEditingGoal] = useState<T | null>(null)
    const [goalToDelete, setGoalToDelete] = useState<T | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<QuadrenniumFormValues>({
        resolver: zodResolver(quadrenniumGoalSchema) as any,
        defaultValues: QUADRENNIUM_DEFAULTS,
    })

    const fetchData = useCallback(async () => {
        if (!indicatorId) return

        setLoading(true)
        try {
            const params = new URLSearchParams({
                indicatorId,
                page: page.toString(),
                limit: limit.toString(),
                sortBy: "startYear",
                sortOrder: "DESC"
            })

            const result = await fetchGoals(params.toString())
            setGoals(result.data)
            setMeta(result.meta)
        } catch (error) {
            console.error("Error fetching quadrennium goals:", error)
        } finally {
            setLoading(false)
        }
    }, [indicatorId, page, limit, fetchGoals])

    useEffect(() => {
        if (indicatorId) {
            fetchData()
        }
    }, [indicatorId, fetchData])

    const handleEdit = (goal: T) => {
        setEditingGoal(goal)
        setValue("startYear", goal.startYear)
        setValue("endYear", goal.endYear)
        setValue("value", Number(goal.value))
    }

    const handleCancelEdit = () => {
        setEditingGoal(null)
        reset(QUADRENNIUM_DEFAULTS)
    }

    const handleDelete = (goal: T) => {
        setGoalToDelete(goal)
        setIsDeleteModalOpen(true)
    }

    const onSubmit = async (data: QuadrenniumFormValues) => {
        if (!indicatorId) return

        try {
            if (editingGoal) {
                await updateGoal(editingGoal.id, { value: data.value })
                addToast({ title: "Meta cuatrenio actualizada correctamente", color: "success" })
                setEditingGoal(null)
            } else {
                await createGoal({
                    indicatorId,
                    startYear: data.startYear,
                    endYear: data.endYear,
                    value: data.value,
                })
                addToast({ title: "Meta cuatrenio creada correctamente", color: "success" })
            }

            reset(QUADRENNIUM_DEFAULTS)
            fetchData()
        } catch (error: any) {
            addToast({
                title: editingGoal ? "Error al actualizar meta cuatrenio" : "Error al crear meta cuatrenio",
                description: error.message || "Ocurrió un error inesperado",
                color: "danger",
            })
        }
    }

    const onConfirmDelete = async () => {
        if (!goalToDelete) return

        setDeleting(true)
        try {
            await deleteGoal(goalToDelete.id)
            addToast({ title: "Meta cuatrenio eliminada correctamente", color: "success" })
            fetchData()
        } catch (error: any) {
            addToast({
                title: "Error al eliminar",
                description: error.message || "Ocurrió un error inesperado",
                color: "danger",
            })
        } finally {
            setDeleting(false)
            setIsDeleteModalOpen(false)
            setGoalToDelete(null)
        }
    }

    const renderCell = (goal: T, columnKey: React.Key) => {
        switch (columnKey) {
            case "startYear":
                return <span className="font-medium text-small">{goal.startYear}</span>
            case "endYear":
                return <span className="font-medium text-small">{goal.endYear}</span>
            case "value":
                return <GoalValueCell value={goal.value} />
            case "createdAt":
                return <GoalDateCell dateString={goal.createAt} />
            case "actions":
                return <GoalActionsCell onEdit={() => handleEdit(goal)} onDelete={() => handleDelete(goal)} />
            default:
                return null
        }
    }

    return (
        <div className="pt-4 space-y-6">
            <div className="bg-default-50 p-4 rounded-medium border border-default-100">
                <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-3">
                    <Controller
                        name="startYear"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                value={field.value.toString()}
                                type="number"
                                label="Año Inicial"
                                placeholder="2024"
                                errorMessage={errors.startYear?.message}
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
                                value={field.value.toString()}
                                type="number"
                                label="Año Final"
                                placeholder="2027"
                                errorMessage={errors.endYear?.message}
                                isInvalid={!!errors.endYear}
                                variant="bordered"
                                size="sm"
                                className="w-28"
                                isDisabled={!!editingGoal}
                            />
                        )}
                    />
                    <GoalValueController control={control} errors={errors} />
                    <GoalFormActions isEditing={!!editingGoal} isSubmitting={isSubmitting} onCancel={handleCancelEdit} />
                </form>
            </div>

            <ResourceManager
                columns={quadrenniumGoalColumns}
                items={goals}
                renderCell={renderCell}
                isLoading={loading}
                {...(paginated ? {
                    page,
                    totalPages: meta?.totalPages,
                    onPageChange: setPage,
                    limit,
                    onLimitChange: (l: number) => {
                        setLimit(l)
                        setPage(1)
                    },
                    limitOptions: [5, 10, 20],
                } : {})}
                emptyContent={
                    <div className="text-center py-8 text-default-400 border border-dashed border-default-200 rounded-lg">
                        <BarChart className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>No hay metas por cuatrenio registradas para este indicador</p>
                    </div>
                }
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={onConfirmDelete}
                title="Eliminar Meta Cuatrenio"
                description={`¿Estás seguro que deseas eliminar la meta del cuatrenio ${goalToDelete?.startYear}-${goalToDelete?.endYear}?`}
                confirmText="Eliminar"
                confirmColor="danger"
                isLoading={deleting}
            />
        </div>
    )
}
