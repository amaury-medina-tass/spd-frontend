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
import type { UserWithRoles } from "@/types/user"

export function UserRoleModal({
    isOpen,
    user,
    isLoading,
    onClose,
    onSave,
    onUnassign,
}: Readonly<{
    isOpen: boolean
    user: UserWithRoles | null
    isLoading?: boolean
    onClose: () => void
    onSave: (roleId: string) => void
    onUnassign: (roleId: string) => void
}>) {
    const [roleId, setRoleId] = useState("")

    const availableRoles = user?.missingRoles ?? []

    return (
        <Modal isOpen={isOpen} onOpenChange={() => !isLoading && onClose()} size="md" placement="center" isDismissable={!isLoading}>
            <ModalContent>
                <ModalHeader className="font-semibold">Gestionar Rol</ModalHeader>
                <ModalBody>
                    <div className="mb-6 p-4 border border-default-200 rounded-large bg-default-50/50">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <span className="text-tiny font-semibold text-default-400 uppercase tracking-wide">Usuario Seleccionado</span>
                                <div className="flex justify-between items-center bg-content1 p-3 rounded-medium shadow-sm border border-default-100">
                                    <div className="flex flex-col">
                                        <span className="text-small font-bold text-default-900 leading-tight">
                                            {user?.first_name} {user?.last_name}
                                        </span>
                                        <span className="text-tiny text-default-500">{user?.email}</span>
                                    </div>
                                    <div className="flex flex-col items-end border-l border-default-100 pl-4 ml-4">
                                        <span className="text-[10px] text-default-400 font-medium uppercase">Documento</span>
                                        <span className="text-small font-mono text-default-700">{user?.document_number}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <span className="text-tiny font-semibold text-default-400 uppercase tracking-wide">Roles Actuales</span>
                                <div className="flex flex-wrap gap-2">
                                    {user?.roles && user.roles.length > 0 ? (
                                        user.roles.map((role) => (
                                            <Chip
                                                key={role.id}
                                                size="sm"
                                                variant="flat"
                                                color="primary"
                                                onClose={() => onUnassign(role.id)}
                                                isDisabled={isLoading}
                                            >
                                                {role.name}
                                            </Chip>
                                        ))
                                    ) : (
                                        <span className="text-small text-default-400 italic">Sin roles asignados</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Select
                        label="Asignar Nuevo Rol"
                        placeholder="Seleccionar rol para asignar"
                        selectedKeys={roleId ? [roleId] : []}
                        onChange={(e) => setRoleId(e.target.value)}
                        isDisabled={availableRoles.length === 0 || isLoading}
                    >
                        {availableRoles.map((role) => (
                            <SelectItem key={role.id} textValue={role.name}>
                                {role.name}
                            </SelectItem>
                        ))}
                    </Select>
                    {availableRoles.length === 0 && (
                        <p className="text-tiny text-default-400 px-1">
                            El usuario ya tiene todos los roles disponibles asignados.
                        </p>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose} isDisabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button
                        color="primary"
                        onPress={() => {
                            onSave(roleId)
                            setRoleId("")
                        }}
                        isDisabled={!roleId || isLoading}
                        startContent={isLoading ? <Spinner size="sm" color="current" /> : undefined}
                    >
                        Asignar Rol
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
