import { z } from "zod"
import { ColumnDef } from "@/components/tables/CleanTable"
import { Tooltip, Input, Button } from "@heroui/react"
import { Pencil, Trash2, Plus, X } from "lucide-react"
import { Controller } from "react-hook-form"

// --- Shared columns ---

export const annualGoalColumns: ColumnDef[] = [
    { name: "AÑO", uid: "year" },
    { name: "VALOR META", uid: "value", align: "end" },
    { name: "CREADO", uid: "createdAt", align: "end" },
    { name: "ACCIONES", uid: "actions", align: "center" },
]

export const quadrenniumGoalColumns: ColumnDef[] = [
    { name: "AÑO INICIAL", uid: "startYear" },
    { name: "AÑO FINAL", uid: "endYear" },
    { name: "VALOR META", uid: "value", align: "end" },
    { name: "CREADO", uid: "createdAt", align: "end" },
    { name: "ACCIONES", uid: "actions", align: "center" },
]

// --- Shared schema fields ---

export const goalValueField = z.union([z.string(), z.number()])
    .refine((val) => val !== "", "El valor es requerido")
    .transform(Number)
    .refine((val) => !Number.isNaN(val) && val >= 0, "El valor debe ser mayor o igual a 0")

export const quadrenniumGoalSchema = z.object({
    startYear: z.coerce.number().min(2000, "Año inválido"),
    endYear: z.coerce.number().min(2000, "Año inválido"),
    value: goalValueField,
}).refine((data) => data.endYear - data.startYear === 3, {
    message: "El periodo debe ser de exactamente 4 años (ej: 2024-2027)",
    path: ["endYear"],
})

export const QUADRENNIUM_DEFAULTS = {
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear() + 3,
    value: 0,
}

// --- Shared formatters ---

export const formatGoalValue = (value: string | number) =>
    new Intl.NumberFormat("es-CO", {
        style: "decimal",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(Number(value))

export const formatGoalDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("es-CO")

// --- Shared cell renderers ---

export function GoalValueCell({ value }: Readonly<{ value: string | number }>) {
    return (
        <div className="flex items-center justify-end gap-2">
            <span className="text-success-600 font-semibold text-small">
                {formatGoalValue(value)}
            </span>
        </div>
    )
}

export function GoalDateCell({ dateString }: Readonly<{ dateString: string }>) {
    return <span className="text-default-500 text-small">{formatGoalDate(dateString)}</span>
}

export function GoalActionsCell({ onEdit, onDelete }: Readonly<{ onEdit: () => void; onDelete: () => void }>) {
    return (
        <div className="flex items-center justify-center gap-2">
            <Tooltip content="Editar">
                <button type="button" className="text-default-400 cursor-pointer active:opacity-50 bg-transparent border-none p-0" onClick={onEdit}>
                    <Pencil size={18} />
                </button>
            </Tooltip>
            <Tooltip content="Eliminar" color="danger">
                <button type="button" className="text-danger cursor-pointer active:opacity-50 bg-transparent border-none p-0" onClick={onDelete}>
                    <Trash2 size={18} />
                </button>
            </Tooltip>
        </div>
    )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function GoalValueController({ control, errors }: Readonly<{ control: any; errors: any }>) {
    return (
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
    )
}

export function GoalFormActions({ isEditing, isSubmitting, onCancel }: Readonly<{ isEditing: boolean; isSubmitting: boolean; onCancel: () => void }>) {
    if (isEditing) {
        return (
            <div className="flex gap-2">
                <Button color="primary" type="submit" size="lg" isLoading={isSubmitting} className="h-[48px]" startContent={<Pencil size={20} />}>
                    Actualizar
                </Button>
                <Button isIconOnly color="danger" variant="flat" size="lg" className="h-[48px] w-[48px]" onPress={onCancel}>
                    <X size={20} />
                </Button>
            </div>
        )
    }
    return (
        <Button color="primary" type="submit" size="lg" isLoading={isSubmitting} className="h-[48px]">
            <Plus size={20} />
        </Button>
    )
}
