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
    Calendar,
    Building2,
    Link2,
    Clock,
    Activity,
} from "lucide-react"
import type { MasterContract } from "@/types/financial"

export function MasterContractDetailModal({
    isOpen,
    contract,
    onClose,
}: Readonly<{
    isOpen: boolean
    contract: MasterContract | null
    onClose: () => void
}>) {
    if (!contract) return null

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "N/A"
        return new Date(dateStr).toLocaleDateString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric",
        })
    }

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getStateColor = (state: string): "success" | "warning" | "danger" | "default" => {
        const stateLower = state.toLowerCase()
        if (stateLower === "legalizado" || stateLower === "active") return "success"
        if (stateLower === "pendiente" || stateLower === "pending") return "warning"
        return "default"
    }

    const stateLower = contract.state.toLowerCase()
    const isExecution = stateLower === "en ejecución"

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
                            <FileText size={18} className="text-default-600" />
                        </div>
                        <div>
                            <span className="text-lg font-semibold text-foreground">
                                Contrato {contract.number}
                            </span>
                            <p className="text-tiny text-default-400 font-normal">
                                Detalle del contrato marco
                            </p>
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody className="py-5">
                    <div className="space-y-5">
                        {/* Información Principal - Grid 2 columnas */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            {/* Valor Total */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <DollarSign size={16} className="text-default-500" />
                                </div>
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Valor Total
                                    </span>
                                    <p className="text-medium font-semibold text-foreground">
                                        {formatCurrency(contract.totalValue)}
                                    </p>
                                </div>
                            </div>

                            {/* Estado */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Activity size={16} className="text-default-500" />
                                </div>
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Estado
                                    </span>
                                    <div className="mt-0.5">
                                        <Chip
                                            color={isExecution ? "default" : getStateColor(contract.state)}
                                            variant="flat"
                                            size="sm"
                                            className={isExecution ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400" : ""}
                                        >
                                            {contract.state}
                                        </Chip>
                                    </div>
                                </div>
                            </div>

                            {/* Contratista */}
                            <div className="flex items-start gap-3 col-span-2">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Building2 size={16} className="text-default-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Contratista
                                    </span>
                                    <div className="flex flex-col">
                                        <p className="text-small font-medium text-foreground truncate">
                                            {contract.contractor.name}
                                        </p>
                                        <p className="text-tiny text-default-500 font-mono">
                                            NIT: {contract.contractor.nit}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Inicio Vigencia */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Calendar size={16} className="text-default-500" />
                                </div>
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Inicio Vigencia
                                    </span>
                                    <p className="text-small text-foreground">
                                        {formatDate(contract.startDate)}
                                    </p>
                                </div>
                            </div>

                            {/* Fin Vigencia */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Calendar size={16} className="text-default-500" />
                                </div>
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Fin Vigencia
                                    </span>
                                    <p className="text-small text-foreground">
                                        {formatDate(contract.endDate)}
                                    </p>
                                </div>
                            </div>

                            {/* Vinculación */}
                            <div className="flex items-start gap-3 col-span-2">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Link2 size={16} className="text-default-500" />
                                </div>
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Necesidad Vinculada
                                    </span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <p className="text-small font-medium text-foreground font-mono">
                                            {contract.need.code}
                                        </p>
                                        <Chip color="success" variant="dot" size="sm" classNames={{ base: "border-none" }}>
                                            Vinculado
                                        </Chip>
                                    </div>
                                </div>
                            </div>

                            {/* Fecha de Creación */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Clock size={16} className="text-default-500" />
                                </div>
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Creación
                                    </span>
                                    <p className="text-small text-foreground">
                                        {formatDateTime(contract.createAt)}
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
                                        {formatDateTime(contract.updateAt)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        {/* Objeto del Contrato - Ancho completo */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-default-500" />
                                <span className="text-small font-medium text-foreground">
                                    Objeto del Contrato
                                </span>
                            </div>
                            <p className="text-small text-default-600 leading-relaxed bg-default-50 dark:bg-default-100/50 rounded-lg p-3 text-justify whitespace-pre-line">
                                {contract.object}
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
