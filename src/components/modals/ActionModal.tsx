// src/components/modals/ActionModal.tsx
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
    Switch,
    Textarea,
} from "@heroui/react"
import { useEffect, useState } from "react"
import type { Action } from "@/types/action"

export function ActionModal({
    isOpen,
    title,
    initial,
    isLoading = false,
    onClose,
    onSave,
}: {
    isOpen: boolean
    title: string
    initial: Action | null
    isLoading?: boolean
    onClose: () => void
    onSave: (payload: { code_action: string; name: string; description?: string }) => void
}) {
    const [codeAction, setCodeAction] = useState("")
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")

    useEffect(() => {
        setCodeAction(initial?.code_action ?? "")
        setName(initial?.name ?? "")
        setDescription(initial?.description ?? "")
    }, [initial, isOpen])

    const isEditing = !!initial

    return (
        <Modal isOpen={isOpen} onOpenChange={() => onClose()} size="lg" scrollBehavior="inside">
            <ModalContent>
                <ModalHeader className="font-semibold">{title}</ModalHeader>
                <ModalBody className="gap-4">
                    <Input
                        label="Código"
                        value={codeAction}
                        onValueChange={setCodeAction}
                        isDisabled={isLoading || isEditing}
                        description={isEditing ? "El código no puede ser modificado" : "Código único de la acción (ej: READ, CREATE)"}
                    />
                    <Input
                        label="Nombre"
                        value={name}
                        onValueChange={setName}
                        isDisabled={isLoading}
                    />
                    <Textarea
                        label="Descripción"
                        value={description}
                        onValueChange={setDescription}
                        isDisabled={isLoading}
                        minRows={2}
                        maxRows={4}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose} isDisabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button
                        color="primary"
                        onPress={() => onSave({ code_action: codeAction, name, description })}
                        isDisabled={!codeAction.trim() || !name.trim() || isLoading}
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
