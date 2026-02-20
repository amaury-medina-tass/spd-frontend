"use client"

import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Button,
    Input,
    Textarea,
    Autocomplete,
    AutocompleteItem,
    DatePicker,
} from "@heroui/react"
import { today, getLocalTimeZone } from "@internationalized/date"
import { Plus } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { get } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import type { RelatedProject, Rubric } from "@/types/activity"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

export type CreateDetailedActivityPayload = {
    code: string
    name: string
    observations: string
    activityDate: string
    budgetCeiling: number
    balance: number
    cpc: string
    projectId: string
    rubricId: string
}

type ProjectSelectResponse = {
    data: RelatedProject[]
    meta: {
        total: number
        limit: number
        offset: number
        hasMore: boolean
    }
}

type RubricSelectResponse = {
    data: Rubric[]
    meta: {
        total: number
        limit: number
        offset: number
        hasMore: boolean
    }
}

type Props = {
    isOpen: boolean
    isLoading?: boolean
    onClose: () => void
    onSave: (data: CreateDetailedActivityPayload) => void
}

const schema = z.object({
    code: z.string().min(1, "Requerido"),
    cpc: z.string().min(1, "Requerido"),
    name: z.string().min(1, "Requerido"),
    observations: z.string().optional(),
    activityDate: z.any().refine((val) => val !== null, "Fecha requerida"),
    budgetCeiling: z.string().min(1, "Requerido"), // Handling as string for easier currency input masking
    projectId: z.string().min(1, "Seleccione proyecto"),
    rubricId: z.string().min(1, "Seleccione rubro"),
})

type FormValues = z.infer<typeof schema>

