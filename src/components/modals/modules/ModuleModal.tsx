"use client"

import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem } from "@heroui/react"
import { useEffect } from "react"
import type { Module } from "@/types/module"
import { getAvailableRoutes } from "@/config/navigation"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const schema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  path: z.string().min(1, "La ruta es requerida"),
})

type FormValues = z.infer<typeof schema>

export function ModuleModal({
  isOpen,
  title,
  initial,
  isLoading = false,
  onClose,
  onSave,
}: Readonly<{
  isOpen: boolean
  title: string
  initial: Module | null
  isLoading?: boolean
  onClose: () => void
  onSave: (payload: { name: string; description?: string; path: string }) => void
}>) {
  const { control, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      path: ""
    }
  })

  // Watch name to check if it's empty for auto-fill logic
  const currentName = watch("name")

  const availableRoutes = getAvailableRoutes()

  useEffect(() => {
    if (isOpen) {
      reset({
        name: initial?.name ?? "",
        description: initial?.description ?? "",
        path: initial?.path ?? ""
      })
    }
  }, [initial, isOpen, reset])

  const onSubmit = (data: FormValues) => {
    onSave({
      name: data.name,
      description: data.description || undefined,
      path: data.path
    })
  }

  const handleRouteSelect = (selectedPath: string) => {
    setValue("path", selectedPath)
    // Auto-fill name based on selected route if name is empty
    const route = availableRoutes.find(r => r.path === selectedPath)
    if (route && !currentName.trim()) {
      setValue("name", route.label)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={() => handleClose()}>
      <ModalContent>
        <ModalHeader className="font-semibold">{title}</ModalHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody className="gap-3">
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Nombre"
                  isDisabled={isLoading}
                  isInvalid={!!errors.name}
                  errorMessage={errors.name?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Descripción"
                  isDisabled={isLoading}
                />
              )}
            />
            <Controller
              name="path"
              control={control}
              render={({ field }) => (
                <Select
                  label="Ruta"
                  placeholder="Seleccionar ruta del módulo"
                  selectedKeys={field.value ? [field.value] : []}
                  onChange={(e) => handleRouteSelect(e.target.value)}
                  isDisabled={isLoading}
                  isInvalid={!!errors.path}
                  errorMessage={errors.path?.message}
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
              )}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={handleClose} isDisabled={isLoading}>
              Cancelar
            </Button>
            <Button
              color="primary"
              type="submit"
              isDisabled={isLoading}
              isLoading={isLoading}
            >
              Guardar
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
