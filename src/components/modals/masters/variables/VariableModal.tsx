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
import { useEffect, useState } from "react"
import type { Variable } from "@/types/variable"

export function VariableModal({
    isOpen,
    title,
    initial,
    isLoading = false,
    onClose,
    onSave,
}: {
    isOpen: boolean
    title: string
    initial: Variable | null
    isLoading?: boolean
    onClose: () => void
    onSave: (payload: { code: string; name: string; observations?: string }) => void
}) {
    const [code, setCode] = useState("")
    const [name, setName] = useState("")
    const [observations, setObservations] = useState("")

    useEffect(() => {
        setCode(initial?.code ?? "")
        setName(initial?.name ?? "")
        setObservations(initial?.observations ?? "")
    }, [initial, isOpen])

    const handleSave = () => {
        onSave({
            code,
            name,
            observations: observations.trim() || undefined,
        })
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={() => onClose()} size="md">
            <ModalContent>
                <ModalHeader className="font-semibold">{title}</ModalHeader>
                <ModalBody className="gap-5">
                    <div className="space-y-4">
                        <Input
                            label="Código"
                            value={code}
                            onValueChange={setCode}
                            isDisabled={isLoading || !!initial}
                            placeholder="VAR001"
                        />
                        <Input
                            label="Nombre"
                            value={name}
                            onValueChange={setName}
                            isDisabled={isLoading}
                            placeholder="Nombre de la variable"
                        />
                        <Textarea
                            label="Observaciones"
                            value={observations}
                            onValueChange={setObservations}
                            isDisabled={isLoading}
                            minRows={2}
                            maxRows={4}
                            placeholder="Observaciones opcionales..."
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose} isDisabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button
                        color="primary"
                        onPress={handleSave}
                        isDisabled={!code.trim() || !name.trim() || isLoading}
                        spinner={<Spinner size="sm" color="white" />}
                        isLoading={isLoading}
                    >
                        Guardar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
