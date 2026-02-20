"use client"

import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    Textarea,
} from "@heroui/react"
import { useEffect } from "react"
import type { Variable } from "@/types/variable"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const schema = z.object({
    code: z.string().min(1, "El código es requerido"),
    name: z.string().min(1, "El nombre es requerido"),
    observations: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function VariableModal({
    isOpen,
    title,
    initial,
    isLoading = false,
    onClose,
    onSave,
}: Readonly<{
    isOpen: boolean
    title: string
    initial: Variable | null
    isLoading?: boolean
    onClose: () => void
    onSave: (payload: { code: string; name: string; observations?: string }) => void
}>) {
    const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            code: "",
            name: "",
            observations: ""
        }
    })

    useEffect(() => {
        if (isOpen) {
            reset({
                code: initial?.code ?? "",
                name: initial?.name ?? "",
                observations: initial?.observations ?? ""
            })
        }
    }, [initial, isOpen, reset])

    const onSubmit = (data: FormValues) => {
        onSave({
            code: data.code,
            name: data.name,
            observations: data.observations?.trim() || undefined,
        })
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={() => handleClose()} size="md">
            <ModalContent>
                <ModalHeader className="font-semibold">{title}</ModalHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ModalBody className="gap-5">
                        <div className="space-y-4">
                            <Controller
                                name="code"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Código"
                                        isDisabled={isLoading || !!initial}
                                        placeholder="VAR001"
                                        isInvalid={!!errors.code}
                                        errorMessage={errors.code?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="name"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        {...field}
                                        label="Nombre"
                                        isDisabled={isLoading}
                                        placeholder="Nombre de la variable"
                                        isInvalid={!!errors.name}
                                        errorMessage={errors.name?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="observations"
                                control={control}
                                render={({ field }) => (
                                    <Textarea
                                        {...field}
                                        label="Observaciones"
                                        isDisabled={isLoading}
                                        minRows={2}
                                        maxRows={4}
                                        placeholder="Observaciones opcionales..."
                                    />
                                )}
                            />
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="light" onPress={handleClose} isDisabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button
                            color="primary"
                            type="submit"
                            isDisabled={isLoading}
                            spinner={<Spinner size="sm" color="white" />}
                            isLoading={isLoading}
                        >
                            Guardar
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    )
}
