"use client"

import {
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
} from "@heroui/react"
import { Calendar, Code, FileText, Clock } from "lucide-react"
import type { Variable } from "@/types/variable"

export function VariableDetailModal({
    isOpen,
    variable,
    onClose,
}: Readonly<{
    isOpen: boolean
    variable: Variable | null
    onClose: () => void
}>) {
    if (!variable) return null

    return (
        <Modal isOpen={isOpen} onOpenChange={() => onClose()} size="lg">
            <ModalContent>
                <ModalHeader className="font-semibold flex items-center gap-2">
                    <Code size={20} />
                    Detalle de Variable
                </ModalHeader>
                <ModalBody className="pb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-small text-default-500 flex items-center gap-1">
                                <Code size={14} />
                                Código
                            </p>
                            <p className="font-medium">{variable.code}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-small text-default-500 flex items-center gap-1">
                                <FileText size={14} />
                                Nombre
                            </p>
                            <p className="font-medium">{variable.name}</p>
                        </div>
                    </div>

                    <div className="space-y-1 mt-4">
                        <p className="text-small text-default-500 flex items-center gap-1">
                            <FileText size={14} />
                            Observaciones
                        </p>
                        <p className="text-default-700 bg-default-100 rounded-lg p-3">
                            {variable.observations || "Sin observaciones"}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-default-200">
                        <div className="space-y-1">
                            <p className="text-small text-default-500 flex items-center gap-1">
                                <Calendar size={14} />
                                Fecha de Creación
                            </p>
                            <p className="text-small">{new Date(variable.createAt).toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-small text-default-500 flex items-center gap-1">
                                <Clock size={14} />
                                Última Actualización
                            </p>
                            <p className="text-small">{new Date(variable.updateAt).toLocaleString()}</p>
                        </div>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}
