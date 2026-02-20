"use client"

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Select,
    SelectItem,
} from "@heroui/react"
import { useState, useEffect } from "react"
import { get } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import type { ProjectSelectItem } from "@/types/financial"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

export type CreatePoaiPpaPayload = {
    projectId: string
    projectCode: string
    year: number
    projectedPoai: number
    assignedPoai: number
}

type Props = {
    isOpen: boolean
    isLoading: boolean
    onClose: () => void
    onSave: (data: CreatePoaiPpaPayload) => Promise<void>
}

const schema = z.object({
    projectId: z.string().min(1, "Seleccione un proyecto"),
    projectCode: z.string(),
    year: z.coerce.number().min(2000, "Año inválido"),
    projectedPoai: z.coerce.number().min(0, "Debe ser mayor o igual a 0"),
    assignedPoai: z.coerce.number().min(0, "Debe ser mayor o igual a 0")
})

type FormValues = z.infer<typeof schema>

export function CreatePoaiPpaModal({ isOpen, isLoading, onClose, onSave }: Readonly<Props>) {
    const [projects, setProjects] = useState<ProjectSelectItem[]>([])
    const [loadingProjects, setLoadingProjects] = useState(false)

    // Generate year options (last 10 years + next 10 years)
    const currentYear = new Date().getFullYear()
    const yearOptions = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i)

    const { control, handleSubmit, reset, setValue, formState: { errors, isValid } } = useForm<FormValues>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            projectId: "",
            projectCode: "",
            year: currentYear,
            projectedPoai: 0,
            assignedPoai: 0
        },
        mode: "onChange"
    })

    useEffect(() => {
        if (isOpen) {
            setLoadingProjects(true)
            get<{ data: ProjectSelectItem[] }>(`${endpoints.financial.projectsSelect}?limit=100`)
                .then((result) => setProjects(result.data))
                .catch((e) => console.error("Error loading projects", e))
                .finally(() => setLoadingProjects(false))

            reset({
                projectId: "",
                projectCode: "",
                year: currentYear,
                projectedPoai: 0,
                assignedPoai: 0
            })
        }
    }, [isOpen, reset, currentYear])

    const handleProjectChange = (keys: any) => {
        const selectedId = Array.from(keys)[0]?.toString() || ""
        setValue("projectId", selectedId, { shouldValidate: true })

        const project = projects.find((p) => p.id === selectedId)
        if (project) {
            setValue("projectCode", project.code)
        }
    }

    const onSubmit = async (data: FormValues) => {
        await onSave({
            projectId: data.projectId,
            projectCode: data.projectCode,
            year: data.year,
            projectedPoai: data.projectedPoai,
            assignedPoai: data.assignedPoai,
        })
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="lg">
            <ModalContent>
                <ModalHeader>Crear Registro POAI PPA</ModalHeader>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <ModalBody className="gap-4">
                        <Controller
                            name="projectId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    label="Proyecto"
                                    placeholder="Seleccionar proyecto"
                                    isRequired
                                    isLoading={loadingProjects}
                                    selectedKeys={field.value ? [field.value] : []}
                                    onSelectionChange={handleProjectChange}
                                    isInvalid={!!errors.projectId}
                                    errorMessage={errors.projectId?.message}
                                >
                                    {projects.map((project) => (
                                        <SelectItem key={project.id}>
                                            {`${project.code} - ${project.name}`}
                                        </SelectItem>
                                    ))}
                                </Select>
                            )}
                        />

                        <Controller
                            name="year"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    label="Año"
                                    placeholder="Seleccionar año"
                                    isRequired
                                    selectedKeys={field.value ? [field.value.toString()] : []}
                                    onSelectionChange={(keys) => {
                                        const val = Array.from(keys)[0]?.toString()
                                        if (val) setValue("year", Number.parseInt(val), { shouldValidate: true })
                                    }}
                                    isInvalid={!!errors.year}
                                    errorMessage={errors.year?.message}
                                >
                                    {yearOptions.map((y) => (
                                        <SelectItem key={y.toString()}>{y.toString()}</SelectItem>
                                    ))}
                                </Select>
                            )}
                        />

                        <Controller
                            name="projectedPoai"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    value={field.value.toString()}
                                    label="POAI Proyectado"
                                    placeholder="0"
                                    type="number"
                                    isRequired
                                    startContent={
                                        <div className="pointer-events-none flex items-center">
                                            <span className="text-default-400 text-small">$</span>
                                        </div>
                                    }
                                    isInvalid={!!errors.projectedPoai}
                                    errorMessage={errors.projectedPoai?.message}
                                />
                            )}
                        />

                        <Controller
                            name="assignedPoai"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    value={field.value.toString()}
                                    label="POAI Asignado"
                                    placeholder="0"
                                    type="number"
                                    isRequired
                                    startContent={
                                        <div className="pointer-events-none flex items-center">
                                            <span className="text-default-400 text-small">$</span>
                                        </div>
                                    }
                                    isInvalid={!!errors.assignedPoai}
                                    errorMessage={errors.assignedPoai?.message}
                                />
                            )}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" onPress={handleClose} isDisabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button
                            color="primary"
                            type="submit"
                            isDisabled={!isValid || isLoading}
                            isLoading={isLoading}
                        >
                            Crear
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    )
}
