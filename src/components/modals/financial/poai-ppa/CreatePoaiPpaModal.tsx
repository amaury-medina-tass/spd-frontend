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
    Spinner,
} from "@heroui/react"
import { useState, useEffect } from "react"
import { get } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import type { ProjectSelectItem } from "@/types/financial"

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

export function CreatePoaiPpaModal({ isOpen, isLoading, onClose, onSave }: Props) {
    const [projectId, setProjectId] = useState("")
    const [projectCode, setProjectCode] = useState("")
    const [year, setYear] = useState("")
    const [projectedPoai, setProjectedPoai] = useState("")
    const [assignedPoai, setAssignedPoai] = useState("")
    const [projects, setProjects] = useState<ProjectSelectItem[]>([])
    const [loadingProjects, setLoadingProjects] = useState(false)

    // Generate year options (last 10 years + next 10 years)
    const currentYear = new Date().getFullYear()
    const yearOptions = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i)

    useEffect(() => {
        if (isOpen) {
            setLoadingProjects(true)
            get<{ data: ProjectSelectItem[] }>(`${endpoints.financial.projectsSelect}?limit=100`)
                .then((result) => setProjects(result.data))
                .catch((e) => console.error("Error loading projects", e))
                .finally(() => setLoadingProjects(false))
        }
    }, [isOpen])

    const handleProjectChange = (keys: any) => {
        const selectedId = Array.from(keys)[0]?.toString() || ""
        setProjectId(selectedId)
        const project = projects.find((p) => p.id === selectedId)
        if (project) {
            setProjectCode(project.code)
        }
    }

    const handleSave = async () => {
        if (!projectId || !year || !projectedPoai || !assignedPoai) return

        await onSave({
            projectId,
            projectCode,
            year: parseInt(year),
            projectedPoai: parseFloat(projectedPoai),
            assignedPoai: parseFloat(assignedPoai),
        })
    }

    const handleClose = () => {
        setProjectId("")
        setProjectCode("")
        setYear("")
        setProjectedPoai("")
        setAssignedPoai("")
        onClose()
    }

    const isFormValid = projectId && year && projectedPoai && assignedPoai

    return (
        <Modal isOpen={isOpen} onClose={handleClose} size="lg">
            <ModalContent>
                <ModalHeader>Crear Registro POAI PPA</ModalHeader>
                <ModalBody className="gap-4">
                    <Select
                        label="Proyecto"
                        placeholder="Seleccionar proyecto"
                        isRequired
                        isLoading={loadingProjects}
                        selectedKeys={projectId ? [projectId] : []}
                        onSelectionChange={handleProjectChange}
                    >
                        {projects.map((project) => (
                            <SelectItem key={project.id}>
                                {`${project.code} - ${project.name}`}
                            </SelectItem>
                        ))}
                    </Select>

                    <Select
                        label="Año"
                        placeholder="Seleccionar año"
                        isRequired
                        selectedKeys={year ? [year] : []}
                        onSelectionChange={(keys) => setYear(Array.from(keys)[0]?.toString() || "")}
                    >
                        {yearOptions.map((y) => (
                            <SelectItem key={y.toString()}>{y.toString()}</SelectItem>
                        ))}
                    </Select>

                    <Input
                        label="POAI Proyectado"
                        placeholder="0"
                        type="number"
                        isRequired
                        value={projectedPoai}
                        onValueChange={setProjectedPoai}
                        startContent={
                            <div className="pointer-events-none flex items-center">
                                <span className="text-default-400 text-small">$</span>
                            </div>
                        }
                    />

                    <Input
                        label="POAI Asignado"
                        placeholder="0"
                        type="number"
                        isRequired
                        value={assignedPoai}
                        onValueChange={setAssignedPoai}
                        startContent={
                            <div className="pointer-events-none flex items-center">
                                <span className="text-default-400 text-small">$</span>
                            </div>
                        }
                    />
                </ModalBody>
                <ModalFooter>
                    <Button variant="flat" onPress={handleClose} isDisabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button
                        color="primary"
                        onPress={handleSave}
                        isDisabled={!isFormValid || isLoading}
                        isLoading={isLoading}
                    >
                        Crear
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
