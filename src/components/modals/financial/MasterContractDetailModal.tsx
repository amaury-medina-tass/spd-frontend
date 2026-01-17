"use client"

import { useState } from "react"
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Button,
    Chip,
    Divider,
    Card,
    CardBody,
    Tooltip,
    addToast,
} from "@heroui/react"
import {
    FileText,
    DollarSign,
    Calendar,
    Building2,
    Link2,
    Clock,
    Hash,
    Copy,
    Check,
} from "lucide-react"
import type { MasterContract } from "@/types/financial"

interface CopyButtonProps {
    text: string
    label: string
}

function CopyButton({ text, label }: CopyButtonProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            addToast({
                title: `${label} copiado`,
                color: "success",
            })
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            addToast({
                title: "Error al copiar",
                color: "danger",
            })
        }
    }

    return (
        <Tooltip content={copied ? "¡Copiado!" : `Copiar ${label}`}>
            <Button
                isIconOnly
                size="sm"
                variant="light"
                className="min-w-6 w-6 h-6"
                onPress={handleCopy as any}
            >
                {copied ? (
                    <Check size={12} className="text-success" />
                ) : (
                    <Copy size={12} className="text-default-400" />
                )}
            </Button>
        </Tooltip>
    )
}

export function MasterContractDetailModal({
    isOpen,
    contract,
    onClose,
}: {
    isOpen: boolean
    contract: MasterContract | null
    onClose: () => void
}) {
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

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(parseFloat(amount))
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
            size="2xl"
            scrollBehavior="inside"
            classNames={{
                base: "bg-content1",
                header: "border-b border-divider",
                footer: "border-t border-divider",
            }}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <FileText size={20} className="text-primary" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-semibold text-foreground">
                                    Contrato {contract.number}
                                </span>
                                <Chip
                                    color={isExecution ? "default" : getStateColor(contract.state)}
                                    variant="flat"
                                    size="sm"
                                    className={isExecution ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400" : ""}
                                >
                                    {contract.state}
                                </Chip>
                            </div>
                            <span className="text-small font-normal text-default-400">
                                Detalle del contrato marco
                            </span>
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody className="gap-5 py-5">
                    {/* Objeto del Contrato */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <FileText size={16} className="text-default-500" />
                            <span className="text-small font-semibold text-foreground uppercase tracking-wide">
                                Objeto del Contrato
                            </span>
                        </div>
                        <Card className="bg-default-50 dark:bg-default-100/50">
                            <CardBody className="py-3 px-4">
                                <p className="text-small text-default-700 text-justify whitespace-pre-line leading-relaxed">
                                    {contract.object}
                                </p>
                            </CardBody>
                        </Card>
                    </div>

                    <Divider />

                    {/* Información Financiera */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <DollarSign size={16} className="text-success" />
                            <span className="text-small font-semibold text-foreground uppercase tracking-wide">
                                Información Financiera
                            </span>
                        </div>
                        <Card className="bg-success-50/50 dark:bg-success-900/20 border-success-200 dark:border-success-800">
                            <CardBody className="py-4 px-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-tiny text-success-600 dark:text-success-400 uppercase tracking-wide">
                                            Valor Total del Contrato
                                        </span>
                                        <p className="text-2xl font-bold text-success-700 dark:text-success-300 mt-1">
                                            {formatCurrency(contract.totalValue)}
                                        </p>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-success-100 dark:bg-success-900/50 flex items-center justify-center">
                                        <DollarSign size={24} className="text-success-600 dark:text-success-400" />
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    <Divider />

                    {/* Fechas */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-primary" />
                            <span className="text-small font-semibold text-foreground uppercase tracking-wide">
                                Vigencia del Contrato
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Card className="bg-default-50 dark:bg-default-100/50">
                                <CardBody className="py-3 px-4">
                                    <span className="text-tiny text-default-500 uppercase tracking-wide">
                                        Fecha de Inicio
                                    </span>
                                    <p className="text-medium font-medium text-foreground mt-1">
                                        {formatDate(contract.startDate)}
                                    </p>
                                </CardBody>
                            </Card>
                            <Card className="bg-default-50 dark:bg-default-100/50">
                                <CardBody className="py-3 px-4">
                                    <span className="text-tiny text-default-500 uppercase tracking-wide">
                                        Fecha de Finalización
                                    </span>
                                    <p className="text-medium font-medium text-foreground mt-1">
                                        {formatDate(contract.endDate)}
                                    </p>
                                </CardBody>
                            </Card>
                        </div>
                    </div>

                    <Divider />

                    {/* Contratista */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-secondary" />
                            <span className="text-small font-semibold text-foreground uppercase tracking-wide">
                                Información del Contratista
                            </span>
                        </div>
                        <Card className="bg-default-50 dark:bg-default-100/50">
                            <CardBody className="py-4 px-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                                        <Building2 size={24} className="text-secondary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-medium font-semibold text-foreground truncate">
                                            {contract.contractor.name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-tiny text-default-500">NIT:</span>
                                            <span className="text-small text-default-600 font-mono">
                                                {contract.contractor.nit}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    <Divider />

                    {/* Vinculaciones */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Link2 size={16} className="text-warning" />
                            <span className="text-small font-semibold text-foreground uppercase tracking-wide">
                                Vinculaciones
                            </span>
                        </div>
                        <Card className="bg-warning-50/50 dark:bg-warning-900/20">
                            <CardBody className="py-3 px-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-tiny text-warning-600 dark:text-warning-400 uppercase tracking-wide">
                                            Código de Necesidad
                                        </span>
                                        <p className="text-medium font-semibold text-warning-700 dark:text-warning-300 mt-1 font-mono">
                                            {contract.need.code}
                                        </p>
                                    </div>
                                    <Chip color="warning" variant="flat" size="sm">
                                        Vinculado
                                    </Chip>
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    <Divider />

                    {/* Metadatos de creación/actualización */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-default-500" />
                            <span className="text-small font-semibold text-foreground uppercase tracking-wide">
                                Información del Registro
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0">
                                    <Clock size={14} className="text-default-500" />
                                </div>
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Fecha de Creación
                                    </span>
                                    <p className="text-small text-default-600 mt-0.5">
                                        {formatDateTime(contract.createAt)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0">
                                    <Clock size={14} className="text-default-500" />
                                </div>
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Última Actualización
                                    </span>
                                    <p className="text-small text-default-600 mt-0.5">
                                        {formatDateTime(contract.updateAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalBody>

                <ModalFooter className="justify-between items-center">
                    <div className="flex items-center gap-2 text-tiny text-default-400">
                        <Hash size={14} />
                        <span>ID: {contract.id}</span>
                        <CopyButton text={contract.id} label="ID del contrato" />
                    </div>
                    <Button variant="flat" onPress={onClose}>
                        Cerrar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
