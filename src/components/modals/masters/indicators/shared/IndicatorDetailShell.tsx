import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Button } from "@heroui/react"
import { Goal } from "lucide-react"

interface IndicatorDetailShellProps {
    isOpen: boolean
    onClose: () => void
    code: string
    subtitle: string
    children: React.ReactNode
}

export function IndicatorDetailShell({ isOpen, onClose, code, subtitle, children }: Readonly<IndicatorDetailShellProps>) {
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
                {() => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-default-100 flex items-center justify-center">
                                    <Goal size={18} className="text-default-600" />
                                </div>
                                <div>
                                    <span className="text-lg font-semibold text-foreground">
                                        Indicador {code}
                                    </span>
                                    <p className="text-tiny text-default-400 font-normal">
                                        {subtitle}
                                    </p>
                                </div>
                            </div>
                        </ModalHeader>

                        <ModalBody className="py-5">
                            <div className="space-y-6">
                                {children}
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
