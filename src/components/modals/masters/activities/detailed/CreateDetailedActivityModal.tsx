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
    DateValue,
} from "@heroui/react"
import { today, getLocalTimeZone } from "@internationalized/date"
import { FileBarChart, Plus } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { get } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import type { RelatedProject, Rubric } from "@/types/activity"

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

export function CreateDetailedActivityModal({
    isOpen,
    isLoading = false,
    onClose,
    onSave,
}: Props) {
    // Form state
    const [code, setCode] = useState("")
    const [name, setName] = useState("")
    const [observations, setObservations] = useState("")
    const [budgetCeiling, setBudgetCeiling] = useState("")
    const [cpc, setCpc] = useState("")
    const [projectId, setProjectId] = useState("")
    const [rubricId, setRubricId] = useState("")
    const [date, setDate] = useState<DateValue | null>(null)

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

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setCode("")
            setName("")
            setObservations("")
            setBudgetCeiling("")
            setCpc("")
            setProjectId("")
            setRubricId("")
            setProjectSearch("")
            setProjectSearch("")
            setRubricSearch("")
            setDate(today(getLocalTimeZone()))
        }
    }, [isOpen])

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

    const handleSave = () => {
        const value = parseFloat(budgetCeiling) || 0
        const payload: CreateDetailedActivityPayload = {
            code: code.trim(),
            name: name.trim(),
            observations: observations.trim(),
            activityDate: date ? date.toDate(getLocalTimeZone()).toISOString() : new Date().toISOString(),
            budgetCeiling: value,
            balance: value,
            cpc: cpc.trim(),
            projectId,
            rubricId,
        }
        onSave(payload)
    }

    const isValid =
        code.trim() !== "" &&
        name.trim() !== "" &&
        budgetCeiling !== "" &&
        cpc.trim() !== "" &&
        projectId !== "" &&
        cpc.trim() !== "" &&
        projectId !== "" &&
        rubricId !== "" &&
        date !== null

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={() => onClose()}
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

                <ModalBody className="py-5">
                    <div className="flex flex-col gap-5">
                        <div className="grid grid-cols-2 gap-4">
                            {/* Código */}
                            <Input
                                label="Código"
                                placeholder="Ej: ACT-001"
                                value={code}
                                onValueChange={setCode}
                                isRequired
                                labelPlacement="outside"
                            />

                            {/* CPC */}
                            <Input
                                label="CPC"
                                placeholder="Ingrese el CPC"
                                value={cpc}
                                onValueChange={setCpc}
                                isRequired
                                labelPlacement="outside"
                            />

                            {/* Fecha */}
                            <div className="col-span-2 md:col-span-1">
                                <DatePicker
                                    label="Fecha de Actividad"
                                    value={date}
                                    onChange={setDate}
                                    isRequired
                                    labelPlacement="outside"
                                />
                            </div>
                        </div>

                        <div className="pt-1">
                            {/* Nombre */}
                            <Input
                                label="Nombre"
                                placeholder="Ingrese el nombre de la actividad"
                                value={name}
                                onValueChange={setName}
                                isRequired
                                labelPlacement="outside"
                            />
                        </div>

                        <div className="pt-1">
                            {/* Proyecto */}
                            <Autocomplete
                                label="Proyecto"
                                placeholder="Seleccione un proyecto"
                                labelPlacement="outside"
                                isRequired
                                isLoading={loadingProjects}
                                selectedKey={projectId}
                                onSelectionChange={(key) => {
                                    const k = String(key)
                                    setProjectId(k)
                                    const selected = projects.find(p => p.id === k)
                                    if (selected) {
                                        setProjectSearch(selected.code)
                                    }
                                }}
                                onInputChange={setProjectSearch}
                                inputValue={projectSearch}
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
                        </div>

                        <div className="pt-1">
                            {/* Posición Presupuestal */}
                            <Autocomplete
                                label="Posición Presupuestal"
                                placeholder="Seleccione una posición presupuestal"
                                labelPlacement="outside"
                                isRequired
                                isLoading={loadingRubrics}
                                selectedKey={rubricId}
                                onSelectionChange={(key) => {
                                    const k = String(key)
                                    setRubricId(k)
                                    const selected = rubrics.find(r => r.id === k)
                                    if (selected) {
                                        setRubricSearch(selected.code)
                                    }
                                }}
                                onInputChange={setRubricSearch}
                                inputValue={rubricSearch}
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
                        </div>

                        <div className="pt-1">
                            {/* Valor */}
                            <Input
                                label="Valor"
                                placeholder="0"
                                value={budgetCeiling ? new Intl.NumberFormat('es-CO').format(parseFloat(budgetCeiling.replace(/[^\d]/g, '')) || 0) : ''}
                                onValueChange={(val) => {
                                    const numericValue = val.replace(/[^\d]/g, '')
                                    setBudgetCeiling(numericValue)
                                }}
                                isRequired
                                labelPlacement="outside"
                                startContent={
                                    <span className="text-default-400 text-small">$</span>
                                }
                            />
                        </div>

                        <div className="pt-1">
                            {/* Observaciones */}
                            <Textarea
                                label="Observaciones"
                                placeholder="Ingrese las observaciones (opcional)"
                                value={observations}
                                onValueChange={setObservations}
                                labelPlacement="outside"
                                minRows={3}
                            />
                        </div>
                    </div>
                </ModalBody>

                <ModalFooter>
                    <Button variant="flat" onPress={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        color="primary"
                        onPress={handleSave}
                        isLoading={isLoading}
                        isDisabled={!isValid}
                    >
                        Crear
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
