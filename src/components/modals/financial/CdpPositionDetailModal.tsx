"use client"

import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Button,
    Divider,
} from "@heroui/react"
import {
    FileText,
    DollarSign,
    ClipboardList,
    Receipt,
    Hash,
    Briefcase,
    BookOpen,
} from "lucide-react"
import type { CdpPositionDetail } from "@/types/cdp"

export function CdpPositionDetailModal({
    isOpen,
    position,
    onClose,
}: {
    isOpen: boolean
    position: CdpPositionDetail | null
    onClose: () => void
}) {
    if (!position) return null

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount)
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
                            <Receipt size={18} className="text-default-600" />
                        </div>
                        <div>
                            <span className="text-lg font-semibold text-foreground">
                                Posición Presupuestal {position.positionNumber}
                            </span>
                            <p className="text-tiny text-default-400 font-normal">
                                Detalle de la posición CDP
                            </p>
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody className="py-5">
                    <div className="space-y-6">
                        {/* CDP Info Section */}
                        <div>
                            <h3 className="text-sm font-semibold text-default-500 uppercase tracking-wider mb-3">
                                Información del CDP
                            </h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                {/* CDP Number */}
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Hash size={16} className="text-default-500" />
                                    </div>
                                    <div>
                                        <span className="text-tiny text-default-400 uppercase tracking-wide">
                                            Número CDP
                                        </span>
                                        <p className="text-medium font-semibold text-foreground">
                                            {position.cdpNumber}
                                        </p>
                                    </div>
                                </div>

                                {/* CDP Total Value */}
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <DollarSign size={16} className="text-default-500" />
                                    </div>
                                    <div>
                                        <span className="text-tiny text-default-400 uppercase tracking-wide">
                                            Valor Total CDP
                                        </span>
                                        <p className="text-medium font-semibold text-foreground">
                                            {formatCurrency(position.cdpTotalValue)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        {/* Project Info Section */}
                        <div>
                            <h3 className="text-sm font-semibold text-default-500 uppercase tracking-wider mb-3">
                                Información del Proyecto
                            </h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                {/* Project Code */}
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Briefcase size={16} className="text-default-500" />
                                    </div>
                                    <div>
                                        <span className="text-tiny text-default-400 uppercase tracking-wide">
                                            Código Proyecto
                                        </span>
                                        <p className="text-small font-medium text-foreground">
                                            {position.projectCode}
                                        </p>
                                    </div>
                                </div>

                                {/* Rubric Code */}
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <BookOpen size={16} className="text-default-500" />
                                    </div>
                                    <div>
                                        <span className="text-tiny text-default-400 uppercase tracking-wide">
                                            Posición Presupuestal
                                        </span>
                                        <p className="text-small font-medium text-foreground font-mono">
                                            {position.rubricCode}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Divider />

                         {/* Position & Funding Info Section */}
                         <div>
                            <h3 className="text-sm font-semibold text-default-500 uppercase tracking-wider mb-3">
                                Detalle de la Posición y Financiación
                            </h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                 {/* Position Value */}
                                 <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <DollarSign size={16} className="text-default-500" />
                                    </div>
                                    <div>
                                        <span className="text-tiny text-default-400 uppercase tracking-wide">
                                            Valor Posición
                                        </span>
                                        <p className="text-medium font-semibold text-foreground">
                                            {formatCurrency(position.positionValue)}
                                        </p>
                                    </div>
                                </div>

                                {/* Need Code */}
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <ClipboardList size={16} className="text-default-500" />
                                    </div>
                                    <div>
                                        <span className="text-tiny text-default-400 uppercase tracking-wide">
                                            Código Necesidad
                                        </span>
                                        <p className="text-small font-medium text-foreground">
                                            {position.needCode}
                                        </p>
                                    </div>
                                </div>

                                {/* Funding Source Name */}
                                <div className="flex items-start gap-3 col-span-2">
                                    <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <FileText size={16} className="text-default-500" />
                                    </div>
                                    <div>
                                        <span className="text-tiny text-default-400 uppercase tracking-wide">
                                            Origen Presupuesto
                                        </span>
                                        <p className="text-small font-medium text-foreground">
                                            {position.fundingSourceName}
                                        </p>
                                        <p className="text-tiny text-default-400 font-mono mt-1">
                                            Fondo: {position.fundingSourceCode}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        {/* Observations */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-default-500" />
                                <span className="text-small font-medium text-foreground">
                                    Observaciones
                                </span>
                            </div>
                            <p className="text-small text-default-600 leading-relaxed bg-default-50 dark:bg-default-100/50 rounded-lg p-3">
                                {position.observations}
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
