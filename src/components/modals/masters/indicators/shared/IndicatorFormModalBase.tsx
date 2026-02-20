import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react"
import { useForm, Control, FieldErrors } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect, useState } from "react"
import { addToast } from "@heroui/toast"
import { getIndicatorCatalogs } from "@/services/masters/indicators.service"
import { IndicatorCatalogs } from "@/types/masters/indicators"

interface BaseProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    title: string
    formId: string
    schema: z.ZodType<any, any, any>
    renderFields: (props: {
        control: Control<any>
        errors: FieldErrors<any>
        catalogs: IndicatorCatalogs | null
        loadingCatalogs: boolean
    }) => React.ReactNode
}

interface CreateModeProps extends BaseProps {
    mode: "create"
    defaultValues: Record<string, any>
    createFn: (data: any) => Promise<unknown>
}

interface EditModeProps extends BaseProps {
    mode: "edit"
    indicator: { id: string } | null
    updateFn: (id: string, data: any) => Promise<unknown>
    resetValues: (indicator: any) => any
}

type IndicatorFormModalBaseProps = CreateModeProps | EditModeProps

export function IndicatorFormModalBase(props: IndicatorFormModalBaseProps) {
    const { isOpen, onClose, onSuccess, title, formId, schema, renderFields } = props
    const [catalogs, setCatalogs] = useState<IndicatorCatalogs | null>(null)
    const [loadingCatalogs, setLoadingCatalogs] = useState(false)

    const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
        resolver: zodResolver(schema) as any,
        ...(props.mode === "create" ? { defaultValues: props.defaultValues } : {}),
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

    const editIndicator = props.mode === "edit" ? props.indicator : undefined
    const editResetValues = props.mode === "edit" ? props.resetValues : undefined

    useEffect(() => {
        if (editIndicator && isOpen && editResetValues) {
            reset(editResetValues(editIndicator))
        }
    }, [editIndicator, isOpen, reset, editResetValues])

    const onSubmit = async (data: any) => {
        try {
            const payload = { ...data, observations: data.observations || "" }
            if (props.mode === "create") {
                await props.createFn(payload)
                addToast({ title: "Indicador creado correctamente", color: "success" })
                reset()
            } else {
                if (!props.indicator) return
                await props.updateFn(props.indicator.id, payload)
                addToast({ title: "Indicador actualizado correctamente", color: "success" })
            }
            onSuccess()
            onClose()
        } catch (error: any) {
            addToast({
                title: error.message || (props.mode === "create" ? "Error al crear indicador" : "Error al actualizar indicador"),
                color: "danger",
            })
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="3xl" scrollBehavior="inside">
            <ModalContent>
                {(close) => (
                    <>
                        <ModalHeader>{title}</ModalHeader>
                        <ModalBody>
                            <form id={formId} onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderFields({ control, errors, catalogs, loadingCatalogs })}
                            </form>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={close}>
                                Cancelar
                            </Button>
                            <Button color="primary" type="submit" form={formId} isLoading={isSubmitting}>
                                {props.mode === "create" ? "Crear" : "Guardar Cambios"}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
