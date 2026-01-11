// src/components/modals/RoleModal.tsx
"use client"

import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch, Spinner } from "@heroui/react"
import { useEffect, useState } from "react"
import type { Role } from "@/types/role"

export function RoleModal({
  isOpen,
  title,
  initial,
  isLoading = false,
  onClose,
  onSave,
}: {
  isOpen: boolean
  title: string
  initial: Role | null
  isLoading?: boolean
  onClose: () => void
  onSave: (payload: { name: string; description?: string; is_active: boolean }) => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    setName(initial?.name ?? "")
    setDescription(initial?.description ?? "")
    setIsActive(initial?.is_active ?? true)
  }, [initial, isOpen])

  return (
    <Modal isOpen={isOpen} onOpenChange={() => onClose()}>
      <ModalContent>
        <ModalHeader className="font-semibold">{title}</ModalHeader>
        <ModalBody className="gap-3">
          <Input label="Nombre" value={name} onValueChange={setName} isDisabled={isLoading} />
          <Input label="Descripción" value={description} onValueChange={setDescription} isDisabled={isLoading} />
          <Switch isSelected={isActive} onValueChange={setIsActive} isDisabled={isLoading}>
            Activo
          </Switch>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={isLoading}>
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={() => onSave({ name, description, is_active: isActive })}
            isDisabled={!name.trim() || isLoading}
            spinner={<Spinner size="sm" color="white" />}
            isLoading={isLoading}
          >
            Guardar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}