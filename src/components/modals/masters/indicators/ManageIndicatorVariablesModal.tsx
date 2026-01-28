"use client"

import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Button,
    Spinner,
    Tabs,
    Tab,
    Card,
    CardBody,
} from "@heroui/react"
import { Link2, X, Plus, FolderKanban, CheckCircle2 } from "lucide-react"
import { useState, useEffect, useCallback, useMemo } from "react"
import { addToast } from "@heroui/toast"
import { Variable } from "@/types/variable"
import {
    getIndicatorVariables,
    getActionPlanIndicatorVariables,
    associateIndicatorVariable,
    associateActionPlanIndicatorVariable,
    disassociateIndicatorVariable,
    disassociateActionPlanIndicatorVariable,
} from "@/services/masters/indicators.service"
import { ResourceManager } from "@/components/common/ResourceManager"
import { ColumnDef } from "@/components/tables/CleanTable"

type Props = {
    isOpen: boolean
    indicatorId: string | null
    indicatorCode?: string
    onClose: () => void
    type: "indicative" | "action-plan"
}

export function ManageIndicatorVariablesModal({
    isOpen,
    indicatorId,
    indicatorCode,
    onClose,
    type,
}: Props) {
    const [loadingAssociated, setLoadingAssociated] = useState(true)
    const [loadingAvailable, setLoadingAvailable] = useState(true)
    const [associated, setAssociated] = useState<Variable[]>([])
    const [available, setAvailable] = useState<Variable[]>([])
    const [searchAssociated, setSearchAssociated] = useState("")
    const [searchAvailable, setSearchAvailable] = useState("")
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<string>("associated")

    // Pagination State
    const [pageAssociated, setPageAssociated] = useState(1)
    const [totalPagesAssociated, setTotalPagesAssociated] = useState(1)
    const [pageAvailable, setPageAvailable] = useState(1)
    const [totalPagesAvailable, setTotalPagesAvailable] = useState(1)
    const [limit, setLimit] = useState(5)

    const fetchAssociated = useCallback(async () => {
        if (!indicatorId) return
        setLoadingAssociated(true)
        try {
            const params = new URLSearchParams({
                type: "associated",
                limit: limit.toString(),
                page: pageAssociated.toString(),
                search: searchAssociated,
            })
            
            let res
            if (type === "indicative") {
                res = await getIndicatorVariables(indicatorId, params.toString())
            } else {
                res = await getActionPlanIndicatorVariables(indicatorId, params.toString())
            }
            
            setAssociated(res.data)
            setTotalPagesAssociated(res.meta.totalPages)
        } catch (e: any) {
            addToast({ title: "Error al cargar variables asociadas", description: e.message, color: "danger" })
        } finally {
            setLoadingAssociated(false)
        }
    }, [indicatorId, searchAssociated, pageAssociated, limit, type])

    const fetchAvailable = useCallback(async () => {
        if (!indicatorId) return
        setLoadingAvailable(true)
        try {
            const params = new URLSearchParams({
                type: "available",
                limit: limit.toString(),
                page: pageAvailable.toString(),
                search: searchAvailable,
            })
            
            let res
            if (type === "indicative") {
                res = await getIndicatorVariables(indicatorId, params.toString())
            } else {
                res = await getActionPlanIndicatorVariables(indicatorId, params.toString())
            }

            setAvailable(res.data)
            setTotalPagesAvailable(res.meta.totalPages)
        } catch (e: any) {
            addToast({ title: "Error al cargar variables disponibles", description: e.message, color: "danger" })
        } finally {
            setLoadingAvailable(false)
        }
    }, [indicatorId, searchAvailable, pageAvailable, limit, type])

    useEffect(() => {
        if (isOpen && indicatorId) {
            setSearchAssociated("")
            setSearchAvailable("")
            setPageAssociated(1)
            setPageAvailable(1)
            setActiveTab("associated")
            fetchAssociated()
            fetchAvailable()
        }
    }, [isOpen, indicatorId, type])

    useEffect(() => {
        if (isOpen && indicatorId && activeTab === "associated") {
            fetchAssociated()
        }
    }, [searchAssociated, pageAssociated, limit, activeTab])

    useEffect(() => {
        if (isOpen && indicatorId && activeTab === "available") {
            fetchAvailable()
        }
    }, [searchAvailable, pageAvailable, limit, activeTab])

    const handleAssociate = useCallback(async (variableId: string) => {
        if (!indicatorId) return
        setActionLoading(variableId)
        try {
            if (type === "indicative") {
                await associateIndicatorVariable(indicatorId, variableId)
            } else {
                await associateActionPlanIndicatorVariable(indicatorId, variableId)
            }
            
            addToast({ title: "Variable asociada", color: "success" })
            await Promise.all([fetchAssociated(), fetchAvailable()])
        } catch (e: any) {
            addToast({ title: "Error", description: e.message, color: "danger" })
        } finally {
            setActionLoading(null)
        }
    }, [indicatorId, type, fetchAssociated, fetchAvailable])

    const handleDissociate = useCallback(async (variableId: string) => {
        if (!indicatorId) return
        setActionLoading(variableId)
        try {
            if (type === "indicative") {
                await disassociateIndicatorVariable(indicatorId, variableId)
            } else {
                await disassociateActionPlanIndicatorVariable(indicatorId, variableId)
            }
            
            addToast({ title: "Variable desasociada", color: "success" })
            await Promise.all([fetchAssociated(), fetchAvailable()])
        } catch (e: any) {
            addToast({ title: "Error", description: e.message, color: "danger" })
        } finally {
            setActionLoading(null)
        }
    }, [indicatorId, type, fetchAssociated, fetchAvailable])

    const loading = loadingAssociated || loadingAvailable

    // Column Definitions
    const columns: ColumnDef[] = [
        { name: "CÓDIGO", uid: "code" },
        { name: "NOMBRE", uid: "name" },
        { name: "OBSERVACIONES", uid: "observations" },
        { name: "ACCIONES", uid: "actions", align: "center" },
    ]

    const renderCell = useCallback((item: Variable, columnKey: React.Key, isAssociated: boolean) => {
        switch (columnKey) {
            case "code":
                return <span className="font-mono font-medium">{item.code}</span>
            case "name":
                return <span className="line-clamp-1 max-w-[200px]">{item.name}</span>
            case "observations":
                return <span className="line-clamp-1 max-w-[300px] text-default-500">{item.observations || "—"}</span>
            case "actions":
                return (
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color={isAssociated ? "danger" : "primary"}
                        isLoading={actionLoading === item.id}
                        onPress={() => isAssociated ? handleDissociate(item.id) : handleAssociate(item.id)}
                        title={isAssociated ? "Desasociar" : "Asociar"}
                    >
                        {actionLoading !== item.id && (isAssociated ? <X size={14} /> : <Plus size={14} />)}
                    </Button>
                )
            default:
                return null
        }
    }, [actionLoading, handleAssociate, handleDissociate])

    const renderMobileItem = useCallback((item: Variable, isAssociated: boolean) => (
        <Card className="bg-default-50 border border-default-200 shadow-none">
            <CardBody className="p-3 gap-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <span className="font-mono text-xs font-semibold text-primary-600 dark:text-primary-400">
                            {item.code}
                        </span>
                        <p className="text-sm font-medium text-foreground line-clamp-2 mt-0.5">
                            {item.name}
                        </p>
                    </div>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color={isAssociated ? "danger" : "primary"}
                        isLoading={actionLoading === item.id}
                        onPress={() => isAssociated ? handleDissociate(item.id) : handleAssociate(item.id)}
                        className="flex-shrink-0"
                    >
                        {actionLoading !== item.id && (isAssociated ? <X size={14} /> : <Plus size={14} />)}
                    </Button>
                </div>
                {item.observations && (
                    <div>
                        <span className="text-tiny text-default-400">Observaciones</span>
                        <p className="text-xs font-medium line-clamp-2">{item.observations}</p>
                    </div>
                )}
            </CardBody>
        </Card>
    ), [actionLoading, handleAssociate, handleDissociate])


    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={() => onClose()}
            size="4xl"
            scrollBehavior="inside"
            placement="center"
            classNames={{
                base: "bg-content1 mx-4 my-4 sm:mx-auto max-h-[90vh]",
                header: "border-b border-divider",
                footer: "border-t border-divider",
                body: "p-0",
            }}
        >
            <ModalContent>
                <ModalHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center">
                            <Link2 size={16} className="text-default-500" />
                        </div>
                        <div>
                            <span className="text-base font-semibold">Gestionar Variables</span>
                            {indicatorCode && (
                                <p className="text-tiny text-default-400 font-normal">
                                    Indicador: {indicatorCode}
                                </p>
                            )}
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody className="px-4 sm:px-6 py-4">
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
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle2 size={16} />
                                        <span>Asociadas</span>
                                    </div>
                                }
                            >
                                <div className="pt-4">
                                    <ResourceManager
                                        search={searchAssociated}
                                        onSearchChange={setSearchAssociated}
                                        onRefresh={fetchAssociated}
                                        refreshLoading={loadingAssociated}
                                        columns={columns}
                                        items={associated}
                                        renderCell={(item, key) => renderCell(item, key, true)}
                                        renderMobileItem={(item) => renderMobileItem(item, true)}
                                        isLoading={loadingAssociated}
                                        page={pageAssociated}
                                        totalPages={totalPagesAssociated}
                                        onPageChange={setPageAssociated}
                                        limit={limit}
                                        onLimitChange={(l) => {
                                            setLimit(l)
                                            setPageAssociated(1)
                                            setPageAvailable(1)
                                        }}
                                        emptyContent={
                                            <div className="py-8 text-center text-default-400">
                                                No hay variables asociadas
                                            </div>
                                        }
                                    />
                                </div>
                            </Tab>

                            <Tab 
                                key="available" 
                                title={
                                    <div className="flex items-center space-x-2">
                                        <FolderKanban size={16} />
                                        <span>Disponibles</span>
                                    </div>
                                }
                            >
                                <div className="pt-4">
                                    <ResourceManager
                                        search={searchAvailable}
                                        onSearchChange={setSearchAvailable}
                                        onRefresh={fetchAvailable}
                                        refreshLoading={loadingAvailable}
                                        columns={columns}
                                        items={available}
                                        renderCell={(item, key) => renderCell(item, key, false)}
                                        renderMobileItem={(item) => renderMobileItem(item, false)}
                                        isLoading={loadingAvailable}
                                        page={pageAvailable}
                                        totalPages={totalPagesAvailable}
                                        onPageChange={setPageAvailable}
                                        limit={limit}
                                        onLimitChange={(l) => {
                                            setLimit(l)
                                            setPageAssociated(1)
                                            setPageAvailable(1)
                                        }}
                                        emptyContent={
                                            <div className="py-8 text-center text-default-400">
                                                No hay variables disponibles
                                            </div>
                                        }
                                    />
                                </div>
                            </Tab>
                        </Tabs>
                    )}
                </ModalBody>

                <ModalFooter>
                    <Button variant="flat" size="sm" onPress={onClose}>
                        Cerrar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
