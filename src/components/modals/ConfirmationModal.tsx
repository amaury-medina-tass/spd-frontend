"use client"

import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
} from "@heroui/react"

interface ConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    isLoading?: boolean
    confirmText?: string
    cancelText?: string
    confirmColor?: "primary" | "secondary" | "success" | "warning" | "danger"
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    isLoading,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    confirmColor = "primary",
}: Readonly<ConfirmationModalProps>) {
    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={() => !isLoading && onClose()}
            size="sm"
            placement="center"
            isDismissable={!isLoading}
        >
            <ModalContent>
                <ModalHeader className="font-semibold">{title}</ModalHeader>
                <ModalBody>
                    <p className="text-small text-default-500">{description}</p>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose} isDisabled={isLoading}>
                        {cancelText}
                    </Button>
                    <Button
                        color={confirmColor}
                        onPress={onConfirm}
                        isDisabled={isLoading}
                        startContent={isLoading ? <Spinner size="sm" color="current" /> : undefined}
                    >
                        {confirmText}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
