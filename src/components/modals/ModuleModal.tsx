// src/components/modals/ModuleModal.tsx
"use client"

import {Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@heroui/react"
import {useEffect, useState} from "react"
import type {Module} from "@/types/module"

export function ModuleModal({
  isOpen,
  title,
  initial,
  onClose,
  onSave,
}: {
  isOpen: boolean
  title: string
  initial: Module | null
  onClose: () => void
  onSave: (payload: {name: string; description?: string; path: string}) => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [path, setPath] = useState("")

  useEffect(() => {
    setName(initial?.name ?? "")
    setDescription(initial?.description ?? "")
    setPath(initial?.path ?? "")
  }, [initial, isOpen])

  return (
    <Modal isOpen={isOpen} onOpenChange={() => onClose()}>
      <ModalContent>
        <ModalHeader className="font-semibold">{title}</ModalHeader>
        <ModalBody className="gap-3">
          <Input label="Name" value={name} onValueChange={setName} />
          <Input label="Description" value={description} onValueChange={setDescription} />
          <Input label="Path" value={path} onValueChange={setPath} placeholder="/masters" />
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
          <Button
            color="primary"
            onPress={() => onSave({name, description, path})}
            isDisabled={!name.trim() || !path.trim()}
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}