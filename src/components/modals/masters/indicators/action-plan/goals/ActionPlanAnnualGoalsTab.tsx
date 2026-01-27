"use client"

import { useCallback, useEffect, useState } from "react"
import {
    Button,
    Input,
    Tooltip,
} from "@heroui/react"
import { get, post, patch, del, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { ActionPlanIndicatorGoal } from "@/types/masters/indicators"
import { BarChart, Plus, Pencil, Trash2, X } from "lucide-react"
import { ResourceManager } from "@/components/common/ResourceManager"
import { ColumnDef } from "@/components/tables/CleanTable"
import { useDebounce } from "@/hooks/useDebounce"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { addToast } from "@heroui/toast"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import {
    getActionPlanIndicatorGoals,
    createActionPlanIndicatorGoal,
    updateActionPlanIndicatorGoal,
    deleteActionPlanIndicatorGoal
} from "@/services/masters/indicators.service"

interface Props {
    indicatorId: string | null
}

const columns: ColumnDef[] = [
    { name: "AÑO", uid: "year" },
    { name: "VALOR META", uid: "value", align: "end" },
    { name: "CREADO", uid: "createdAt", align: "end" },
    { name: "ACCIONES", uid: "actions", align: "center" },
]

const schema = z.object({
    year: z.coerce.number().min(2000, "Año inválido"),
    value: z.union([z.string(), z.number()])
        .refine((val) => val !== "", "El valor es requerido")
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val >= 0, "El valor debe ser mayor o igual a 0"),
})

type FormValues = z.infer<typeof schema>

export function ActionPlanAnnualGoalsTab({ indicatorId }: Props) {
    const [goals, setGoals] = useState<ActionPlanIndicatorGoal[]>([])
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
    const [editingGoal, setEditingGoal] = useState<ActionPlanIndicatorGoal | null>(null)
    const [goalToDelete, setGoalToDelete] = useState<ActionPlanIndicatorGoal | null>(null)
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

            const result = await getActionPlanIndicatorGoals(params.toString())
            setGoals(result.data)
            setMeta(result.meta)
        } catch (error) {
            console.error("Error fetching action plan indicator annual goals:", error)
        } finally {
            setLoading(false)
        }
    }, [indicatorId, page, limit, debouncedSearch])

    useEffect(() => {
        if (indicatorId) {
            fetchGoals()
        }
    }, [indicatorId, fetchGoals])

    // Reset pagination when search changes
    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    const handleEditGoal = (goal: ActionPlanIndicatorGoal) => {
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

    const handleDeleteGoal = (goal: ActionPlanIndicatorGoal) => {
        setGoalToDelete(goal)
        setIsDeleteModalOpen(true)
    }

    const onSubmit = async (data: FormValues) => {
        if (!indicatorId) return

        try {
            if (editingGoal) {
                await updateActionPlanIndicatorGoal(editingGoal.id, {
                    value: data.value
                })
                addToast({ title: "Meta actualizada correctamente", color: "success" })
                setEditingGoal(null)
            } else {
                await createActionPlanIndicatorGoal({
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
            await deleteActionPlanIndicatorGoal(goalToDelete.id)
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

    const formatValue = (value: string | number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "decimal",
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(Number(value))
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("es-CO")
    }

    const renderCell = (goal: ActionPlanIndicatorGoal, columnKey: React.Key) => {
        switch (columnKey) {
            case "year":
                return <span className="font-medium text-small">{goal.year}</span>
            case "value":
                return (
                    <div className="flex items-center justify-end gap-2">
                        <span className="text-success-600 font-semibold text-small">
                            {formatValue(goal.value)}
                        </span>
                    </div>
                )
            case "createdAt":
                return <span className="text-default-500 text-small">{formatDate(goal.createAt)}</span>
            case "actions":
                return (
                    <div className="flex items-center justify-center gap-2">
                        <Tooltip content="Editar">
                            <span className="text-default-400 cursor-pointer active:opacity-50" onClick={() => handleEditGoal(goal)}>
                                <Pencil size={18} />
                            </span>
                        </Tooltip>
                        <Tooltip content="Eliminar" color="danger">
                            <span className="text-danger cursor-pointer active:opacity-50" onClick={() => handleDeleteGoal(goal)}>
                                <Trash2 size={18} />
                            </span>
                        </Tooltip>
                    </div>
                )
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
                    <Controller
                        name="value"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                value={field.value.toString()}
                                type="number"
                                label="Valor Meta"
                                placeholder="0"
                                errorMessage={errors.value?.message}
                                isInvalid={!!errors.value}
                                variant="bordered"
                                size="sm"
                                className="flex-1"
                            />
                        )}
                    />
                    {editingGoal ? (
                        <div className="flex gap-2">
                            <Button
                                color="primary"
                                type="submit"
                                size="lg"
                                isLoading={isSubmitting}
                                className="h-[48px]"
                                startContent={<Pencil size={20} />}
                            >
                                Actualizar
                            </Button>
                            <Button
                                isIconOnly
                                color="danger"
                                variant="flat"
                                size="lg"
                                className="h-[48px] w-[48px]"
                                onPress={handleCancelEditGoal}
                            >
                                <X size={20} />
                            </Button>
                        </div>
                    ) : (
                        <Button
                            color="primary"
                            type="submit"
                            size="lg"
                            isLoading={isSubmitting}
                            className="h-[48px]"
                        >
                            <Plus size={20} />
                        </Button>
                    )}
                </form>
            </div>

            {/* List */}
            <ResourceManager
                columns={columns}
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
