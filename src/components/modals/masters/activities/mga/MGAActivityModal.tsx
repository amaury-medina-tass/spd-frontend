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
    Clock,
    Calendar,
    FolderKanban,
    Package,
    Activity,
    ListTodo,
    Pencil,
    Eye,
} from "lucide-react"
import { useEffect, useState } from "react"
import type { MGAActivity } from "@/types/activity"
import { patch } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { addToast } from "@heroui/toast"

type Props = {
    isOpen: boolean
    activity: MGAActivity | null
    onClose: () => void
    onSuccess?: () => void
    initialEditMode?: boolean
}

export function MGAActivityModal({
    isOpen,
    activity,
    onClose,
    onSuccess,
    initialEditMode = false,
}: Props) {
    const [isEditMode, setIsEditMode] = useState(false)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        observations: "",
    })

    // Reset form when activity changes
    useEffect(() => {
        if (activity) {
            setFormData({
                name: activity.name || "",
                observations: activity.observations || "",
            })
            setIsEditMode(initialEditMode)
        }
    }, [activity, initialEditMode])

    if (!activity) return null

    const formatDateTime = (dateStr: string) => {
        if (!dateStr) return "N/A"
        return new Date(dateStr).toLocaleString("es-CO", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await patch(`${endpoints.masters.mgaActivities}/${activity.id}`, {
                name: formData.name,
                observations: formData.observations || null,
            })
            addToast({ title: "Actividad MGA actualizada", color: "success" })
            setIsEditMode(false)
            onSuccess?.()
        } catch (e: any) {
            addToast({ title: "Error al actualizar", description: e.message, color: "danger" })
        } finally {
            setSaving(false)
        }
    }

    const handleClose = () => {
        setIsEditMode(false)
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
                        <div className="w-9 h-9 rounded-lg bg-default-100 flex items-center justify-center">
                            <Activity size={18} className="text-default-600" />
                        </div>
                        <div>
                            <span className="text-lg font-semibold text-foreground">
                                Actividad MGA: {activity.code}
                            </span>
                            <p className="text-tiny text-default-400 font-normal">
                                {isEditMode ? "Editar actividad MGA" : "Detalle de la actividad MGA"}
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
                                {isEditMode ? (
                                    <Input
                                        label="Nombre"
                                        value={formData.name}
                                        onValueChange={(val) => setFormData({ ...formData, name: val })}
                                        isRequired
                                    />
                                ) : (
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
                                )}
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
                                        {activity.project?.code} - {activity.project?.name}
                                    </p>
                                </div>
                            </div>

                            {/* Producto */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Package size={16} className="text-default-500" />
                                </div>
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Producto
                                    </span>
                                    <p className="text-small font-medium text-foreground">
                                        {activity.product?.productCode} - {activity.product?.productName}
                                    </p>
                                </div>
                            </div>

                            {/* Cantidad Actividades Detalladas */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <ListTodo size={16} className="text-default-500" />
                                </div>
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Actividades Detalladas
                                    </span>
                                    <p className="text-small text-foreground">
                                        {activity.detailedActivitiesCount ?? 0}
                                    </p>
                                </div>
                            </div>

                            {/* Observaciones */}
                            <div className="col-span-2">
                                {isEditMode ? (
                                    <Textarea
                                        label="Observaciones"
                                        value={formData.observations}
                                        onValueChange={(val) => setFormData({ ...formData, observations: val })}
                                        minRows={2}
                                    />
                                ) : (
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
                                )}
                            </div>

                        </div>



                        {/* Fechas de Registro y Actividad */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                            {/* Fecha de Actividad */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Calendar size={16} className="text-default-500" />
                                </div>
                                <div>
                                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                                        Fecha de Actividad
                                    </span>
                                    <p className="text-small text-foreground">
                                        {activity.activityDate ? new Date(activity.activityDate).toLocaleDateString("es-CO") : "N/A"}
                                    </p>
                                </div>
                            </div>

                            {/* Fecha de Creación */}
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Clock size={16} className="text-default-500" />
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
                    {isEditMode ? (
                        <>
                            <Button variant="flat" onPress={() => setIsEditMode(false)} isDisabled={saving}>
                                Cancelar
                            </Button>
                            <Button color="primary" onPress={handleSave} isLoading={saving}>
                                Guardar
                            </Button>
                        </>
                    ) : (
                        <Button variant="flat" onPress={handleClose}>
                            Cerrar
                        </Button>
                    )}
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
