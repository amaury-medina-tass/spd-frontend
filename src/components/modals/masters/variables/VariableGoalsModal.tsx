"use client"

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
} from "@heroui/react"
import { useCallback, useEffect, useState } from "react"
import { get, post, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { VariableGoal } from "@/types/variable"
import { Target, BarChart, Search, Plus } from "lucide-react"
import { CleanTable, ColumnDef } from "@/components/tables/CleanTable"
import { useDebounce } from "@/hooks/useDebounce"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { addToast } from "@heroui/toast"

interface Props {
    isOpen: boolean
    variableId: string | null
    variableName?: string
    onClose: () => void
}

const columns: ColumnDef[] = [
    { name: "AÑO", uid: "year" },
    { name: "VALOR META", uid: "value", align: "end" },
    { name: "CREADO", uid: "createdAt", align: "end" },
]

const schema = z.object({
    year: z.coerce.number().max(new Date().getFullYear(), "El año no puede ser mayor al actual"),
    value: z.union([z.string(), z.number()])
        .refine((val) => val !== "", "El valor es requerido")
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val >= 0, "El valor debe ser mayor o igual a 0"),
})

type FormValues = z.infer<typeof schema>

export function VariableGoalsModal({ isOpen, variableId, variableName, onClose }: Props) {
    const [goals, setGoals] = useState<VariableGoal[]>([])
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

    // Form State
    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            year: new Date().getFullYear(),
            value: 0
        }
    })

    const fetchGoals = useCallback(async () => {
        if (!variableId) return

        setLoading(true)
        try {
            const params = new URLSearchParams({
                variableId,
                page: page.toString(),
                limit: limit.toString(),
                sortBy: "year",
                sortOrder: "DESC",
            })

            if (debouncedSearch) {
                params.append("search", debouncedSearch)
            }

            const result = await get<PaginatedData<VariableGoal>>(`${endpoints.masters.variableGoals}?${params}`)
            setGoals(result.data)
            setMeta(result.meta)
        } catch (error) {
            console.error("Error fetching variable goals:", error)
        } finally {
            setLoading(false)
        }
    }, [variableId, page, limit, debouncedSearch])

    useEffect(() => {
        if (isOpen && variableId) {
            fetchGoals()
        }
    }, [isOpen, variableId, fetchGoals])

    // Reset pagination when search changes
    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    useEffect(() => {
        if (!isOpen) {
            setGoals([])
            setMeta(null)
            setPage(1)
            setSearch("")
            reset()
        }
    }, [isOpen, reset])

    const onSubmit = async (data: FormValues) => {
        if (!variableId) return

        try {
            await post(endpoints.masters.variableGoals, {
                variableId,
                year: data.year,
                value: data.value,
            })

            addToast({
                title: "Meta creada correctamente",
                color: "success",
            })

            reset({
                year: new Date().getFullYear(),
                value: 0
            })
            fetchGoals()
        } catch (error: any) {
            addToast({
                title: "Error al crear la meta",
                description: error.message || "Ocurrió un error inesperado",
                color: "danger",
            })
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

    const renderCell = (goal: VariableGoal, columnKey: React.Key) => {
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
            default:
                return null
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="2xl"
            scrollBehavior="inside"
            classNames={{
                base: "bg-content1",
                header: "border-b border-divider",
                footer: "border-t border-divider",
            }}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        <span>Metas de la Variable</span>
                    </div>
                    {variableName && (
                        <p className="text-small text-default-500 font-normal">
                            Asociadas a: {variableName}
                        </p>
                    )}
                </ModalHeader>
                <ModalBody className="py-6 space-y-6">
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
                            <Button
                                color="primary"
                                type="submit"
                                size="lg" // To match input height with label
                                isLoading={isSubmitting}
                                className="h-[48px]" // Specific height to match Input with label
                            >
                                <Plus size={20} />
                            </Button>
                        </form>
                    </div>

                    {/* List */}
                    <div className="space-y-4">
                        <div className="flex justify-end">
                            <Input
                                size="sm"
                                placeholder="Buscar año..."
                                value={search}
                                onValueChange={setSearch}
                                startContent={<Search size={16} className="text-default-400" />}
                                isClearable
                                onClear={() => setSearch("")}
                                className="max-w-xs"
                            />
                        </div>

                        <CleanTable
                            columns={columns}
                            items={goals}
                            renderCell={renderCell}
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
                                    <p>{search ? "No se encontraron metas para la búsqueda" : "No hay metas registradas para esta variable"}</p>
                                </div>
                            }
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                        Cerrar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
