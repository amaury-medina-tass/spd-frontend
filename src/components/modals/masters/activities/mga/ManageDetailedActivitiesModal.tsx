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
import { AssociatedDetailedActivitiesTab } from "./tabs/AssociatedDetailedActivitiesTab"
import { AvailableDetailedActivitiesTab } from "./tabs/AvailableDetailedActivitiesTab"

type Props = {
    isOpen: boolean
    mgaActivityId: string | null
    mgaActivityCode?: string
    onClose: () => void
    onSuccess?: () => void
}

export function ManageDetailedActivitiesModal({
    isOpen,
    mgaActivityId,
    mgaActivityCode,
    onClose,
    onSuccess,
}: Props) {
    const handleClose = () => {
        onSuccess?.()
        onClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={() => handleClose()}
            size="4xl"
            scrollBehavior="inside"
            classNames={{
                base: "bg-content1",
                header: "border-b border-divider",
                footer: "border-t border-divider",
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
                            {mgaActivityCode && (
                                <p className="text-tiny text-default-400 font-normal">
                                    {mgaActivityCode}
                                </p>
                            )}
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody className="py-4">
                    <Tabs
                        variant="underlined"
                        classNames={{
                            tabList: "gap-6",
                            cursor: "w-full bg-primary",
                        }}
                    >
                        <Tab key="associated" title="Asociadas">
                            <div className="pt-4">
                                <AssociatedDetailedActivitiesTab mgaActivityId={mgaActivityId} />
                            </div>
                        </Tab>

                        <Tab key="available" title="Disponibles">
                            <div className="pt-4">
                                <AvailableDetailedActivitiesTab mgaActivityId={mgaActivityId} />
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
