import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Button, Divider } from "@heroui/react"
import { Indicator } from "@/types/masters/indicators"
import { Goal, FileText, Scale, TrendingUp, Layers, FolderKanban, Component } from "lucide-react"

interface IndicatorDetailModalProps {
    isOpen: boolean
    onClose: () => void
    indicator: Indicator | null
}

export function IndicatorDetailModal({ isOpen, onClose, indicator }: IndicatorDetailModalProps) {
    if (!indicator) return null

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
                {(close) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-default-100 flex items-center justify-center">
                                    <Goal size={18} className="text-default-600" />
                                </div>
                                <div>
                                    <span className="text-lg font-semibold text-foreground">
                                        Indicador {indicator.code}
                                    </span>
                                    <p className="text-tiny text-default-400 font-normal">
                                        {indicator.indicatorType?.name || "Detalle del indicador"}
                                    </p>
                                </div>
                            </div>
                        </ModalHeader>

                        <ModalBody className="py-5">
                            <div className="space-y-6">
                                {/* Información Básica */}
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    {/* Nombre */}
                                    <div className="col-span-2">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Goal size={16} className="text-default-500" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                    Nombre
                                                </span>
                                                <p className="text-small font-medium text-foreground">
                                                    {indicator.name}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Descripción */}
                                    <div className="col-span-2">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <FileText size={16} className="text-default-500" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                    Descripción
                                                </span>
                                                <p className="text-small text-foreground">
                                                    {indicator.description || "Sin descripción"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Observaciones */}
                                    <div className="col-span-2">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <FileText size={16} className="text-default-500" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                    Observaciones
                                                </span>
                                                <p className="text-small text-foreground">
                                                    {indicator.observations || "Sin observaciones"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Divider />

                                {/* Medición */}
                                <div>
                                    <h3 className="text-small font-semibold text-default-500 uppercase mb-4 flex items-center gap-2">
                                        <Scale size={16} />
                                        Medición
                                    </h3>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                        {/* Unidad de Medida */}
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Scale size={16} className="text-default-500" />
                                            </div>
                                            <div>
                                                <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                    Unidad
                                                </span>
                                                <p className="text-small font-medium text-foreground">
                                                    {indicator.unitMeasure?.name || "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Sentido */}
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <TrendingUp size={16} className="text-default-500" />
                                            </div>
                                            <div>
                                                <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                    Sentido
                                                </span>
                                                <p className="text-small font-medium text-foreground">
                                                    {indicator.direction?.name || "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Línea Base */}
                                        <div>
                                            <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                Línea Base
                                            </span>
                                            <p className="text-medium font-semibold text-foreground">
                                                {indicator.baseline}
                                            </p>
                                        </div>

                                        {/* Avance */}
                                        <div>
                                            <span className="text-tiny text-default-400 uppercase tracking-wide text-primary">
                                                Avance Actual
                                            </span>
                                            <p className="text-medium font-bold text-primary">
                                                {indicator.advancePercentage}%
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Divider />

                                {/* Alineación Estratégica */}
                                <div>
                                    <h3 className="text-small font-semibold text-default-500 uppercase mb-4 flex items-center gap-2">
                                        <Layers size={16} />
                                        Alineación Estratégica
                                    </h3>
                                    <div className="grid grid-cols-1 gap-y-4">
                                        {/* Pilar */}
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Layers size={16} className="text-default-500" />
                                            </div>
                                            <div>
                                                <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                    Pilar
                                                </span>
                                                <p className="text-small font-medium text-foreground">
                                                    {indicator.pillarCode} - {indicator.pillarName}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Componente */}
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Component size={16} className="text-default-500" />
                                            </div>
                                            <div>
                                                <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                    Componente
                                                </span>
                                                <p className="text-small font-medium text-foreground">
                                                    {indicator.componentCode} - {indicator.componentName}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Programa */}
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <FolderKanban size={16} className="text-default-500" />
                                            </div>
                                            <div>
                                                <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                    Programa
                                                </span>
                                                <p className="text-small font-medium text-foreground">
                                                    {indicator.programCode} - {indicator.programName}
                                                </p>
                                            </div>
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
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
