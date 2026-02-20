"use client"

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Tabs,
    Tab,
} from "@heroui/react"
import { Target, CalendarRange } from "lucide-react"
import { IndicativeAnnualGoalsTab } from "./goals/IndicativeAnnualGoalsTab"
import { IndicativeQuadrenniumGoalsTab } from "./goals/IndicativeQuadrenniumGoalsTab"

interface Props {
    isOpen: boolean
    indicatorId: string | null
    indicatorCode?: string
    onClose: () => void
}

export function IndicativePlanIndicatorGoalsModal({ isOpen, indicatorId, indicatorCode, onClose }: Readonly<Props>) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
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
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        <span>Metas del Indicador</span>
                    </div>
                    {indicatorCode && (
                        <p className="text-small text-default-500 font-normal">
                            Asociadas a: {indicatorCode}
                        </p>
                    )}
                </ModalHeader>
                <ModalBody className="py-6 space-y-6">
                    <Tabs aria-label="Opciones de Metas" color="primary" variant="underlined">
                        <Tab
                            key="annual"
                            title={
                                <div className="flex items-center space-x-2">
                                    <Target className="w-4 h-4" />
                                    <span>Metas Anuales</span>
                                </div>
                            }
                        >
                            <IndicativeAnnualGoalsTab indicatorId={indicatorId} />
                        </Tab>
                        <Tab
                            key="quadrennium"
                            title={
                                <div className="flex items-center space-x-2">
                                    <CalendarRange className="w-4 h-4" />
                                    <span>Metas Cuatrenios</span>
                                </div>
                            }
                        >
                            <IndicativeQuadrenniumGoalsTab indicatorId={indicatorId} />
                        </Tab>
                    </Tabs>
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose}>
                        Cerrar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
