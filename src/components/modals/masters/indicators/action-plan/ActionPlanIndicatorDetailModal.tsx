import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Button, Divider } from "@heroui/react"
import { ActionPlanIndicator } from "@/types/masters/indicators"
import { Goal, FileText, Scale, TrendingUp, Hash, Calendar, PieChart } from "lucide-react"

interface ActionPlanIndicatorDetailModalProps {
    isOpen: boolean
    onClose: () => void
    indicator: ActionPlanIndicator | null
}

export function ActionPlanIndicatorDetailModal({ isOpen, onClose, indicator }: ActionPlanIndicatorDetailModalProps) {
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
                                        Cód. Estadístico: {indicator.statisticalCode}
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

                                    {/* Secuencia */}
                                    <div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Hash size={16} className="text-default-500" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                    No. Secuencia
                                                </span>
                                                <p className="text-small font-medium text-foreground">
                                                    {indicator.sequenceNumber}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Unidad de Medida */}
                                    <div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Scale size={16} className="text-default-500" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                    Unidad
                                                </span>
                                                <p className="text-small font-medium text-foreground">
                                                    {indicator.unitMeasure?.name || "N/A"}
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

                                {/* Metas y Ejecución */}
                                <div>
                                    <h3 className="text-small font-semibold text-default-500 uppercase mb-4 flex items-center gap-2">
                                        <TrendingUp size={16} />
                                        Metas y Ejecución
                                    </h3>
                                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                        {/* Cantidad Planeada */}
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Goal size={16} className="text-default-500" />
                                            </div>
                                            <div>
                                                <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                    Meta Planeada
                                                </span>
                                                <p className="text-small font-medium text-foreground">
                                                    {indicator.plannedQuantity}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Corte de Ejecución */}
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Calendar size={16} className="text-default-500" />
                                            </div>
                                            <div>
                                                <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                    Corte Ejecución
                                                </span>
                                                <p className="text-small font-medium text-foreground">
                                                    {indicator.executionCut}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Cumplimiento */}
                                        <div>
                                            <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                Cumplimiento
                                            </span>
                                            <p className={`text-medium font-bold ${Number(indicator.compliancePercentage) >= 100 ? "text-success" : "text-warning"}`}>
                                                {indicator.compliancePercentage}%
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
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
