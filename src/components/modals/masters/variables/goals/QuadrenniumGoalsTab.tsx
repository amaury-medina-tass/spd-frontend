"use client"

import { useCallback, useEffect, useState } from "react"
import {
    Button,
    Input,
    Tooltip,
} from "@heroui/react"
import { get, post, patch, del, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { VariableQuadrenniumGoal } from "@/types/variable"
import { BarChart, Plus, Pencil, Trash2, X } from "lucide-react"
import { ResourceManager } from "@/components/common/ResourceManager"
import { ColumnDef } from "@/components/tables/CleanTable"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { addToast } from "@heroui/toast"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"

interface Props {
    variableId: string | null
}

const quadrenniumColumns: ColumnDef[] = [
    { name: "AÑO INICIAL", uid: "startYear" },
    { name: "AÑO FINAL", uid: "endYear" },
    { name: "VALOR META", uid: "value", align: "end" },
    { name: "CREADO", uid: "createdAt", align: "end" },
    { name: "ACCIONES", uid: "actions", align: "center" },
]

const quadrenniumSchema = z.object({
    startYear: z.coerce.number().min(2000, "Año inválido"),
    endYear: z.coerce.number().min(2000, "Año inválido").refine((val) => val >= 2000, "Año inválido"),
    value: z.union([z.string(), z.number()])
        .refine((val) => val !== "", "El valor es requerido")
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val >= 0, "El valor debe ser mayor o igual a 0"),
}).refine((data) => data.endYear - data.startYear === 3, {
    message: "El periodo debe ser de exactamente 4 años (ej: 2024-2027)",
    path: ["endYear"],
})

type QuadrenniumFormValues = z.infer<typeof quadrenniumSchema>

