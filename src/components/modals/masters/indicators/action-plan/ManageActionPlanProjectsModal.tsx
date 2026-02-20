"use client"

import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Button,
    Tabs,
    Tab,
} from "@heroui/react"
import { Link2, FolderKanban, CheckCircle2 } from "lucide-react"
import { AssociatedProjectsTab } from "./projects/AssociatedProjectsTab"
import { AvailableProjectsTab } from "./projects/AvailableProjectsTab"

type Props = {
    isOpen: boolean
    indicatorId: string | null
    indicatorCode?: string
    onClose: () => void
}

export function ManageActionPlanProjectsModal({
    isOpen,
    indicatorId,
    indicatorCode,
    onClose,
}: Readonly<Props>) {
    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onClose}
            size="5xl"
            scrollBehavior="inside"
            placement="center"
            classNames={{
                base: "bg-content1 mx-4 my-4 sm:mx-auto max-h-[90vh]",
                header: "border-b border-divider",
                footer: "border-t border-divider",
                body: "p-0",
            }}
        >
            <ModalContent>
                <ModalHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center">
                            <Link2 size={16} className="text-default-500" />
                        </div>
                        <div>
                            <span className="text-base font-semibold">Gestionar Proyectos</span>
                            {indicatorCode && (
                                <p className="text-tiny text-default-400 font-normal">
                                    Indicador: {indicatorCode}
                                </p>
                            )}
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody className="px-4 sm:px-6 py-4">
                    <Tabs
                        aria-label="Proyectos"
                        variant="underlined"
                        classNames={{
                            tabList: "gap-6",
                            cursor: "w-full bg-primary",
                        }}
                    >
                        <Tab
                            key="associated"
                            title={
                                <div className="flex items-center space-x-2">
                                    <CheckCircle2 size={16} />
                                    <span>Asociados</span>
                                </div>
                            }
                        >
                            <div className="pt-4">
                                <AssociatedProjectsTab indicatorId={indicatorId} />
                            </div>
                        </Tab>

                        <Tab
                            key="available"
                            title={
                                <div className="flex items-center space-x-2">
                                    <FolderKanban size={16} />
                                    <span>Disponibles</span>
                                </div>
                            }
                        >
                            <div className="pt-4">
                                <AvailableProjectsTab indicatorId={indicatorId} />
                            </div>
                        </Tab>
                    </Tabs>
                </ModalBody>

                <ModalFooter>
                    <Button variant="flat" size="sm" onPress={onClose}>
                        Cerrar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
