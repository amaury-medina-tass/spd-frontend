// src/components/modals/UserModal.tsx
"use client"

import {Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Switch} from "@heroui/react"
import {useEffect, useState} from "react"
import type {User} from "@/types/user"

export function UserModal({
  isOpen,
  title,
  initial,
  onClose,
  onSave,
}: {
  isOpen: boolean
  title: string
  initial: User | null
  onClose: () => void
  onSave: (payload: {email: string; is_active: boolean}) => void
}) {
  const [email, setEmail] = useState("")
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    setEmail(initial?.email ?? "")
    setIsActive(initial?.is_active ?? true)
  }, [initial, isOpen])

  return (
    <Modal isOpen={isOpen} onOpenChange={() => onClose()}>
      <ModalContent>
        <ModalHeader className="font-semibold">{title}</ModalHeader>
        <ModalBody className="gap-3">
          <Input label="Email" value={email} onValueChange={setEmail} />
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
            onPress={() => onSave({email, is_active: isActive})}
            isDisabled={!email.trim()}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}