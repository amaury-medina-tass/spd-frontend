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
    Clock,
    BookOpen,
    ClipboardList,
    Calendar,
    Building2,
    Activity,
    Wallet
} from "lucide-react"
import type { Project } from "@/types/financial"

export function ProjectDetailModal({
    isOpen,
    project,
    onClose,
}: Readonly<{
    isOpen: boolean
    project: Project | null
    onClose: () => void
}>) {
    if (!project) return null

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getStatusColor = (state: boolean): "success" | "danger" => {
        return state ? "success" : "danger"
    }

    const getStatusText = (state: boolean): string => {
        return state ? "Activo" : "Inactivo"
    }

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
                <ModalHeader className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-default-100 flex items-center justify-center">
                            <ClipboardList size={18} className="text-default-600" />
                        </div>
                        <div>
                            <span className="text-lg font-semibold text-foreground">
                                Proyecto {project.code}
                            </span>
                            <p className="text-tiny text-default-400 font-normal">
                                Detalle del proyecto
                            </p>
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody className="py-5">
                    <div className="space-y-6">
                        {/* Información General */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            {/* Nombre */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <FileText size={16} className="text-default-500" />
                                </div>
                                <div className="flex-1">
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Nombre del Proyecto
                                    </span>
                                    <p className="text-small font-medium text-foreground">
                                        {project.name}
                                    </p>
                                </div>
                            </div>

                            {/* Origen */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Building2 size={16} className="text-default-500" />
                                </div>
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Origen
                                    </span>
                                    <p className="text-small font-medium text-foreground">
                                        {project.origin}
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
                                            color={getStatusColor(project.state)}
                                            variant="flat"
                                            size="sm"
                                        >
                                            {getStatusText(project.state)}
                                        </Chip>
                                    </div>
                                </div>
                            </div>

                            {/* Dependencia */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <BookOpen size={16} className="text-default-500" />
                                </div>
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Dependencia
                                    </span>
                                    <p className="text-small font-medium text-foreground">
                                        {project.dependency.code} - {project.dependency.name}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        {/* Información Financiera */}
                        <div>
                            <h3 className="text-small font-semibold text-default-500 uppercase mb-4 flex items-center gap-2">
                                <Wallet size={16} />
                                Información Financiera
                            </h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                {/* Presupuesto Inicial */}
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Presupuesto Inicial
                                    </span>
                                    <p className="text-medium font-semibold text-foreground">
                                        {formatCurrency(project.initialBudget)}
                                    </p>
                                </div>

                                {/* Presupuesto Actual */}
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide text-primary">
                                        Presupuesto Actual
                                    </span>
                                    <p className="text-medium font-bold text-primary">
                                        {formatCurrency(project.currentBudget)}
                                    </p>
                                </div>

                                {/* Ejecución */}
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Ejecución
                                    </span>
                                    <p className="text-small font-medium text-foreground">
                                        {formatCurrency(project.execution)}
                                    </p>
                                </div>

                                {/* Compromiso */}
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Compromiso
                                    </span>
                                    <p className="text-small font-medium text-foreground">
                                        {formatCurrency(project.commitment)}
                                    </p>
                                </div>

                                {/* Pagos */}
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Pagos
                                    </span>
                                    <p className="text-small font-medium text-foreground">
                                        {formatCurrency(project.payments)}
                                    </p>
                                </div>

                                {/* Facturado */}
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Facturado
                                    </span>
                                    <p className="text-small font-medium text-foreground">
                                        {formatCurrency(project.invoiced)}
                                    </p>
                                </div>

                                {/* Porcentaje de Ejecución */}
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        % Ejecución
                                    </span>
                                    <p className="text-small font-medium text-foreground">
                                        {new Intl.NumberFormat("en-US", {
                                            style: "percent",
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 2,
                                        }).format(project.financialExecutionPercentage)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        {/* Fechas */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
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
                                        {formatDateTime(project.createAt)}
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
                                        {formatDateTime(project.updateAt)}
                                    </p>
                                </div>
                            </div>
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
