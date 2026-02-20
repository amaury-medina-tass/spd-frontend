import { Input, Textarea, Select, SelectItem } from "@heroui/react"
import { Controller, Control, FieldErrors } from "react-hook-form"
import { z } from "zod"

// Shared schema for indicative plan indicators (Create + Edit)
export const indicativeIndicatorSchema = z.object({
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

export type IndicativeIndicatorFormValues = z.infer<typeof indicativeIndicatorSchema>

export const indicativeDefaultValues: IndicativeIndicatorFormValues = {
    code: "", name: "", observations: "", advancePercentage: 0,
    pillarCode: "", pillarName: "", componentCode: "", componentName: "",
    programCode: "", programName: "", description: "", baseline: "0",
    indicatorTypeId: 0, unitMeasureId: 0, directionId: 0,
}

// Shared schema for action plan indicators (Create + Edit)
export const actionPlanIndicatorSchema = z.object({
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

export type ActionPlanIndicatorFormValues = z.infer<typeof actionPlanIndicatorSchema>

export const actionPlanDefaultValues: ActionPlanIndicatorFormValues = {
    code: "", statisticalCode: "", name: "", sequenceNumber: 1,
    description: "", plannedQuantity: 0, executionCut: "",
    compliancePercentage: 0, observations: "", unitMeasureId: 0,
}

// Shared render fields for indicative plan indicators
interface RenderFieldsProps {
    control: Control<any>
    errors: FieldErrors<any>
    catalogs: any
    loadingCatalogs: boolean
}

export function renderIndicativeFields({ control, errors, catalogs, loadingCatalogs }: RenderFieldsProps, options?: { codeDisabled?: boolean; showAdvancePercentage?: boolean }) {
    return (
        <>
            <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-2">Información Básica</h3>
            </div>
            <Controller name="code" control={control} render={({ field }) => (
                <Input {...field} label="Código" isInvalid={!!errors.code} errorMessage={errors.code?.message as string} isDisabled={options?.codeDisabled} />
            )} />
            <Controller name="name" control={control} render={({ field }) => (
                <Input {...field} label="Nombre" isInvalid={!!errors.name} errorMessage={errors.name?.message as string} />
            )} />
            <Controller name="description" control={control} render={({ field }) => (
                <Textarea {...field} label="Descripción" className="md:col-span-2" isInvalid={!!errors.description} errorMessage={errors.description?.message as string} />
            )} />

            <div className="md:col-span-2 mt-2">
                <h3 className="text-lg font-semibold mb-2">Clasificación</h3>
            </div>
            <Controller name="indicatorTypeId" control={control} render={({ field }) => (
                <Select label="Tipo de Indicador" placeholder="Seleccione un tipo" selectedKeys={field.value ? [field.value.toString()] : []} onChange={(e) => field.onChange(Number(e.target.value))} isLoading={loadingCatalogs} isInvalid={!!errors.indicatorTypeId} errorMessage={errors.indicatorTypeId?.message as string}>
                    {(catalogs?.indicatorTypes || []).map((type: any) => (<SelectItem key={type.id.toString()}>{type.name}</SelectItem>))}
                </Select>
            )} />
            <Controller name="unitMeasureId" control={control} render={({ field }) => (
                <Select label="Unidad de Medida" placeholder="Seleccione una unidad" selectedKeys={field.value ? [field.value.toString()] : []} onChange={(e) => field.onChange(Number(e.target.value))} isLoading={loadingCatalogs} isInvalid={!!errors.unitMeasureId} errorMessage={errors.unitMeasureId?.message as string}>
                    {(catalogs?.unitMeasures || []).map((unit: any) => (<SelectItem key={unit.id.toString()}>{unit.name}</SelectItem>))}
                </Select>
            )} />
            <Controller name="directionId" control={control} render={({ field }) => (
                <Select label="Sentido del Indicador" placeholder="Seleccione un sentido" selectedKeys={field.value ? [field.value.toString()] : []} onChange={(e) => field.onChange(Number(e.target.value))} isLoading={loadingCatalogs} isInvalid={!!errors.directionId} errorMessage={errors.directionId?.message as string}>
                    {(catalogs?.indicatorDirections || []).map((dir: any) => (<SelectItem key={dir.id.toString()}>{dir.name}</SelectItem>))}
                </Select>
            )} />
            <Controller name="baseline" control={control} render={({ field }) => (
                <Input {...field} label="Línea Base" isInvalid={!!errors.baseline} errorMessage={errors.baseline?.message as string} />
            )} />
            {options?.showAdvancePercentage && (
                <Controller name="advancePercentage" control={control} render={({ field }) => (
                    <Input {...field} value={field.value?.toString() || "0"} onChange={(e) => field.onChange(Number(e.target.value))} type="number" label="Porcentaje de Avance" isInvalid={!!errors.advancePercentage} errorMessage={errors.advancePercentage?.message as string} />
                )} />
            )}

            <div className="md:col-span-2 mt-2">
                <h3 className="text-lg font-semibold mb-2">Alineación Estratégica</h3>
            </div>
            <Controller name="pillarCode" control={control} render={({ field }) => (
                <Input {...field} label="Cód. Pilar" isInvalid={!!errors.pillarCode} errorMessage={errors.pillarCode?.message as string} />
            )} />
            <Controller name="pillarName" control={control} render={({ field }) => (
                <Input {...field} label="Nombre Pilar" isInvalid={!!errors.pillarName} errorMessage={errors.pillarName?.message as string} />
            )} />
            <Controller name="componentCode" control={control} render={({ field }) => (
                <Input {...field} label="Cód. Componente" isInvalid={!!errors.componentCode} errorMessage={errors.componentCode?.message as string} />
            )} />
            <Controller name="componentName" control={control} render={({ field }) => (
                <Input {...field} label="Nombre Componente" isInvalid={!!errors.componentName} errorMessage={errors.componentName?.message as string} />
            )} />
            <Controller name="programCode" control={control} render={({ field }) => (
                <Input {...field} label="Cód. Programa" isInvalid={!!errors.programCode} errorMessage={errors.programCode?.message as string} />
            )} />
            <Controller name="programName" control={control} render={({ field }) => (
                <Input {...field} label="Nombre Programa" isInvalid={!!errors.programName} errorMessage={errors.programName?.message as string} />
            )} />
            <Controller name="observations" control={control} render={({ field }) => (
                <Textarea {...field} label="Observaciones" className="md:col-span-2" isInvalid={!!errors.observations} errorMessage={errors.observations?.message as string} />
            )} />
        </>
    )
}

// Shared render fields for action plan indicators
export function renderActionPlanFields({ control, errors, catalogs, loadingCatalogs }: RenderFieldsProps, options?: { codeDisabled?: boolean }) {
    return (
        <>
            <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-2">Información Básica</h3>
            </div>
            <Controller name="code" control={control} render={({ field }) => (
                <Input {...field} label="Código" isInvalid={!!errors.code} errorMessage={errors.code?.message as string} isDisabled={options?.codeDisabled} />
            )} />
            <Controller name="statisticalCode" control={control} render={({ field }) => (
                <Input {...field} label="Código Estadístico" isInvalid={!!errors.statisticalCode} errorMessage={errors.statisticalCode?.message as string} />
            )} />
            <Controller name="name" control={control} render={({ field }) => (
                <Input {...field} label="Nombre" className="md:col-span-2" isInvalid={!!errors.name} errorMessage={errors.name?.message as string} />
            )} />
            <Controller name="sequenceNumber" control={control} render={({ field }) => (
                <Input {...field} type="number" label="Número de Secuencia" value={field.value?.toString()} onChange={(e) => field.onChange(Number(e.target.value))} isInvalid={!!errors.sequenceNumber} errorMessage={errors.sequenceNumber?.message as string} />
            )} />
            <Controller name="unitMeasureId" control={control} render={({ field }) => (
                <Select label="Unidad de Medida" placeholder="Seleccione una unidad" selectedKeys={field.value ? [field.value.toString()] : []} onChange={(e) => field.onChange(Number(e.target.value))} isLoading={loadingCatalogs} isInvalid={!!errors.unitMeasureId} errorMessage={errors.unitMeasureId?.message as string}>
                    {(catalogs?.unitMeasures || []).map((unit: any) => (<SelectItem key={unit.id.toString()}>{unit.name}</SelectItem>))}
                </Select>
            )} />
            <Controller name="description" control={control} render={({ field }) => (
                <Textarea {...field} label="Descripción" className="md:col-span-2" isInvalid={!!errors.description} errorMessage={errors.description?.message as string} />
            )} />

            <div className="md:col-span-2 mt-2">
                <h3 className="text-lg font-semibold mb-2">Metas y Ejecución</h3>
            </div>
            <Controller name="plannedQuantity" control={control} render={({ field }) => (
                <Input {...field} type="number" label="Cantidad Planeada" value={field.value?.toString()} onChange={(e) => field.onChange(Number(e.target.value))} isInvalid={!!errors.plannedQuantity} errorMessage={errors.plannedQuantity?.message as string} />
            )} />
            <Controller name="executionCut" control={control} render={({ field }) => (
                <Input {...field} label="Corte de Ejecución" isInvalid={!!errors.executionCut} errorMessage={errors.executionCut?.message as string} />
            )} />
            <Controller name="compliancePercentage" control={control} render={({ field }) => (
                <Input {...field} type="number" label="Porcentaje de Cumplimiento" value={field.value?.toString()} onChange={(e) => field.onChange(Number(e.target.value))} isInvalid={!!errors.compliancePercentage} errorMessage={errors.compliancePercentage?.message as string} />
            )} />
            <Controller name="observations" control={control} render={({ field }) => (
                <Textarea {...field} label="Observaciones" className="md:col-span-2" isInvalid={!!errors.observations} errorMessage={errors.observations?.message as string} />
            )} />
        </>
    )
}
