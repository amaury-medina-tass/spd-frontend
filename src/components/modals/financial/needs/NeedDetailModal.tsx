"use client"

import { formatCurrency } from "@/lib/format-utils"
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Button,
    Chip,
    Divider,
} from "@heroui/react"
import {
    FileText,
    DollarSign,
    Clock,
    BookOpen,
    ClipboardList,
    Calendar,
    CheckCircle,
} from "lucide-react"
import type { FinancialNeed } from "@/types/financial"

export function NeedDetailModal({
    isOpen,
    need,
    onClose,
}: Readonly<{
    isOpen: boolean
    need: FinancialNeed | null
    onClose: () => void
}>) {
    if (!need) return null

    const formatDateTime = (dateStr: string) => {
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
        <Modal
            isOpen={isOpen}
            onOpenChange={() => onClose()}
            size="lg"
            scrollBehavior="inside"
            classNames={{
                base: "bg-content1",
                header: "border-b border-divider",
                footer: "border-t border-divider",
            }}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-default-100 flex items-center justify-center">
                            <ClipboardList size={18} className="text-default-600" />
                        </div>
                        <div>
                            <span className="text-lg font-semibold text-foreground">
                                Necesidad {need.code}
                            </span>
                            <p className="text-tiny text-default-400 font-normal">
                                Detalle de la necesidad financiera
                            </p>
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody className="py-5">
                    <div className="space-y-5">
                        {/* Información Principal - Grid 2 columnas */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            {/* Monto */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <DollarSign size={16} className="text-default-500" />
                                </div>
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Monto
                                    </span>
                                    <p className="text-medium font-semibold text-foreground">
                                        {formatCurrency(need.amount)}
                                    </p>
                                </div>
                            </div>

                            {/* Estudio Previo */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <BookOpen size={16} className="text-default-500" />
                                </div>
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Estudio Previo
                                    </span>
                                    <p className="text-small font-medium text-foreground font-mono">
                                        {need.previousStudy.code}
                                    </p>
                                </div>
                            </div>

                            {/* Estado del Estudio */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckCircle size={16} className="text-default-500" />
                                </div>
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Estado del Estudio
                                    </span>
                                    <div className="mt-0.5">
                                        <Chip
                                            color={getStatusColor(need.previousStudy.status)}
                                            variant="flat"
                                            size="sm"
                                        >
                                            {need.previousStudy.status}
                                        </Chip>
                                    </div>
                                </div>
                            </div>

                            {/* Fecha de Creación */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Calendar size={16} className="text-default-500" />
                                </div>
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Creación
                                    </span>
                                    <p className="text-small text-foreground">
                                        {formatDateTime(need.createAt)}
                                    </p>
                                </div>
                            </div>

                            {/* Última Actualización */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Clock size={16} className="text-default-500" />
                                </div>
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Actualización
                                    </span>
                                    <p className="text-small text-foreground">
                                        {formatDateTime(need.updateAt)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        {/* Descripción - Ancho completo */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-default-500" />
                                <span className="text-small font-medium text-foreground">
                                    Descripción
                                </span>
                            </div>
                            <p className="text-small text-default-600 leading-relaxed bg-default-50 dark:bg-default-100/50 rounded-lg p-3">
                                {need.description}
                            </p>
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
