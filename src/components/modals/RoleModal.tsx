// src/components/modals/RoleModal.tsx
"use client"

import {Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch} from "@heroui/react"
import {useEffect, useState} from "react"
import type {Role} from "@/types/role"

export function RoleModal({
  isOpen,
  title,
  initial,
  onClose,
  onSave,
}: {
  isOpen: boolean
  title: string
  initial: Role | null
  onClose: () => void
  onSave: (payload: {name: string; description?: string; is_active: boolean}) => void
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
          <Input label="Name" value={name} onValueChange={setName} />
          <Input label="Description" value={description} onValueChange={setDescription} />
          <Switch isSelected={isActive} onValueChange={setIsActive}>
            Active
          </Switch>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={() => onSave({name, description, is_active: isActive})}
            isDisabled={!name.trim()}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}