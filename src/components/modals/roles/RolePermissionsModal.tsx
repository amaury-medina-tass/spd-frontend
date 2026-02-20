"use client"

import {
    Button,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Spinner,
    Checkbox,
    Accordion,
    AccordionItem,
    Chip,
} from "@heroui/react"
import { useEffect, useState } from "react"
import type { RolePermissionsData, RoleModulePermissions } from "@/types/role"

type PermissionsState = {
    [modulePath: string]: RoleModulePermissions
}

export function RolePermissionsModal({
    isOpen,
    permissionsData,
    isLoading = false,
    onClose,
    onSave,
}: Readonly<{
    isOpen: boolean
    permissionsData: RolePermissionsData | null
    isLoading?: boolean
    onClose: () => void
    onSave: (permissions: PermissionsState) => void
}>) {
    const [permissions, setPermissions] = useState<PermissionsState>({})

    useEffect(() => {
        if (permissionsData?.permissions) {
            setPermissions(permissionsData.permissions)
        }
    }, [permissionsData, isOpen])

    const handlePermissionChange = (modulePath: string, actionId: string, allowed: boolean) => {
        setPermissions((prev) => {
            const updated = { ...prev }
            if (updated[modulePath]) {
                updated[modulePath] = {
                    ...updated[modulePath],
                    actions: updated[modulePath].actions.map((action) =>
                        action.actionId === actionId ? { ...action, allowed } : action
                    ),
                }
            }
            return updated
        })
    }

    const handleModuleToggleAll = (modulePath: string, allowed: boolean) => {
        setPermissions((prev) => {
            const updated = { ...prev }
            if (updated[modulePath]) {
                updated[modulePath] = {
                    ...updated[modulePath],
                    actions: updated[modulePath].actions.map((action) => ({ ...action, allowed })),
                }
            }
            return updated
        })
    }

    const isModuleFullyAllowed = (modulePath: string) => {
        return permissions[modulePath]?.actions.every((action) => action.allowed) ?? false
    }

    const isModulePartiallyAllowed = (modulePath: string) => {
        const actions = permissions[modulePath]?.actions ?? []
        const allowedCount = actions.filter((a) => a.allowed).length
        return allowedCount > 0 && allowedCount < actions.length
    }

    const getModuleAllowedCount = (modulePath: string) => {
        const actions = permissions[modulePath]?.actions ?? []
        return actions.filter((a) => a.allowed).length
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={() => !isLoading && onClose()} size="2xl" scrollBehavior="inside" isDismissable={!isLoading}>
            <ModalContent>
                <ModalHeader className="font-semibold">
                    <div className="flex flex-col gap-1">
                        <span>Gestionar Permisos</span>
                        {permissionsData?.role && (
                            <span className="text-sm font-normal text-default-500">
                                Rol: {permissionsData.role.name}
                            </span>
                        )}
                    </div>
                </ModalHeader>
                <ModalBody className="gap-4">
                    {Object.keys(permissions).length > 0 ? (
                        <Accordion variant="splitted" selectionMode="multiple">
                            {Object.entries(permissions).map(([modulePath, moduleData]) => {
                                const isFullyAllowed = isModuleFullyAllowed(modulePath)
                                const isPartiallyAllowed = isModulePartiallyAllowed(modulePath)
                                const allowedCount = getModuleAllowedCount(modulePath)
                                const totalCount = moduleData.actions.length

                                let chipColor: "success" | "warning" | "default" = "default"
                                if (isFullyAllowed) chipColor = "success"
                                else if (isPartiallyAllowed) chipColor = "warning"

                                return (
                                    <AccordionItem
                                        key={modulePath}
                                        aria-label={moduleData.moduleName}
                                        startContent={
                                            <Checkbox
                                                isSelected={isFullyAllowed}
                                                isIndeterminate={isPartiallyAllowed}
                                                onValueChange={(checked) => handleModuleToggleAll(modulePath, checked)}
                                                isDisabled={isLoading}
                                                size="sm"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        }
                                        title={
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{moduleData.moduleName}</span>
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                    color={chipColor}
                                                >
                                                    {allowedCount}/{totalCount}
                                                </Chip>
                                            </div>
                                        }
                                        subtitle={
                                            <span className="text-[10px] font-mono text-default-400">{modulePath}</span>
                                        }
                                    >
                                        <div className="flex flex-wrap gap-2 pb-2">
                                            {moduleData.actions.map((action) => (
                                                <button
                                                    key={action.actionId}
                                                    type="button"
                                                    onClick={() => !isLoading && handlePermissionChange(modulePath, action.actionId, !action.allowed)}
                                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all bg-transparent ${action.allowed
                                                        ? "border-primary bg-primary/10 hover:bg-primary/20"
                                                        : "border-default-200 bg-default-50 hover:bg-default-100"
                                                        }`}
                                                >
                                                    <Checkbox
                                                        isSelected={action.allowed}
                                                        onValueChange={(checked) => handlePermissionChange(modulePath, action.actionId, checked)}
                                                        isDisabled={isLoading}
                                                        size="sm"
                                                        className="pointer-events-none"
                                                    />
                                                    <span className="text-sm font-medium">{action.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </AccordionItem>
                                )
                            })}
                        </Accordion>
                    ) : (
                        <div className="text-center py-8 text-default-400">
                            <p>No hay módulos con permisos configurados para este rol.</p>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose} isDisabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button
                        color="primary"
                        onPress={() => onSave(permissions)}
                        isDisabled={isLoading}
                        spinner={<Spinner size="sm" color="white" />}
                        isLoading={isLoading}
                    >
                        Guardar Permisos
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
