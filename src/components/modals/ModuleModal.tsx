"use client"

import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem } from "@heroui/react"
import { useEffect, useState } from "react"
import type { Module } from "@/types/module"
import { getAvailableRoutes } from "@/config/navigation"

export function ModuleModal({
  isOpen,
  title,
  initial,
  isLoading = false,
  onClose,
  onSave,
}: {
  isOpen: boolean
  title: string
  initial: Module | null
  isLoading?: boolean
  onClose: () => void
  onSave: (payload: { name: string; description?: string; path: string }) => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [path, setPath] = useState("")

  const availableRoutes = getAvailableRoutes()

  useEffect(() => {
    setName(initial?.name ?? "")
    setDescription(initial?.description ?? "")
    setPath(initial?.path ?? "")
  }, [initial, isOpen])

  const handleSave = () => {
    onSave({ name, description: description || undefined, path })
  }

  const handleRouteSelect = (selectedPath: string) => {
    setPath(selectedPath)
    // Auto-fill name based on selected route if name is empty
    const route = availableRoutes.find(r => r.path === selectedPath)
    if (route && !name.trim()) {
      setName(route.label)
    }
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={() => onClose()}>
      <ModalContent>
        <ModalHeader className="font-semibold">{title}</ModalHeader>
        <ModalBody className="gap-3">
          <Input
            label="Nombre"
            value={name}
            onValueChange={setName}
            isDisabled={isLoading}
          />
          <Input
            label="Descripción"
            value={description}
            onValueChange={setDescription}
            isDisabled={isLoading}
          />
          <Select
            label="Ruta"
            placeholder="Seleccionar ruta del módulo"
            selectedKeys={path ? [path] : []}
            onChange={(e) => handleRouteSelect(e.target.value)}
            isDisabled={isLoading}
          >
            {availableRoutes.map((route) => (
              <SelectItem key={route.path} textValue={`${route.label} (${route.path})`}>
                <div className="flex flex-col">
                  <span className="text-small font-medium">{route.label}</span>
                  <span className="text-tiny text-default-400 font-mono">{route.path}</span>
                </div>
              </SelectItem>
            ))}
          </Select>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={isLoading}>
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={handleSave}
            isDisabled={!name.trim() || !path.trim() || isLoading}
            isLoading={isLoading}
          >
            Guardar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}