export function CreateDetailedActivityModal({
    isOpen,
    isLoading = false,
    onClose,
    onSave,
}: Readonly<Props>) {
    const { control, handleSubmit, reset, formState: { errors, isValid } } = useForm<FormValues>({
        resolver: zodResolver(schema) as any,
        defaultValues: {
            code: "",
            cpc: "",
            name: "",
            observations: "",
            activityDate: null,
            budgetCeiling: "",
            projectId: "",
            rubricId: ""
        },
        mode: "onChange"
    })

    // Projects state
    const [projects, setProjects] = useState<RelatedProject[]>([])
    const [loadingProjects, setLoadingProjects] = useState(false)
    const [projectSearch, setProjectSearch] = useState("")
    const debouncedProjectSearch = useDebounce(projectSearch, 300)

    // Rubrics state
    const [rubrics, setRubrics] = useState<Rubric[]>([])
    const [loadingRubrics, setLoadingRubrics] = useState(false)
    const [rubricSearch, setRubricSearch] = useState("")
    const debouncedRubricSearch = useDebounce(rubricSearch, 300)

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            reset({
                code: "",
                cpc: "",
                name: "",
                observations: "",
                activityDate: today(getLocalTimeZone()),
                budgetCeiling: "",
                projectId: "",
                rubricId: ""
            })
            setProjectSearch("")
            setRubricSearch("")
        }
    }, [isOpen, reset])

    const fetchProjects = useCallback(async (search: string = "") => {
        setLoadingProjects(true)
        try {
            const params = new URLSearchParams({
                limit: "20",
                search: search
            })
            const result = await get<ProjectSelectResponse>(`${endpoints.financial.projectsSelect}?${params.toString()}`)
            setProjects(result.data)
        } catch (e) {
            console.error("Error fetching projects:", e)
        } finally {
            setLoadingProjects(false)
        }
    }, [])

    useEffect(() => {
        if (isOpen) {
            fetchProjects(debouncedProjectSearch)
        }
    }, [debouncedProjectSearch, fetchProjects, isOpen])

    const fetchRubrics = useCallback(async (search: string = "") => {
        setLoadingRubrics(true)
        try {
            const params = new URLSearchParams({
                limit: "20",
                search: search
            })
            const result = await get<RubricSelectResponse>(`${endpoints.masters.rubricsSelect}?${params.toString()}`)
            setRubrics(result.data)
        } catch (e) {
            console.error("Error fetching rubrics:", e)
        } finally {
            setLoadingRubrics(false)
        }
    }, [])

    useEffect(() => {
        if (isOpen) {
            fetchRubrics(debouncedRubricSearch)
        }
    }, [debouncedRubricSearch, fetchRubrics, isOpen])

    const onSubmit = (data: FormValues) => {
        const value = Number.parseFloat(data.budgetCeiling.replaceAll(/[^\d]/g, '')) || 0
        const payload: CreateDetailedActivityPayload = {
            code: data.code.trim(),
            name: data.name.trim(),
            observations: data.observations?.trim() || "",
            activityDate: data.activityDate ? data.activityDate.toDate(getLocalTimeZone()).toISOString() : new Date().toISOString(),
            budgetCeiling: value,
            balance: value,
            cpc: data.cpc.trim(),
            projectId: data.projectId,
            rubricId: data.rubricId,
        }
        onSave(payload)
    }

    const handleClose = () => {
        reset()
        onClose()
    }

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={() => handleClose()}
            size="2xl"
            scrollBehavior="inside"
            classNames={{
                base: "bg-content1",
                header: "border-b border-divider",
                footer: "border-t border-divider",
            }}
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Plus size={18} className="text-primary" />
                        </div>
                        <div>
                            <span className="text-lg font-semibold text-foreground">
                                Nueva Actividad Detallada
                            </span>
                            <p className="text-tiny text-default-400 font-normal">
                                Crear una nueva actividad detallada
                            </p>
                        </div>
                    </div>
                </ModalHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <ModalBody className="py-5">
                        <div className="flex flex-col gap-5">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Código */}
                                <Controller
                                    name="code"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Código"
                                            placeholder="Ej: ACT-001"
                                            isRequired
                                            labelPlacement="outside"
                                            isInvalid={!!errors.code}
                                            errorMessage={errors.code?.message}
                                        />
                                    )}
                                />

                                {/* CPC */}
                                <Controller
                                    name="cpc"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="CPC"
                                            placeholder="Ingrese el CPC"
                                            isRequired
                                            labelPlacement="outside"
                                            isInvalid={!!errors.cpc}
                                            errorMessage={errors.cpc?.message}
                                        />
                                    )}
                                />

                                {/* Fecha */}
                                <div className="col-span-2 md:col-span-1">
                                    <Controller
                                        name="activityDate"
                                        control={control}
                                        render={({ field }) => (
                                            <DatePicker
                                                label="Fecha de Actividad"
                                                value={field.value}
                                                onChange={field.onChange}
                                                isRequired
                                                labelPlacement="outside"
                                                isInvalid={!!errors.activityDate}
                                                errorMessage={errors.activityDate?.message as string}
                                            />
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="pt-1">
                                {/* Nombre */}
                                <Controller
                                    name="name"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Nombre"
                                            placeholder="Ingrese el nombre de la actividad"
                                            isRequired
                                            labelPlacement="outside"
                                            isInvalid={!!errors.name}
                                            errorMessage={errors.name?.message}
                                        />
                                    )}
                                />
                            </div>

                            <div className="pt-1">
                                {/* Proyecto */}
                                <Controller
                                    name="projectId"
                                    control={control}
                                    render={({ field }) => (
                                        <Autocomplete
                                            label="Proyecto"
                                            placeholder="Seleccione un proyecto"
                                            labelPlacement="outside"
                                            isRequired
                                            isLoading={loadingProjects}
                                            selectedKey={field.value}
                                            onSelectionChange={(key) => {
                                                const k = String(key)
                                                field.onChange(k)
                                                const selected = projects.find(p => p.id === k)
                                                if (selected) {
                                                    setProjectSearch(selected.code)
                                                }
                                            }}
                                            onInputChange={setProjectSearch}
                                            inputValue={projectSearch}
                                            isInvalid={!!errors.projectId}
                                            errorMessage={errors.projectId?.message}
                                        >
                                            {projects.map((project) => (
                                                <AutocompleteItem key={project.id} textValue={`${project.code} - ${project.name}`}>
                                                    <div className="flex flex-col">
                                                        <span className="text-small font-medium">{project.code}</span>
                                                        <span className="text-tiny text-default-400">{project.name}</span>
                                                    </div>
                                                </AutocompleteItem>
                                            ))}
                                        </Autocomplete>
                                    )}
                                />
                            </div>

                            <div className="pt-1">
                                {/* Posición Presupuestal */}
                                <Controller
                                    name="rubricId"
                                    control={control}
                                    render={({ field }) => (
                                        <Autocomplete
                                            label="Posición Presupuestal"
                                            placeholder="Seleccione una posición presupuestal"
                                            labelPlacement="outside"
                                            isRequired
                                            isLoading={loadingRubrics}
                                            selectedKey={field.value}
                                            onSelectionChange={(key) => {
                                                const k = String(key)
                                                field.onChange(k)
                                                const selected = rubrics.find(r => r.id === k)
                                                if (selected) {
                                                    setRubricSearch(selected.code)
                                                }
                                            }}
                                            onInputChange={setRubricSearch}
                                            inputValue={rubricSearch}
                                            isInvalid={!!errors.rubricId}
                                            errorMessage={errors.rubricId?.message}
                                        >
                                            {rubrics.map((rubric) => (
                                                <AutocompleteItem key={rubric.id} textValue={`${rubric.code} - ${rubric.accountName}`}>
                                                    <div className="flex flex-col">
                                                        <span className="text-small font-medium">{rubric.code}</span>
                                                        <span className="text-tiny text-default-400">{rubric.accountName}</span>
                                                    </div>
                                                </AutocompleteItem>
                                            ))}
                                        </Autocomplete>
                                    )}
                                />
                            </div>

                            <div className="pt-1">
                                {/* Valor */}
                                <Controller
                                    name="budgetCeiling"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            {...field}
                                            label="Valor"
                                            placeholder="0"
                                            value={field.value ? new Intl.NumberFormat('es-CO').format(Number.parseFloat(field.value.replaceAll(/[^\d]/g, '')) || 0) : ''}
                                            onValueChange={(val) => {
                                                const numericValue = val.replaceAll(/[^\d]/g, '')
                                                field.onChange(numericValue)
                                            }}
                                            isRequired
                                            labelPlacement="outside"
                                            startContent={
                                                <span className="text-default-400 text-small">$</span>
                                            }
                                            isInvalid={!!errors.budgetCeiling}
                                            errorMessage={errors.budgetCeiling?.message}
                                        />
                                    )}
                                />
                            </div>

                            <div className="pt-1">
                                {/* Observaciones */}
                                <Controller
                                    name="observations"
                                    control={control}
                                    render={({ field }) => (
                                        <Textarea
                                            {...field}
                                            label="Observaciones"
                                            placeholder="Ingrese las observaciones (opcional)"
                                            labelPlacement="outside"
                                            minRows={3}
                                            value={field.value || ""}
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="flat" onPress={handleClose}>
                            Cancelar
                        </Button>
                        <Button
                            color="primary"
                            type="submit"
                            isLoading={isLoading}
                            isDisabled={!isValid || isLoading}
                        >
                            Crear
                        </Button>
                    </ModalFooter>
                </form>
            </ModalContent>
        </Modal>
    )
}
