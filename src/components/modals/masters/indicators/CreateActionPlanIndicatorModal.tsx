import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Select, SelectItem } from "@heroui/react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect, useState } from "react"
import { addToast } from "@heroui/toast"
import { createActionPlanIndicator, getIndicatorCatalogs } from "@/services/masters/indicators.service"
import { IndicatorCatalogs } from "@/types/masters/indicators"

const schema = z.object({
    code: z.string().min(1, "El código es requerido"),
    statisticalCode: z.string().min(1, "El código estadístico es requerido"),
    name: z.string().min(1, "El nombre es requerido"),
    sequenceNumber: z.coerce.number().min(1, "Debe ser al menos 1"),
    description: z.string().min(1, "Requerido"),
    plannedQuantity: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
    executionCut: z.string().min(1, "Requerido"),
    compliancePercentage: z.coerce.number().min(0).max(100),
    observations: z.string().optional(),
    unitMeasureId: z.coerce.number().min(1, "Seleccione una unidad"),
})

type FormValues = z.infer<typeof schema>

interface CreateActionPlanIndicatorModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export function CreateActionPlanIndicatorModal({ isOpen, onClose, onSuccess }: CreateActionPlanIndicatorModalProps) {
    const [catalogs, setCatalogs] = useState<IndicatorCatalogs | null>(null)
    const [loadingCatalogs, setLoadingCatalogs] = useState(false)

    const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            code: "",
            statisticalCode: "",
            name: "",
            sequenceNumber: 1,
            description: "",
            plannedQuantity: 0,
            executionCut: "",
            compliancePercentage: 0,
            observations: "",
            unitMeasureId: 0,
        }
    })

    useEffect(() => {
        if (isOpen && !catalogs) {
            setLoadingCatalogs(true)
            getIndicatorCatalogs()
                .then(setCatalogs)
                .catch(() => addToast({ title: "Error al cargar catálogos", color: "danger" }))
                .finally(() => setLoadingCatalogs(false))
        }
    }, [isOpen, catalogs])

    const onSubmit = async (data: FormValues) => {
        try {
            await createActionPlanIndicator({
                ...data,
                observations: data.observations || ""
            })
            addToast({ title: "Indicador creado correctamente", color: "success" })
            reset()
            onSuccess()
            onClose()
        } catch (error: any) {
            addToast({ title: error.message || "Error al crear indicador", color: "danger" })
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader>Crear Indicador (Plan de Acción)</ModalHeader>
                        <ModalBody>
                            <form id="create-action-plan-indicator-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <h3 className="text-lg font-semibold mb-2">Información Básica</h3>
                                </div>

                                <Controller
                                    name="code"
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} label="Código" isInvalid={!!errors.code} errorMessage={errors.code?.message} />
                                    )}
                                />
                                <Controller
                                    name="statisticalCode"
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} label="Código Estadístico" isInvalid={!!errors.statisticalCode} errorMessage={errors.statisticalCode?.message} />
                                    )}
                                />

                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} label="Nombre" className="md:col-span-2" isInvalid={!!errors.name} errorMessage={errors.name?.message} />
                                    )}
                                />

                                <Controller
                                    name="sequenceNumber"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="number"
                                            label="Número de Secuencia"
                                            value={field.value?.toString()}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            isInvalid={!!errors.sequenceNumber}
                                            errorMessage={errors.sequenceNumber?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="unitMeasureId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            label="Unidad de Medida"
                                            placeholder="Seleccione una unidad"
                                            selectedKeys={field.value ? [field.value.toString()] : []}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            isLoading={loadingCatalogs}
                                            isInvalid={!!errors.unitMeasureId}
                                            errorMessage={errors.unitMeasureId?.message}
                                        >
                                            {(catalogs?.unitMeasures || []).map((unit) => (
                                                <SelectItem key={unit.id.toString()}>
                                                    {unit.name}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    )}
                                />

                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <Textarea {...field} label="Descripción" className="md:col-span-2" isInvalid={!!errors.description} errorMessage={errors.description?.message} />
                                    )}
                                />

                                <div className="md:col-span-2 mt-2">
                                    <h3 className="text-lg font-semibold mb-2">Metas y Ejecución</h3>
                                </div>

                                <Controller
                                    name="plannedQuantity"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="number"
                                            label="Cantidad Planeada"
                                            value={field.value?.toString()}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            isInvalid={!!errors.plannedQuantity}
                                            errorMessage={errors.plannedQuantity?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    name="executionCut"
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} label="Corte de Ejecución" isInvalid={!!errors.executionCut} errorMessage={errors.executionCut?.message} />
                                    )}
                                />

                                <Controller
                                    name="compliancePercentage"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            type="number"
                                            label="Porcentaje de Cumplimiento"
                                            value={field.value?.toString()}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            isInvalid={!!errors.compliancePercentage}
                                            errorMessage={errors.compliancePercentage?.message}
                                        />
                                    )}
                                />

                                <Controller
                                    name="observations"
                                    control={control}
                                    render={({ field }) => (
                                        <Textarea {...field} label="Observaciones" className="md:col-span-2" isInvalid={!!errors.observations} errorMessage={errors.observations?.message} />
                                    )}
                                />

                            </form>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={close}>
                                Cancelar
                            </Button>
                            <Button color="primary" type="submit" form="create-action-plan-indicator-form" isLoading={isSubmitting}>
                                Crear
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
