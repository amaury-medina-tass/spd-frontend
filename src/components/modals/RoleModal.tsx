// src/components/modals/RoleModal.tsx
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
  Checkbox,
  Accordion,
  AccordionItem,
  Chip,
} from "@heroui/react"
import { useEffect, useState } from "react"
import type { Role, RolePermissions } from "@/types/role"

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
  onSave: (payload: { name: string; description?: string; is_active: boolean; permissions?: RolePermissions }) => void
}) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [permissions, setPermissions] = useState<RolePermissions>({})

  useEffect(() => {
    setName(initial?.name ?? "")
    setDescription(initial?.description ?? "")
    setIsActive(initial?.is_active ?? true)
    setPermissions(initial?.permissions ?? {})
  }, [initial, isOpen])

  const handlePermissionChange = (modulePath: string, actionCode: string, allowed: boolean) => {
    setPermissions((prev) => {
      const updated = { ...prev }
      if (updated[modulePath]) {
        updated[modulePath] = {
          ...updated[modulePath],
          actions: updated[modulePath].actions.map((action) =>
            action.code === actionCode ? { ...action, allowed } : action
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

  const isEditing = !!initial

  return (
    <Modal isOpen={isOpen} onOpenChange={() => onClose()} size="2xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="font-semibold">{title}</ModalHeader>
        <ModalBody className="gap-5">
          {/* Basic Info Section */}
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

          {/* Status Section */}
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

          {/* Permissions Section */}
          {isEditing && Object.keys(permissions).length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-default-600">Permisos</p>
              <Accordion
                variant="splitted"
                selectionMode="multiple"
              >
                {Object.entries(permissions).map(([modulePath, moduleData]) => {
                  const isFullyAllowed = isModuleFullyAllowed(modulePath)
                  const isPartiallyAllowed = isModulePartiallyAllowed(modulePath)
                  const allowedCount = getModuleAllowedCount(modulePath)
                  const totalCount = moduleData.actions.length

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
                            color={isFullyAllowed ? "success" : isPartiallyAllowed ? "warning" : "default"}
                          >
                            {allowedCount}/{totalCount}
                          </Chip>
                        </div>
                      }
                    >
                      <div className="flex flex-wrap gap-2 pb-2">
                        {moduleData.actions.map((action) => (
                          <div
                            key={action.code}
                            onClick={() => !isLoading && handlePermissionChange(modulePath, action.code, !action.allowed)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 cursor-pointer transition-all ${action.allowed
                                ? "border-primary bg-primary/10 hover:bg-primary/20"
                                : "border-default-200 bg-default-50 hover:bg-default-100"
                              }`}
                          >
                            <Checkbox
                              isSelected={action.allowed}
                              onValueChange={(checked) => handlePermissionChange(modulePath, action.code, checked)}
                              isDisabled={isLoading}
                              size="sm"
                              className="pointer-events-none"
                            />
                            <span className="text-sm font-medium">{action.name}</span>
                          </div>
                        ))}
                      </div>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={isLoading}>
            Cancelar
          </Button>
          <Button
            color="primary"
            onPress={() => onSave({ name, description, is_active: isActive, permissions })}
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