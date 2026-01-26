import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea, Select, SelectItem } from "@heroui/react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect, useState } from "react"
import { addToast } from "@heroui/toast"
import { updateIndicator, getIndicatorCatalogs } from "@/services/masters/indicators.service"
import { Indicator, IndicatorCatalogs } from "@/types/masters/indicators"

const schema = z.object({
    code: z.string().min(1, "El código es requerido"),
    name: z.string().min(1, "El nombre es requerido"),
    observations: z.string().optional(),
    advancePercentage: z.coerce.number().min(0).max(100),
    pillarCode: z.string().min(1, "Requerido"),
    pillarName: z.string().min(1, "Requerido"),
    componentCode: z.string().min(1, "Requerido"),
    componentName: z.string().min(1, "Requerido"),
    programCode: z.string().min(1, "Requerido"),
    programName: z.string().min(1, "Requerido"),
    description: z.string().min(1, "Requerido"),
    baseline: z.string().min(1, "Requerido"),
    indicatorTypeId: z.coerce.number().min(1, "Seleccione un tipo"),
    unitMeasureId: z.coerce.number().min(1, "Seleccione una unidad"),
    directionId: z.coerce.number().min(1, "Seleccione una dirección"),
})

type FormValues = z.infer<typeof schema>

interface EditIndicatorModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    indicator: Indicator | null
}

export function EditIndicatorModal({ isOpen, onClose, onSuccess, indicator }: EditIndicatorModalProps) {
    const [catalogs, setCatalogs] = useState<IndicatorCatalogs | null>(null)
    const [loadingCatalogs, setLoadingCatalogs] = useState(false)

    const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormValues>({
        resolver: zodResolver(schema) as any,
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

    useEffect(() => {
        if (indicator && isOpen) {
            reset({
                code: indicator.code,
                name: indicator.name,
                observations: indicator.observations || "",
                advancePercentage: Number(indicator.advancePercentage),
                pillarCode: indicator.pillarCode,
                pillarName: indicator.pillarName,
                componentCode: indicator.componentCode,
                componentName: indicator.componentName,
                programCode: indicator.programCode,
                programName: indicator.programName,
                description: indicator.description,
                baseline: indicator.baseline,
                indicatorTypeId: indicator.indicatorTypeId,
                unitMeasureId: indicator.unitMeasureId,
                directionId: indicator.directionId,
            })
        }
    }, [indicator, isOpen, reset])

    const onSubmit = async (data: FormValues) => {
        if (!indicator) return
        try {
            await updateIndicator(indicator.id, {
                ...data,
                observations: data.observations || ""
            })
            addToast({ title: "Indicador actualizado correctamente", color: "success" })
            onSuccess()
            onClose()
        } catch (error: any) {
            addToast({ title: error.message || "Error al actualizar indicador", color: "danger" })
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader>Editar Indicador</ModalHeader>
                        <ModalBody>
                            <form id="edit-indicator-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Basic Info */}
                                <div className="md:col-span-2">
                                    <h3 className="text-lg font-semibold mb-2">Información Básica</h3>
                                </div>
                                <Controller
                                    name="code"
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} label="Código" isInvalid={!!errors.code} errorMessage={errors.code?.message} isDisabled />
                                    )}
                                />
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} label="Nombre" isInvalid={!!errors.name} errorMessage={errors.name?.message} />
                                    )}
                                />
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <Textarea {...field} label="Descripción" className="md:col-span-2" isInvalid={!!errors.description} errorMessage={errors.description?.message} />
                                    )}
                                />

                                {/* Classifications */}
                                <div className="md:col-span-2 mt-2">
                                    <h3 className="text-lg font-semibold mb-2">Clasificación</h3>
                                </div>

                                <Controller
                                    name="indicatorTypeId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            label="Tipo de Indicador"
                                            placeholder="Seleccione un tipo"
                                            selectedKeys={field.value ? [field.value.toString()] : []}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            isLoading={loadingCatalogs}
                                            isInvalid={!!errors.indicatorTypeId}
                                            errorMessage={errors.indicatorTypeId?.message}
                                        >
                                            {(catalogs?.indicatorTypes || []).map((type) => (
                                                <SelectItem key={type.id.toString()}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </Select>
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
                                    name="directionId"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            label="Sentido del Indicador"
                                            placeholder="Seleccione un sentido"
                                            selectedKeys={field.value ? [field.value.toString()] : []}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            isLoading={loadingCatalogs}
                                            isInvalid={!!errors.directionId}
                                            errorMessage={errors.directionId?.message}
                                        >
                                            {(catalogs?.indicatorDirections || []).map((dir) => (
                                                <SelectItem key={dir.id.toString()}>
                                                    {dir.name}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                    )}
                                />

                                <Controller
                                    name="baseline"
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} label="Línea Base" isInvalid={!!errors.baseline} errorMessage={errors.baseline?.message} />
                                    )}
                                />

                                <Controller
                                    name="advancePercentage"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            value={field.value?.toString() || "0"}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            type="number"
                                            label="Porcentaje de Avance"
                                            isInvalid={!!errors.advancePercentage}
                                            errorMessage={errors.advancePercentage?.message}
                                        />
                                    )}
                                />

                                {/* Strategic Alignment */}
                                <div className="md:col-span-2 mt-2">
                                    <h3 className="text-lg font-semibold mb-2">Alineación Estratégica</h3>
                                </div>

                                <Controller
                                    name="pillarCode"
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} label="Cód. Pilar" isInvalid={!!errors.pillarCode} errorMessage={errors.pillarCode?.message} />
                                    )}
                                />
                                <Controller
                                    name="pillarName"
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} label="Nombre Pilar" isInvalid={!!errors.pillarName} errorMessage={errors.pillarName?.message} />
                                    )}
                                />

                                <Controller
                                    name="componentCode"
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} label="Cód. Componente" isInvalid={!!errors.componentCode} errorMessage={errors.componentCode?.message} />
                                    )}
                                />
                                <Controller
                                    name="componentName"
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} label="Nombre Componente" isInvalid={!!errors.componentName} errorMessage={errors.componentName?.message} />
                                    )}
                                />

                                <Controller
                                    name="programCode"
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} label="Cód. Programa" isInvalid={!!errors.programCode} errorMessage={errors.programCode?.message} />
                                    )}
                                />
                                <Controller
                                    name="programName"
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} label="Nombre Programa" isInvalid={!!errors.programName} errorMessage={errors.programName?.message} />
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
                            <Button color="primary" type="submit" form="edit-indicator-form" isLoading={isSubmitting}>
                                Guardar Cambios
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
