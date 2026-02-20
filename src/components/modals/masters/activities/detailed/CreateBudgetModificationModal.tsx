"use client"

import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Button,
    Input,
    Select,
    SelectItem,
    Autocomplete,
    AutocompleteItem,
    Textarea,
    DatePicker,
    DateValue,
} from "@heroui/react"
import { getLocalTimeZone, today } from "@internationalized/date"
import { ArrowLeftRight } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { get } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Rubric } from "@/types/activity"

export type BudgetModificationType = "ADDITION" | "REDUCTION" | "TRANSFER"

export type CreateBudgetModificationPayload = {
    modificationType: BudgetModificationType
    detailedActivityId: string
    value?: number
    description: string
    legalDocument?: string
    dateIssue?: string
    newRubricId?: string
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
    detailedActivityId: string
    detailedActivityName: string
    onClose: () => void
    onSave: (data: CreateBudgetModificationPayload) => void
}

export function CreateBudgetModificationModal({
    isOpen,
    isLoading = false,
    detailedActivityId,
    detailedActivityName,
    onClose,
    onSave,
}: Readonly<Props>) {
    const [modificationType, setModificationType] = useState<BudgetModificationType | "">("")
    const [value, setValue] = useState("")
    const [description, setDescription] = useState("")
    const [legalDocument, setLegalDocument] = useState("")
    const [rubricId, setRubricId] = useState("")
    const [dateIssue, setDateIssue] = useState<DateValue>(today(getLocalTimeZone()))

    // Rubrics for Transfer
    const [rubrics, setRubrics] = useState<Rubric[]>([])
    const [loadingRubrics, setLoadingRubrics] = useState(false)
    const [rubricSearch, setRubricSearch] = useState("")
    const debouncedRubricSearch = useDebounce(rubricSearch, 300)

    useEffect(() => {
        if (isOpen) {
            setModificationType("")
            setValue("")
            setDescription("")
            setLegalDocument("")
            setRubricId("")
            setDateIssue(today(getLocalTimeZone()))
            setRubricSearch("")
        }
    }, [isOpen])

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
        if (modificationType === "TRANSFER") {
            fetchRubrics(debouncedRubricSearch)
        }
    }, [debouncedRubricSearch, fetchRubrics, modificationType])

    const handleSave = () => {
        if (!modificationType) return

        const payload: CreateBudgetModificationPayload = {
            modificationType,
            detailedActivityId,
            description: description.trim(),
        }

        if (modificationType === "TRANSFER") {
            payload.newRubricId = rubricId
        } else {
            payload.value = Number.parseFloat(value) || 0
            payload.legalDocument = legalDocument.trim()
            if (dateIssue) {
                // Formatting DateValue to ISO string
                payload.dateIssue = dateIssue.toDate(getLocalTimeZone()).toISOString()
            }
        }

        onSave(payload)
    }

    const isValid = () => {
        if (!modificationType || !description.trim()) return false

        if (modificationType === "TRANSFER") {
            return !!rubricId
        } else {
            return value !== "" && Number.parseFloat(value) > 0 && !!legalDocument.trim() && !!dateIssue
        }
    }

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
                            <ArrowLeftRight size={18} className="text-primary" />
                        </div>
                        <div>
                            <span className="text-lg font-semibold text-foreground">
                                Modificación Presupuestal
                            </span>
                            <p className="text-tiny text-default-400 font-normal">
                                {detailedActivityName}
                            </p>
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody className="py-5">
                    <div className="flex flex-col gap-5">
                        <Select
                            label="Tipo de Modificación"
                            placeholder="Seleccione el tipo"
                            selectedKeys={modificationType ? [modificationType] : []}
                            onChange={(e) => setModificationType(e.target.value as BudgetModificationType)}
                            isRequired
                        >
                            <SelectItem key="ADDITION">Adición</SelectItem>
                            <SelectItem key="REDUCTION">Reducción</SelectItem>
                            <SelectItem key="TRANSFER">Traslado</SelectItem>
                        </Select>

                        {modificationType && (
                            <>
                                {modificationType === "TRANSFER" ? (
                                    <div className="pt-1">
                                        <Autocomplete
                                            label="Nueva Posición Presupuestal"
                                            placeholder="Busque y seleccione la nueva posición"
                                            isRequired
                                            isLoading={loadingRubrics}
                                            selectedKey={rubricId}
                                            onSelectionChange={(key) => {
                                                setRubricId(key as string || "")
                                                // When selecting, set only the code to avoid search issues on re-open
                                                const selected = rubrics.find(r => r.id === key)
                                                if (selected) {
                                                    setRubricSearch(selected.code)
                                                }
                                            }}
                                            onInputChange={setRubricSearch}
                                            inputValue={rubricSearch}
                                        >
                                            {rubrics.map((rubric) => (
                                                <AutocompleteItem key={rubric.id} textValue={rubric.code}>
                                                    <div className="flex flex-col">
                                                        <span className="text-small font-medium">{rubric.code}</span>
                                                        <span className="text-tiny text-default-400">{rubric.accountName}</span>
                                                    </div>
                                                </AutocompleteItem>
                                            ))}
                                        </Autocomplete>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4">
                                        <Input
                                            label="Valor"
                                            placeholder="0"
                                            value={value ? new Intl.NumberFormat('es-CO').format(Number.parseFloat(value.replaceAll(/[^\d]/g, '')) || 0) : ''}
                                            onValueChange={(val) => {
                                                const numericValue = val.replaceAll(/[^\d]/g, '')
                                                setValue(numericValue)
                                            }}
                                            isRequired
                                            startContent={
                                                <span className="text-default-400 text-small">$</span>
                                            }
                                        />
                                        <Input
                                            label="Documento Legal"
                                            placeholder="Ej: Resolución No. 123"
                                            value={legalDocument}
                                            onValueChange={setLegalDocument}
                                            isRequired
                                        />
                                        <DatePicker
                                            label="Fecha de Emisión"
                                            value={dateIssue}
                                            onChange={(val) => setDateIssue(val || today(getLocalTimeZone()))}
                                            isRequired
                                        />
                                    </div>
                                )}

                                <Textarea
                                    label="Descripción"
                                    placeholder="Justificación de la modificación"
                                    value={description}
                                    onValueChange={setDescription}
                                    isRequired
                                    minRows={3}
                                />
                            </>
                        )}
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
                        isDisabled={!isValid()}
                    >
                        Crear Modificación
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
