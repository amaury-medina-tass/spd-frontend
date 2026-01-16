"use client"

import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Button,
    Chip,
} from "@heroui/react"
import type { FinancialNeed } from "@/types/financial"

export function NeedDetailModal({
    isOpen,
    need,
    onClose,
}: {
    isOpen: boolean
    need: FinancialNeed | null
    onClose: () => void
}) {
    if (!need) return null

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(parseFloat(amount))
    }

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getStatusColor = (status: string): "success" | "warning" | "danger" | "default" => {
        const statusLower = status.toLowerCase()
        if (statusLower === "aprobado" || statusLower === "approved") return "success"
        if (statusLower === "pendiente" || statusLower === "pending") return "warning"
        if (statusLower === "rechazado" || statusLower === "rejected") return "danger"
        return "default"
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={() => onClose()} size="2xl">
            <ModalContent>
                <ModalHeader className="font-semibold">Need Details</ModalHeader>
                <ModalBody className="gap-5">
                    {/* Need Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-default-700">Need Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-small text-default-500">Code</span>
                                <p className="text-medium font-medium">{need.code}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-small text-default-500">Amount</span>
                                <p className="text-medium font-medium text-primary">
                                    {formatCurrency(need.amount)}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className="text-small text-default-500">Description</span>
                            <p className="text-medium">{need.description}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-small text-default-500">Created At</span>
                                <p className="text-small">{formatDate(need.createAt)}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-small text-default-500">Updated At</span>
                                <p className="text-small">{formatDate(need.updateAt)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-default-200" />

                    {/* Previous Study Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium text-default-700">Previous Study</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-small text-default-500">Study Code</span>
                                <p className="text-medium font-medium">{need.previousStudy.code}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-small text-default-500">Status</span>
                                <Chip
                                    color={getStatusColor(need.previousStudy.status)}
                                    variant="flat"
                                    size="sm"
                                >
                                    {need.previousStudy.status}
                                </Chip>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <span className="text-small text-default-500">Study Created At</span>
                                <p className="text-small">{formatDate(need.previousStudy.createAt)}</p>
                            </div>
                            <div className="space-y-1">
                                <span className="text-small text-default-500">Study Updated At</span>
                                <p className="text-small">{formatDate(need.previousStudy.updateAt)}</p>
                            </div>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" variant="light" onPress={onClose}>
                        Close
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
