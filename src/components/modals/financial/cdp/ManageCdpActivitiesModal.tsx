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
import { Link2 } from "lucide-react"
import { AssociatedCdpActivitiesTab } from "./activities/AssociatedCdpActivitiesTab"
import { AvailableCdpActivitiesTab } from "./activities/AvailableCdpActivitiesTab"

type Props = {
    isOpen: boolean
    positionId: string | null
    positionNumber?: string
    onClose: () => void
    onSuccess?: () => void
}

export function ManageCdpActivitiesModal({
    isOpen,
    positionId,
    positionNumber,
    onClose,
    onSuccess,
}: Readonly<Props>) {
    const handleClose = () => {
        onSuccess?.()
        onClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={() => handleClose()}
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
                            <span className="text-base font-semibold">Gestionar Actividades Detalladas</span>
                            {positionNumber && (
                                <p className="text-tiny text-default-400 font-normal">
                                    Posición #{positionNumber}
                                </p>
                            )}
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody className="px-4 sm:px-6 py-4">
                    <Tabs
                        variant="underlined"
                        classNames={{
                            tabList: "gap-6",
                            cursor: "w-full bg-primary",
                        }}
                    >
                        <Tab key="associated" title="Asociadas">
                            <div className="pt-4">
                                <AssociatedCdpActivitiesTab positionId={positionId} />
                            </div>
                        </Tab>

                        <Tab key="available" title="Disponibles">
                            <div className="pt-4">
                                <AvailableCdpActivitiesTab positionId={positionId} />
                            </div>
                        </Tab>
                    </Tabs>
                </ModalBody>

                <ModalFooter>
                    <Button variant="flat" size="sm" onPress={handleClose}>
                        Cerrar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
