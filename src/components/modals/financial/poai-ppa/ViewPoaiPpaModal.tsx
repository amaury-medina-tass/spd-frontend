"use client"

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Divider,
} from "@heroui/react"
import type { PoaiPpa } from "@/types/financial"

type Props = {
    isOpen: boolean
    record: PoaiPpa | null
    onClose: () => void
}

function formatCurrency(value: string | number): string {
    const numValue = typeof value === "string" ? Number.parseFloat(value) : value
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    }).format(numValue)
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
    })
}

export function ViewPoaiPpaModal({ isOpen, record, onClose }: Readonly<Props>) {
    if (!record) return null

    const projectedValue = Number.parseFloat(record.projectedPoai)
    const assignedValue = Number.parseFloat(record.assignedPoai)
    const executionRate = projectedValue > 0 ? (assignedValue / projectedValue) * 100 : 0

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalContent>
                <ModalHeader>Detalle del Registro POAI PPA</ModalHeader>
                <ModalBody className="gap-4">
                    {/* Project Info */}
                    <div className="bg-default-50 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-default-600 mb-2">Información del Proyecto</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-default-400">Código</p>
                                <p className="font-medium">{record.projectCode}</p>
                            </div>
                            <div>
                                <p className="text-xs text-default-400">Nombre</p>
                                <p className="font-medium">{record.project?.name ?? "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    <Divider />

                    {/* Budget Info */}
                    <div>
                        <h3 className="text-sm font-semibold text-default-600 mb-3">Información Presupuestal</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-primary-50 rounded-lg p-4">
                                <p className="text-xs text-primary-600">Año</p>
                                <p className="text-2xl font-bold text-primary">{record.year}</p>
                            </div>
                            <div className="bg-success-50 rounded-lg p-4">
                                <p className="text-xs text-success-600">Tasa de Ejecución</p>
                                <p className="text-2xl font-bold text-success">{executionRate.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-default-400">POAI Proyectado</p>
                            <p className="text-lg font-semibold text-primary">{formatCurrency(record.projectedPoai)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-default-400">POAI Asignado</p>
                            <p className="text-lg font-semibold text-success">{formatCurrency(record.assignedPoai)}</p>
                        </div>
                    </div>

                    <Divider />

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-xs text-default-400">Fecha de Creación</p>
                            <p className="font-medium">{formatDate(record.createAt)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-default-400">Última Actualización</p>
                            <p className="font-medium">{formatDate(record.updateAt)}</p>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="flat" onPress={onClose}>
                        Cerrar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
