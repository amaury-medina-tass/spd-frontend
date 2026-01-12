"use client"

import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Select,
    SelectItem,
    Chip,
    Spinner,
} from "@heroui/react"
import { useState } from "react"
import type { ModuleWithActions } from "@/types/module"

export function ModuleActionsModal({
    isOpen,
    module,
    isLoading,
    onClose,
    onAssign,
    onUnassign,
}: {
    isOpen: boolean
    module: ModuleWithActions | null
    isLoading?: boolean
    onClose: () => void
    onAssign: (actionId: string) => void
    onUnassign: (actionId: string) => void
}) {
    const [actionId, setActionId] = useState("")

    const availableActions = module?.missingActions ?? []

    return (
        <Modal isOpen={isOpen} onOpenChange={() => !isLoading && onClose()} size="lg" placement="center" isDismissable={!isLoading}>
            <ModalContent>
                <ModalHeader className="font-semibold">Gestionar Acciones del Módulo</ModalHeader>
                <ModalBody>
                    <div className="mb-6 p-4 border border-default-200 rounded-large bg-default-50/50">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <span className="text-tiny font-semibold text-default-400 uppercase tracking-wide">Módulo Seleccionado</span>
                                <div className="bg-content1 p-3 rounded-medium shadow-sm border border-default-100">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-small font-bold text-default-900 leading-tight">
                                            {module?.name}
                                        </span>
                                        <span className="text-tiny text-default-500">{module?.description}</span>
                                        <span className="text-[10px] font-mono text-default-400">{module?.path}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-tiny font-semibold text-default-400 uppercase tracking-wide">Acciones Asociadas</span>
                                <div className="flex flex-wrap gap-2">
                                    {module?.actions && module.actions.length > 0 ? (
                                        module.actions.map((action) => (
                                            <Chip
                                                key={action.id}
                                                size="sm"
                                                variant="flat"
                                                color="primary"
                                                onClose={() => onUnassign(action.id)}
                                                isDisabled={isLoading}
                                            >
                                                {action.name}
                                            </Chip>
                                        ))
                                    ) : (
                                        <span className="text-small text-default-400 italic">Sin acciones asociadas</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Select
                        label="Asociar Nueva Acción"
                        placeholder="Seleccionar acción para asociar"
                        selectedKeys={actionId ? [actionId] : []}
                        onChange={(e) => setActionId(e.target.value)}
                        isDisabled={availableActions.length === 0 || isLoading}
                    >
                        {availableActions.map((action) => (
                            <SelectItem key={action.id} textValue={action.name}>
                                {action.name}
                            </SelectItem>
                        ))}
                    </Select>
                    {availableActions.length === 0 && (
                        <p className="text-tiny text-default-400 px-1">
                            El módulo ya tiene todas las acciones disponibles asociadas.
                        </p>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose} isDisabled={isLoading}>
                        Cerrar
                    </Button>
                    <Button
                        color="primary"
                        onPress={() => {
                            onAssign(actionId)
                            setActionId("")
                        }}
                        isDisabled={!actionId || isLoading}
                        startContent={isLoading ? <Spinner size="sm" color="current" /> : undefined}
                    >
                        Asociar Acción
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
