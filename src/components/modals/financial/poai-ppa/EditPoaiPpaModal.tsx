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
import { useState, useEffect } from "react"
import type { PoaiPpa } from "@/types/financial"

export type EditPoaiPpaPayload = {
    projectedPoai: number
    assignedPoai: number
}

type Props = {
    isOpen: boolean
    record: PoaiPpa | null
    isLoading: boolean
    onClose: () => void
    onSave: (data: EditPoaiPpaPayload) => Promise<void>
}

export function EditPoaiPpaModal({ isOpen, record, isLoading, onClose, onSave }: Readonly<Props>) {
    const [projectedPoai, setProjectedPoai] = useState("")
    const [assignedPoai, setAssignedPoai] = useState("")

    useEffect(() => {
        if (record) {
            setProjectedPoai(record.projectedPoai)
            setAssignedPoai(record.assignedPoai)
        }
    }, [record])

    const handleSave = async () => {
        if (!projectedPoai || !assignedPoai) return

        await onSave({
            projectedPoai: Number.parseFloat(projectedPoai),
            assignedPoai: Number.parseFloat(assignedPoai),
        })
    }

    const handleClose = () => {
        setProjectedPoai("")
        setAssignedPoai("")
        onClose()
    }

    const isFormValid = projectedPoai && assignedPoai

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="lg">
            <ModalContent>
                <ModalHeader>Editar Registro POAI PPA</ModalHeader>
                <ModalBody className="gap-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm text-default-500">Proyecto</p>
                            <p className="font-medium">{record?.project?.name ?? record?.projectCode}</p>
                        </div>
                        <div>
                            <p className="text-sm text-default-500">Año</p>
                            <p className="font-medium">{record?.year}</p>
                        </div>
                    </div>

                    <Input
                        label="POAI Proyectado"
                        placeholder="0"
                        type="number"
                        isRequired
                        value={projectedPoai}
                        onValueChange={setProjectedPoai}
                        startContent={
                            <div className="pointer-events-none flex items-center">
                                <span className="text-default-400 text-small">$</span>
                            </div>
                        }
                    />

                    <Input
                        label="POAI Asignado"
                        placeholder="0"
                        type="number"
                        isRequired
                        value={assignedPoai}
                        onValueChange={setAssignedPoai}
                        startContent={
                            <div className="pointer-events-none flex items-center">
                                <span className="text-default-400 text-small">$</span>
                            </div>
                        }
                    />
                </ModalBody>
                <ModalFooter>
                    <Button variant="flat" onPress={handleClose} isDisabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button
                        color="primary"
                        onPress={handleSave}
                        isDisabled={!isFormValid || isLoading}
                        isLoading={isLoading}
                    >
                        Guardar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
