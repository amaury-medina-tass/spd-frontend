"use client"

import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Button,
    Divider,
    Input,
    Textarea,
} from "@heroui/react"
import {
    FileText,
    DollarSign,
    Clock,
    Calendar,
    FolderKanban,
    Hash,
    FileBarChart,
    Wallet,
} from "lucide-react"
import { useState, useEffect } from "react"
import type { FullDetailedActivity } from "@/types/activity"

type Props = {
    isOpen: boolean
    activity: FullDetailedActivity | null
    isLoading?: boolean
    mode: "view" | "edit"
    onClose: () => void
    onSave?: (data: { name: string; observations: string }) => void
}

export function DetailedActivityModal({
    isOpen,
    activity,
    isLoading = false,
    mode,
    onClose,
    onSave,
}: Props) {
    const [name, setName] = useState("")
    const [observations, setObservations] = useState("")

    useEffect(() => {
        if (activity) {
            setName(activity.name)
            setObservations(activity.observations || "")
        }
    }, [activity])

    if (!activity) return null

    const formatCurrency = (amount: string) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(parseFloat(amount))
    }

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const handleSave = () => {
        if (onSave) {
            onSave({ name, observations })
        }
    }

    const isViewMode = mode === "view"
    const title = isViewMode ? `Actividad ${activity.code}` : `Editar Actividad ${activity.code}`

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
                        <div className="w-9 h-9 rounded-lg bg-default-100 flex items-center justify-center">
                            <FileBarChart size={18} className="text-default-600" />
                        </div>
                        <div>
                            <span className="text-lg font-semibold text-foreground">
                                {title}
                            </span>
                            <p className="text-tiny text-default-400 font-normal">
                                {isViewMode ? "Detalle de la actividad" : "Modificar información de la actividad"}
                            </p>
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody className="py-5">
                    <div className="space-y-6">
                        {/* Información Básica */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            {/* Nombre */}
                            <div className="col-span-2">
                                {isViewMode ? (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <FileText size={16} className="text-default-500" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                Nombre
                                            </span>
                                            <p className="text-small font-medium text-foreground">
                                                {activity.name}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <Input
                                        label="Nombre"
                                        placeholder="Ingrese el nombre de la actividad"
                                        value={name}
                                        onValueChange={setName}
                                        isRequired
                                        labelPlacement="outside"
                                    />
                                )}
                            </div>

                            {/* CPC */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Hash size={16} className="text-default-500" />
                                </div>
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        CPC
                                    </span>
                                    <p className="text-small font-medium text-foreground">
                                        {activity.cpc}
                                    </p>
                                </div>
                            </div>

                            {/* Proyecto */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <FolderKanban size={16} className="text-default-500" />
                                </div>
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Proyecto
                                    </span>
                                    <p className="text-small font-medium text-foreground">
                                        {activity.project.code} - {activity.project.name}
                                    </p>
                                </div>
                            </div>

                            {/* Posición Presupuestal */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Wallet size={16} className="text-default-500" />
                                </div>
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Pos. Presupuestal
                                    </span>
                                    <p className="text-small font-medium text-foreground">
                                        {activity.rubric?.code} - {activity.rubric?.accountName}
                                    </p>
                                </div>
                            </div>

                            {/* Observaciones */}
                            <div className="col-span-2">
                                {isViewMode ? (
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <FileText size={16} className="text-default-500" />
                                        </div>
                                        <div className="flex-1">
                                            <span className="text-tiny text-default-400 uppercase tracking-wide">
                                                Observaciones
                                            </span>
                                            <p className="text-small text-foreground">
                                                {activity.observations || "Sin observaciones"}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <Textarea
                                        label="Observaciones"
                                        placeholder="Ingrese las observaciones"
                                        value={observations}
                                        onValueChange={setObservations}
                                        labelPlacement="outside"
                                        minRows={3}
                                    />
                                )}
                            </div>
                        </div>

                        <Divider />

                        {/* Información Financiera */}
                        <div>
                            <h3 className="text-small font-semibold text-default-500 uppercase mb-4 flex items-center gap-2">
                                <DollarSign size={16} />
                                Información Financiera
                            </h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                {/* Techo Presupuestal */}
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Techo Presupuestal
                                    </span>
                                    <p className="text-medium font-semibold text-foreground">
                                        {formatCurrency(activity.budgetCeiling)}
                                    </p>
                                </div>

                                {/* Saldo */}
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide text-primary">
                                        Saldo Disponible
                                    </span>
                                    <p className="text-medium font-bold text-primary">
                                        {formatCurrency(activity.balance)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Divider />

                        {/* Fechas */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            {/* Fecha de Creación */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Calendar size={16} className="text-default-500" />
                                </div>
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Creación
                                    </span>
                                    <p className="text-small text-foreground">
                                        {formatDateTime(activity.createAt)}
                                    </p>
                                </div>
                            </div>

                            {/* Última Actualización */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Clock size={16} className="text-default-500" />
                                </div>
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Actualización
                                    </span>
                                    <p className="text-small text-foreground">
                                        {formatDateTime(activity.updateAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </ModalBody>

                <ModalFooter>
                    {isViewMode ? (
                        <Button variant="flat" onPress={onClose}>
                            Cerrar
                        </Button>
                    ) : (
                        <>
                            <Button variant="flat" onPress={onClose}>
                                Cancelar
                            </Button>
                            <Button
                                color="primary"
                                onPress={handleSave}
                                isLoading={isLoading}
                                isDisabled={!name.trim()}
                            >
                                Guardar
                            </Button>
                        </>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
