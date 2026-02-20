"use client"

import { useCallback, useEffect, useState } from "react"
import {
    Input,
} from "@heroui/react"
import { PaginatedData } from "@/lib/http"
import { BarChart } from "lucide-react"
import { ResourceManager } from "@/components/common/ResourceManager"
import { annualGoalColumns, goalValueField, GoalValueCell, GoalDateCell, GoalActionsCell, GoalValueController, GoalFormActions } from "@/config/goal-config"
import { useDebounce } from "@/hooks/useDebounce"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { addToast } from "@heroui/toast"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"

export interface GoalItem {
    id: string
    year: number
    value: string | number
    createAt: string
}

interface AnnualGoalsTabProps<T extends GoalItem> {
    indicatorId: string | null
    fetchGoals: (query: string) => Promise<PaginatedData<T>>
    createGoal: (data: { indicatorId: string; year: number; value: number }) => Promise<unknown>
    updateGoal: (id: string, data: { value: number }) => Promise<unknown>
    deleteGoal: (id: string) => Promise<unknown>
}

const schema = z.object({
    year: z.coerce.number().min(2000, "Año inválido"),
    value: goalValueField,
})

type FormValues = z.infer<typeof schema>

export function AnnualGoalsTab<T extends GoalItem>({
    indicatorId,
    fetchGoals: fetchGoalsFn,
    createGoal: createGoalFn,
    updateGoal: updateGoalFn,
    deleteGoal: deleteGoalFn,
}: Readonly<AnnualGoalsTabProps<T>>) {
    const [goals, setGoals] = useState<T[]>([])
    const [meta, setMeta] = useState<{
        total: number
        page: number
        limit: number
        totalPages: number
    } | null>(null)

    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(5)

    // Search state
    const [search, setSearch] = useState("")
    const debouncedSearch = useDebounce(search, 500)

    // Editing & Deleting State
    const [editingGoal, setEditingGoal] = useState<T | null>(null)
    const [goalToDelete, setGoalToDelete] = useState<T | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // Form
    const { control, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            year: new Date().getFullYear(),
            value: 0
        }
    })

    const fetchGoals = useCallback(async () => {
        if (!indicatorId) return

        setLoading(true)
        try {
            const params = new URLSearchParams({
                indicatorId,
                page: page.toString(),
                limit: limit.toString(),
                sortBy: "year",
                sortOrder: "DESC",
            })

            if (debouncedSearch) {
                params.append("search", debouncedSearch)
            }

            const result = await fetchGoalsFn(params.toString())
            setGoals(result.data)
            setMeta(result.meta)
        } catch (error) {
            console.error("Error fetching indicator annual goals:", error)
        } finally {
            setLoading(false)
        }
    }, [indicatorId, page, limit, debouncedSearch, fetchGoalsFn])

    useEffect(() => {
        if (indicatorId) {
            fetchGoals()
        }
    }, [indicatorId, fetchGoals])

    // Reset pagination when search changes
    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    const handleEditGoal = (goal: T) => {
        setEditingGoal(goal)
        setValue("year", goal.year)
        setValue("value", Number(goal.value))
    }

    const handleCancelEditGoal = () => {
        setEditingGoal(null)
        reset({
            year: new Date().getFullYear(),
            value: 0
        })
    }

    const handleDeleteGoal = (goal: T) => {
        setGoalToDelete(goal)
        setIsDeleteModalOpen(true)
    }

    const onSubmit = async (data: FormValues) => {
        if (!indicatorId) return

        try {
            if (editingGoal) {
                await updateGoalFn(editingGoal.id, {
                    value: data.value
                })
                addToast({ title: "Meta actualizada correctamente", color: "success" })
                setEditingGoal(null)
            } else {
                await createGoalFn({
                    indicatorId,
                    year: data.year,
                    value: data.value,
                })
                addToast({ title: "Meta creada correctamente", color: "success" })
            }

            reset({
                year: new Date().getFullYear(),
                value: 0
            })
            fetchGoals()
        } catch (error: any) {
            addToast({
                title: editingGoal ? "Error al actualizar la meta" : "Error al crear la meta",
                description: error.message || "Ocurrió un error inesperado",
                color: "danger",
            })
        }
    }

    const onConfirmDelete = async () => {
        if (!goalToDelete) return

        setDeleting(true)
        try {
            await deleteGoalFn(goalToDelete.id)
            addToast({ title: "Meta eliminada correctamente", color: "success" })
            fetchGoals()
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
            case "year":
                return <span className="font-medium text-small">{goal.year}</span>
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
            {/* Creation Form */}
            <div className="bg-default-50 p-4 rounded-medium border border-default-100">
                <form onSubmit={handleSubmit(onSubmit)} className="flex items-start gap-3">
                    <Controller
                        name="year"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                value={field.value.toString()}
                                type="number"
                                label="Año"
                                placeholder="2025"
                                errorMessage={errors.year?.message}
                                isInvalid={!!errors.year}
                                variant="bordered"
                                size="sm"
                                className="w-32"
                            />
                        )}
                    />
                    <GoalValueController control={control} errors={errors} />
                    <GoalFormActions isEditing={!!editingGoal} isSubmitting={isSubmitting} onCancel={handleCancelEditGoal} />
                </form>
            </div>

            {/* List */}
            <ResourceManager
                columns={annualGoalColumns}
                items={goals}
                renderCell={renderCell}
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Buscar año..."
                isLoading={loading}
                page={page}
                totalPages={meta?.totalPages}
                onPageChange={setPage}
                limit={limit}
                onLimitChange={(l) => {
                    setLimit(l)
                    setPage(1)
                }}
                limitOptions={[5, 10, 20]}
                emptyContent={
                    <div className="text-center py-8 text-default-400 border border-dashed border-default-200 rounded-lg">
                        <BarChart className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>{search ? "No se encontraron metas para la búsqueda" : "No hay metas registradas para este indicador"}</p>
                    </div>
                }
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={onConfirmDelete}
                title="Eliminar Meta Anual"
                description={`¿Estás seguro que deseas eliminar la meta del año ${goalToDelete?.year}?`}
                confirmText="Eliminar"
                confirmColor="danger"
                isLoading={deleting}
            />
        </div>
    )
}