export function QuadrenniumGoalsTab({ variableId }: Props) {
    const [quadrenniumGoals, setQuadrenniumGoals] = useState<VariableQuadrenniumGoal[]>([])
    const [quadrenniumMeta, setQuadrenniumMeta] = useState<{
        total: number
        page: number
        limit: number
        totalPages: number
    } | null>(null)

    const [quadrenniumLoading, setQuadrenniumLoading] = useState(false)
    const [quadrenniumPage, setQuadrenniumPage] = useState(1)
    const [quadrenniumLimit, setQuadrenniumLimit] = useState(5)

    const [editingQuadrennium, setEditingQuadrennium] = useState<VariableQuadrenniumGoal | null>(null)
    const [quadrenniumToDelete, setQuadrenniumToDelete] = useState<VariableQuadrenniumGoal | null>(null)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    const {
        control: qControl,
        handleSubmit: qHandleSubmit,
        reset: qReset,
        setValue: qSetValue,
        formState: { errors: qErrors, isSubmitting: qIsSubmitting }
    } = useForm<QuadrenniumFormValues>({
        resolver: zodResolver(quadrenniumSchema) as any,
        defaultValues: {
            startYear: new Date().getFullYear(),
            endYear: new Date().getFullYear() + 3,
            value: 0
        }
    })

    const fetchQuadrenniumGoals = useCallback(async () => {
        if (!variableId) return

        setQuadrenniumLoading(true)
        try {
            const params = new URLSearchParams({
                variableId,
                page: quadrenniumPage.toString(),
                limit: quadrenniumLimit.toString(),
            })

            const result = await get<PaginatedData<VariableQuadrenniumGoal>>(`${endpoints.masters.variableQuadrenniums}?${params}`)
            setQuadrenniumGoals(result.data)
            setQuadrenniumMeta(result.meta)
        } catch (error) {
            console.error("Error fetching variable quadrennium goals:", error)
        } finally {
            setQuadrenniumLoading(false)
        }
    }, [variableId, quadrenniumPage, quadrenniumLimit])

    useEffect(() => {
        if (variableId) {
            fetchQuadrenniumGoals()
        }
    }, [variableId, fetchQuadrenniumGoals])

    const handleEditQuadrennium = (goal: VariableQuadrenniumGoal) => {
        setEditingQuadrennium(goal)
        qSetValue("startYear", goal.startYear)
        qSetValue("endYear", goal.endYear)
        qSetValue("value", Number(goal.value))
    }

    const handleCancelEditQuadrennium = () => {
        setEditingQuadrennium(null)
        qReset({
            startYear: new Date().getFullYear(),
            endYear: new Date().getFullYear() + 3,
            value: 0
        })
    }

    const handleDeleteQuadrennium = (goal: VariableQuadrenniumGoal) => {
        setQuadrenniumToDelete(goal)
        setIsDeleteModalOpen(true)
    }

    const onQuadrenniumSubmit = async (data: QuadrenniumFormValues) => {
        if (!variableId) return

        try {
            if (editingQuadrennium) {
                await patch(`${endpoints.masters.variableQuadrenniums}/${editingQuadrennium.id}`, {
                    value: data.value
                })
                addToast({ title: "Meta cuatrenio actualizada correctamente", color: "success" })
                setEditingQuadrennium(null)
            } else {
                await post(endpoints.masters.variableQuadrenniums, {
                    variableId,
                    startYear: data.startYear,
                    endYear: data.endYear,
                    value: data.value,
                })
                addToast({ title: "Meta cuatrenio creada correctamente", color: "success" })
            }

            qReset({
                startYear: new Date().getFullYear(),
                endYear: new Date().getFullYear() + 3,
                value: 0
            })
            fetchQuadrenniumGoals()
        } catch (error: any) {
            addToast({
                title: editingQuadrennium ? "Error al actualizar meta cuatrenio" : "Error al crear meta cuatrenio",
                description: error.message || "Ocurrió un error inesperado",
                color: "danger",
            })
        }
    }

    const onConfirmDelete = async () => {
        if (!quadrenniumToDelete) return

        setDeleting(true)
        try {
            await del(`${endpoints.masters.variableQuadrenniums}/${quadrenniumToDelete.id}`)
            addToast({ title: "Meta cuatrenio eliminada correctamente", color: "success" })
            fetchQuadrenniumGoals()
        } catch (error: any) {
            addToast({
                title: "Error al eliminar",
                description: error.message || "Ocurrió un error inesperado",
                color: "danger",
            })
        } finally {
            setDeleting(false)
            setIsDeleteModalOpen(false)
            setQuadrenniumToDelete(null)
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

    const renderQuadrenniumCell = (goal: VariableQuadrenniumGoal, columnKey: React.Key) => {
        switch (columnKey) {
            case "startYear":
                return <span className="font-medium text-small">{goal.startYear}</span>
            case "endYear":
                return <span className="font-medium text-small">{goal.endYear}</span>
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
                            <span className="text-default-400 cursor-pointer active:opacity-50" onClick={() => handleEditQuadrennium(goal)}>
                                <Pencil size={18} />
                            </span>
                        </Tooltip>
                        <Tooltip content="Eliminar" color="danger">
                            <span className="text-danger cursor-pointer active:opacity-50" onClick={() => handleDeleteQuadrennium(goal)}>
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
        <div className="pt-4 space-y-6">
            <div className="bg-default-50 p-4 rounded-medium border border-default-100">
                <form onSubmit={qHandleSubmit(onQuadrenniumSubmit)} className="flex items-start gap-3">
                    <Controller
                        name="startYear"
                        control={qControl}
                        render={({ field }) => (
                            <Input
                                {...field}
                                value={field.value.toString()}
                                type="number"
                                label="Año Inicial"
                                placeholder="2025"
                                errorMessage={qErrors.startYear?.message}
                                isInvalid={!!qErrors.startYear}
                                variant="bordered"
                                size="sm"
                                className="w-28"
                                isDisabled={!!editingQuadrennium}
                            />
                        )}
                    />
                    <Controller
                        name="endYear"
                        control={qControl}
                        render={({ field }) => (
                            <Input
                                {...field}
                                value={field.value.toString()}
                                type="number"
                                label="Año Final"
                                placeholder="2028"
                                errorMessage={qErrors.endYear?.message}
                                isInvalid={!!qErrors.endYear}
                                variant="bordered"
                                size="sm"
                                className="w-28"
                                isDisabled={!!editingQuadrennium}
                            />
                        )}
                    />
                    <Controller
                        name="value"
                        control={qControl}
                        render={({ field }) => (
                            <Input
                                {...field}
                                value={field.value.toString()}
                                type="number"
                                label="Valor Meta"
                                placeholder="0"
                                errorMessage={qErrors.value?.message}
                                isInvalid={!!qErrors.value}
                                variant="bordered"
                                size="sm"
                                className="flex-1"
                            />
                        )}
                    />
                    {editingQuadrennium ? (
                        <div className="flex gap-2">
                            <Button
                                color="primary"
                                type="submit"
                                size="lg"
                                isLoading={qIsSubmitting}
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
                                onPress={handleCancelEditQuadrennium}
                            >
                                <X size={20} />
                            </Button>
                        </div>
                    ) : (
                        <Button
                            color="primary"
                            type="submit"
                            size="lg"
                            isLoading={qIsSubmitting}
                            className="h-[48px]"
                        >
                            <Plus size={20} />
                        </Button>
                    )}
                </form>
            </div>

            <ResourceManager
                columns={quadrenniumColumns}
                items={quadrenniumGoals}
                renderCell={renderQuadrenniumCell}
                isLoading={quadrenniumLoading}
                page={quadrenniumPage}
                totalPages={quadrenniumMeta?.totalPages}
                onPageChange={setQuadrenniumPage}
                limit={quadrenniumLimit}
                onLimitChange={(l) => {
                    setQuadrenniumLimit(l)
                    setQuadrenniumPage(1)
                }}
                limitOptions={[5, 10, 20]}
                emptyContent={
                    <div className="text-center py-8 text-default-400 border border-dashed border-default-200 rounded-lg">
                        <BarChart className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>No hay metas por cuatrenio registradas para esta variable</p>
                    </div>
                }
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={onConfirmDelete}
                title="Eliminar Meta Cuatrenio"
                description={`¿Estás seguro que deseas eliminar la meta del cuatrenio ${quadrenniumToDelete?.startYear}-${quadrenniumToDelete?.endYear}?`}
                confirmText="Eliminar"
                confirmColor="danger"
                isLoading={deleting}
            />
        </div>
    )
}
