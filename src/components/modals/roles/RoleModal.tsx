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
import { useEffect } from "react"
import type { Role } from "@/types/role"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const schema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  is_active: z.boolean(),
})

type FormValues = z.infer<typeof schema>

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
  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      is_active: true
    }
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        name: initial?.name ?? "",
        description: initial?.description ?? "",
        is_active: initial?.is_active ?? true
      })
    }
  }, [initial, isOpen, reset])

  const onSubmit = (data: FormValues) => {
    onSave({
      name: data.name,
      description: data.description,
      is_active: data.is_active
    })
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onOpenChange={() => handleClose()} size="md">
      <ModalContent>
        <ModalHeader className="font-semibold">{title}</ModalHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalBody className="gap-5">
            <div className="space-y-4">
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
                  <Textarea
                    {...field}
                    label="Descripción"
                    isDisabled={isLoading}
                    minRows={2}
                    maxRows={4}
                  />
                )}
              />
            </div>

            <Controller
              name="is_active"
              control={control}
              render={({ field: { value, onChange, ...field } }) => (
                <div className="flex justify-between items-center px-4 py-2 rounded-xl border-2 border-default-100 hover:border-default-200 transition-colors h-14">
                  <span className="text-small text-default-600">{value ? "Rol Activo" : "Rol Inactivo"}</span>
                  <Switch
                    {...field}
                    isSelected={value}
                    onValueChange={onChange}
                    color="success"
                    size="sm"
                    isDisabled={isLoading}
                    aria-label="Estado del rol"
                  />
                </div>
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
              spinner={<Spinner size="sm" color="white" />}
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
