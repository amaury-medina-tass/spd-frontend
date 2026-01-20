"use client"

import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Button,
    Input,
    Spinner,
    Tabs,
    Tab,
} from "@heroui/react"
import { Link2, Search, RefreshCw } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { get, post, del, PaginatedData } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { addToast } from "@heroui/toast"
import { ActivityTable, DetailedActivityItem } from "@/components/tables/ActivityTable"

type Props = {
    isOpen: boolean
    mgaActivityId: string | null
    mgaActivityCode?: string
    onClose: () => void
    onSuccess?: () => void
}

export function ManageDetailedActivitiesModal({
    isOpen,
    mgaActivityId,
    mgaActivityCode,
    onClose,
    onSuccess,
}: Props) {
    const [loadingAssociated, setLoadingAssociated] = useState(true)
    const [loadingAvailable, setLoadingAvailable] = useState(true)
    const [associated, setAssociated] = useState<DetailedActivityItem[]>([])
    const [available, setAvailable] = useState<DetailedActivityItem[]>([])
    const [searchAssociated, setSearchAssociated] = useState("")
    const [searchAvailable, setSearchAvailable] = useState("")
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<string>("associated")

    const fetchAssociated = useCallback(async () => {
        if (!mgaActivityId) return
        setLoadingAssociated(true)
        try {
            const res = await get<PaginatedData<DetailedActivityItem>>(
                `${endpoints.masters.mgaActivityAssociatedActivities(mgaActivityId)}?limit=100&search=${searchAssociated}`
            )
            setAssociated(res.data)
        } catch (e: any) {
            addToast({ title: "Error al cargar asociadas", description: e.message, color: "danger" })
        } finally {
            setLoadingAssociated(false)
        }
    }, [mgaActivityId, searchAssociated])

    const fetchAvailable = useCallback(async () => {
        if (!mgaActivityId) return
        setLoadingAvailable(true)
        try {
            const res = await get<PaginatedData<DetailedActivityItem>>(
                `${endpoints.masters.mgaActivityAvailableActivities(mgaActivityId)}?limit=100&search=${searchAvailable}`
            )
            setAvailable(res.data)
        } catch (e: any) {
            addToast({ title: "Error al cargar disponibles", description: e.message, color: "danger" })
        } finally {
            setLoadingAvailable(false)
        }
    }, [mgaActivityId, searchAvailable])

    useEffect(() => {
        if (isOpen && mgaActivityId) {
            setSearchAssociated("")
            setSearchAvailable("")
            setActiveTab("associated")
            fetchAssociated()
            fetchAvailable()
        }
    }, [isOpen, mgaActivityId])

    useEffect(() => {
        if (isOpen && mgaActivityId && activeTab === "associated") {
            fetchAssociated()
        }
    }, [searchAssociated])

    useEffect(() => {
        if (isOpen && mgaActivityId && activeTab === "available") {
            fetchAvailable()
        }
    }, [searchAvailable])

    const handleAssociate = async (detailedId: string) => {
        if (!mgaActivityId) return
        setActionLoading(detailedId)
        try {
            await post(endpoints.masters.mgaActivityDetailedRelations(mgaActivityId), { detailedActivityId: detailedId })
            addToast({ title: "Actividad asociada", color: "success" })
            await Promise.all([fetchAssociated(), fetchAvailable()])
        } catch (e: any) {
            addToast({ title: "Error", description: e.message, color: "danger" })
        } finally {
            setActionLoading(null)
        }
    }

    const handleDissociate = async (detailedId: string) => {
        if (!mgaActivityId) return
        setActionLoading(detailedId)
        try {
            await del(endpoints.masters.mgaActivityDetailedRelationsRemove(mgaActivityId, detailedId))
            addToast({ title: "Actividad desasociada", color: "success" })
            await Promise.all([fetchAssociated(), fetchAvailable()])
        } catch (e: any) {
            addToast({ title: "Error", description: e.message, color: "danger" })
        } finally {
            setActionLoading(null)
        }
    }

    const handleClose = () => {
        onSuccess?.()
        onClose()
    }

    const loading = loadingAssociated || loadingAvailable

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={() => handleClose()}
            size="4xl"
            scrollBehavior="inside"
            classNames={{
                base: "bg-content1",
                header: "border-b border-divider",
                footer: "border-t border-divider",
            }}
        >
            <ModalContent>
                <ModalHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center">
                            <Link2 size={16} className="text-default-500" />
                        </div>
                        <div>
                            <span className="text-base font-semibold">Gestionar Actividades Detalladas</span>
                            {mgaActivityCode && (
                                <p className="text-tiny text-default-400 font-normal">
                                    {mgaActivityCode}
                                </p>
                            )}
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody className="py-4">
                    {loading && associated.length === 0 && available.length === 0 ? (
                        <div className="flex justify-center py-12">
                            <Spinner size="md" />
                        </div>
                    ) : (
                        <Tabs
                            selectedKey={activeTab}
                            onSelectionChange={(key) => setActiveTab(key as string)}
                            variant="underlined"
                            classNames={{
                                tabList: "gap-6",
                                cursor: "w-full bg-primary",
                            }}
                        >
                            <Tab
                                key="associated"
                                title={
                                    <span className="flex items-center gap-2">
                                        Asociadas
                                        <span className="text-tiny bg-default-100 px-1.5 py-0.5 rounded">
                                            {associated.length}
                                        </span>
                                    </span>
                                }
                            >
                                <div className="pt-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Input
                                            size="sm"
                                            placeholder="Buscar por código o nombre..."
                                            value={searchAssociated}
                                            onValueChange={setSearchAssociated}
                                            startContent={<Search size={14} className="text-default-400" />}
                                            isClearable
                                            onClear={() => setSearchAssociated("")}
                                            className="max-w-xs"
                                        />
                                        <Button
                                            size="sm"
                                            variant="light"
                                            startContent={<RefreshCw size={14} />}
                                            isLoading={loadingAssociated}
                                            onPress={fetchAssociated}
                                        >
                                            Actualizar
                                        </Button>
                                    </div>
                                    {loadingAssociated ? (
                                        <div className="flex justify-center py-8">
                                            <Spinner size="sm" />
                                        </div>
                                    ) : (
                                        <ActivityTable
                                            items={associated}
                                            actionType="dissociate"
                                            actionLoading={actionLoading}
                                            onAction={handleDissociate}
                                            emptyMessage="No hay actividades asociadas"
                                            ariaLabel="Actividades asociadas"
                                        />
                                    )}
                                </div>
                            </Tab>

                            <Tab
                                key="available"
                                title={
                                    <span className="flex items-center gap-2">
                                        Disponibles
                                        <span className="text-tiny bg-default-100 px-1.5 py-0.5 rounded">
                                            {available.length}
                                        </span>
                                    </span>
                                }
                            >
                                <div className="pt-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Input
                                            size="sm"
                                            placeholder="Buscar por código o nombre..."
                                            value={searchAvailable}
                                            onValueChange={setSearchAvailable}
                                            startContent={<Search size={14} className="text-default-400" />}
                                            isClearable
                                            onClear={() => setSearchAvailable("")}
                                            className="max-w-xs"
                                        />
                                        <Button
                                            size="sm"
                                            variant="light"
                                            startContent={<RefreshCw size={14} />}
                                            isLoading={loadingAvailable}
                                            onPress={fetchAvailable}
                                        >
                                            Actualizar
                                        </Button>
                                    </div>

                                    {loadingAvailable ? (
                                        <div className="flex justify-center py-8">
                                            <Spinner size="sm" />
                                        </div>
                                    ) : (
                                        <ActivityTable
                                            items={available}
                                            actionType="associate"
                                            actionLoading={actionLoading}
                                            onAction={handleAssociate}
                                            emptyMessage="No hay actividades disponibles"
                                            ariaLabel="Actividades disponibles"
                                        />
                                    )}
                                </div>
                            </Tab>
                        </Tabs>
                    )}
                </ModalBody>

                <ModalFooter>
                    <Button variant="flat" size="sm" onPress={handleClose}>
                        Cerrar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
