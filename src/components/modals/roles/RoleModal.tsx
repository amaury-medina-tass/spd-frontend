"use client"

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Switch,
  Textarea,
} from "@heroui/react"
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
    <Modal isOpen={isOpen} onOpenChange={() => onClose()} size="md">
      <ModalContent>
        <ModalHeader className="font-semibold">{title}</ModalHeader>
        <ModalBody className="gap-5">
          <div className="space-y-4">
            <Input label="Nombre" value={name} onValueChange={setName} isDisabled={isLoading} />
            <Textarea
              label="Descripción"
              value={description}
              onValueChange={setDescription}
              isDisabled={isLoading}
              minRows={2}
              maxRows={4}
            />
          </div>

          <div className="flex justify-between items-center px-4 py-2 rounded-xl border-2 border-default-100 hover:border-default-200 transition-colors h-14">
            <span className="text-small text-default-600">{isActive ? "Rol Activo" : "Rol Inactivo"}</span>
            <Switch
              isSelected={isActive}
              onValueChange={setIsActive}
              color="success"
              size="sm"
              isDisabled={isLoading}
              aria-label="Estado del rol"
            />
          </div>
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