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
import { UserPlus, X, Plus, CheckCircle2, Users } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { addToast } from "@heroui/toast"
import { User } from "@/types/user"
import { getUsers } from "@/services/access-control/users.service"
import { ResourceManager } from "@/components/common/ResourceManager"
import { ColumnDef } from "@/components/tables/CleanTable"

type AssignedUser = {
    id: string
    userId: string
    firstName?: string
    lastName?: string
    email?: string
}

type Props = {
    isOpen: boolean
    entityId: string | null
    entityCode?: string
    entityLabel?: string
    onClose: () => void
    getAssignedUsers: (id: string) => Promise<AssignedUser[]>
    assignUser: (id: string, userId: string, userName?: string) => Promise<any>
    unassignUser: (id: string, userId: string) => Promise<void>
}

export function AssignUserModal({
    isOpen,
    entityId,
    entityCode,
    entityLabel = "Elemento",
    onClose,
    getAssignedUsers,
    assignUser,
    unassignUser,
}: Props) {
    const [loadingAssigned, setLoadingAssigned] = useState(true)
    const [loadingAvailable, setLoadingAvailable] = useState(true)
    const [assigned, setAssigned] = useState<(User & { assignmentId?: string })[]>([])
    const [available, setAvailable] = useState<User[]>([])
    const [searchAssigned, setSearchAssigned] = useState("")
    const [searchAvailable, setSearchAvailable] = useState("")
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<string>("assigned")

    // Pagination State
    const [pageAssigned, setPageAssigned] = useState(1)
    const [pageAvailable, setPageAvailable] = useState(1)
    const [limit] = useState(5)

    // All users cache
    const [allUsers, setAllUsers] = useState<User[]>([])
    const [rawAssignments, setRawAssignments] = useState<AssignedUser[]>([])
    const [assignedUserIds, setAssignedUserIds] = useState<Set<string>>(new Set())

    const fetchAssigned = useCallback(async () => {
        if (!entityId) return
        setLoadingAssigned(true)
        try {
            const assignments = await getAssignedUsers(entityId)
            setRawAssignments(assignments)
            setAssignedUserIds(new Set(assignments.map(a => a.userId)))
        } catch (e: any) {
            addToast({ title: "Error al cargar usuarios asignados", description: e.message, color: "danger" })
        } finally {
            setLoadingAssigned(false)
        }
    }, [entityId, getAssignedUsers])

    const fetchAllUsers = useCallback(async () => {
        setLoadingAvailable(true)
        try {
            const params = new URLSearchParams({ page: "1", limit: "1000" })
            const result = await getUsers(params.toString())
            setAllUsers(result.data)
        } catch (e: any) {
            addToast({ title: "Error al cargar usuarios", description: e.message, color: "danger" })
        } finally {
            setLoadingAvailable(false)
        }
    }, [])

    // Enrich assigned users with profile data from allUsers
    useEffect(() => {
        if (rawAssignments.length === 0) {
            setAssigned([])
            return
        }
        const userMap = new Map(allUsers.map(u => [u.id, u]))
        const enriched = rawAssignments.map(a => {
            const user = userMap.get(a.userId)
            return {
                id: a.userId,
                assignmentId: a.id,
                email: user?.email || a.email || "",
                document_number: user?.document_number || "",
                first_name: user?.first_name || a.firstName || "",
                last_name: user?.last_name || a.lastName || "",
                is_active: user?.is_active ?? true,
                created_at: user?.created_at || "",
                updated_at: user?.updated_at || "",
                roles: user?.roles || [],
            }
        })
        setAssigned(enriched)
    }, [rawAssignments, allUsers])

    useEffect(() => {
        if (isOpen && entityId) {
            setSearchAssigned("")
            setSearchAvailable("")
            setPageAssigned(1)
            setPageAvailable(1)
            setActiveTab("assigned")
            fetchAssigned()
            fetchAllUsers()
        }
    }, [isOpen, entityId])

    // Filter and paginate assigned users
    const filteredAssigned = assigned.filter(u => {
        if (!searchAssigned) return true
        const term = searchAssigned.toLowerCase()
        return (
            u.first_name.toLowerCase().includes(term) ||
            u.last_name.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term)
        )
    })
    const totalPagesAssigned = Math.ceil(filteredAssigned.length / limit) || 1
    const pagedAssigned = filteredAssigned.slice((pageAssigned - 1) * limit, pageAssigned * limit)

    // Filter and paginate available users (not assigned)
    const filteredAvailable = allUsers.filter(u => {
        if (assignedUserIds.has(u.id)) return false
        if (!searchAvailable) return true
        const term = searchAvailable.toLowerCase()
        return (
            u.first_name.toLowerCase().includes(term) ||
            u.last_name.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term)
        )
    })
    const totalPagesAvailable = Math.ceil(filteredAvailable.length / limit) || 1
    const pagedAvailable = filteredAvailable.slice((pageAvailable - 1) * limit, pageAvailable * limit)

    const handleAssign = useCallback(async (userId: string) => {
        if (!entityId) return
        setActionLoading(userId)
        try {
            // Find user to get full name
            const user = allUsers.find(u => u.id === userId)
            const userName = user ? `${user.first_name} ${user.last_name}`.trim() : undefined
            
            await assignUser(entityId, userId, userName)
            addToast({ title: "Usuario asignado", color: "success" })
            await fetchAssigned()
        } catch (e: any) {
            addToast({ title: "Error", description: e.message, color: "danger" })
        } finally {
            setActionLoading(null)
        }
    }, [entityId, allUsers, assignUser, fetchAssigned])

    const handleUnassign = useCallback(async (userId: string) => {
        if (!entityId) return
        setActionLoading(userId)
        try {
            await unassignUser(entityId, userId)
            addToast({ title: "Usuario desasignado", color: "success" })
            await fetchAssigned()
        } catch (e: any) {
            addToast({ title: "Error", description: e.message, color: "danger" })
        } finally {
            setActionLoading(null)
        }
    }, [entityId, unassignUser, fetchAssigned])

    const loading = loadingAssigned || loadingAvailable

    const columns: ColumnDef[] = [
        { name: "NOMBRE", uid: "name" },
        { name: "CORREO", uid: "email" },
        { name: "ACCIONES", uid: "actions", align: "center" },
    ]

    const renderCell = useCallback((item: User, columnKey: React.Key, isAssigned: boolean) => {
        switch (columnKey) {
            case "name":
                return <span className="font-medium">{item.first_name} {item.last_name}</span>
            case "email":
                return <span className="text-default-500 text-sm">{item.email}</span>
            case "actions":
                return (
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color={isAssigned ? "danger" : "primary"}
                        isLoading={actionLoading === item.id}
                        onPress={() => isAssigned ? handleUnassign(item.id) : handleAssign(item.id)}
                        title={isAssigned ? "Desasignar" : "Asignar"}
                    >
                        {actionLoading !== item.id && (isAssigned ? <X size={14} /> : <Plus size={14} />)}
                    </Button>
                )
            default:
                return null
        }
    }, [actionLoading, handleAssign, handleUnassign])

    const renderMobileItem = useCallback((item: User, isAssigned: boolean) => (
        <Card className="bg-default-50 border border-default-200 shadow-none">
            <CardBody className="p-3 gap-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                            {item.first_name} {item.last_name}
                        </p>
                        <p className="text-xs text-default-400 truncate">{item.email}</p>
                    </div>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color={isAssigned ? "danger" : "primary"}
                        isLoading={actionLoading === item.id}
                        onPress={() => isAssigned ? handleUnassign(item.id) : handleAssign(item.id)}
                        className="flex-shrink-0"
                    >
                        {actionLoading !== item.id && (isAssigned ? <X size={14} /> : <Plus size={14} />)}
                    </Button>
                </div>
            </CardBody>
        </Card>
    ), [actionLoading, handleAssign, handleUnassign])

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={() => onClose()}
            size="3xl"
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
                            <UserPlus size={16} className="text-default-500" />
                        </div>
                        <div>
                            <span className="text-base font-semibold">Gestionar Usuarios</span>
                            {entityCode && (
                                <p className="text-tiny text-default-400 font-normal">
                                    {entityLabel}: {entityCode}
                                </p>
                            )}
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody className="px-4 sm:px-6 py-4">
                    {loading && assigned.length === 0 && allUsers.length === 0 ? (
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
                                key="assigned"
                                title={
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle2 size={16} />
                                        <span>Asignados ({filteredAssigned.length})</span>
                                    </div>
                                }
                            >
                                <div className="pt-4">
                                    <ResourceManager
                                        search={searchAssigned}
                                        onSearchChange={(val) => { setSearchAssigned(val); setPageAssigned(1) }}
                                        searchPlaceholder="Buscar usuario asignado..."
                                        onRefresh={fetchAssigned}
                                        refreshLoading={loadingAssigned}
                                        columns={columns}
                                        items={pagedAssigned}
                                        renderCell={(item, key) => renderCell(item, key, true)}
                                        renderMobileItem={(item) => renderMobileItem(item, true)}
                                        isLoading={loadingAssigned}
                                        page={pageAssigned}
                                        totalPages={totalPagesAssigned}
                                        onPageChange={setPageAssigned}
                                        emptyContent={
                                            <div className="py-8 text-center text-default-400">
                                                No hay usuarios asignados
                                            </div>
                                        }
                                    />
                                </div>
                            </Tab>

                            <Tab
                                key="available"
                                title={
                                    <div className="flex items-center space-x-2">
                                        <Users size={16} />
                                        <span>Disponibles ({filteredAvailable.length})</span>
                                    </div>
                                }
                            >
                                <div className="pt-4">
                                    <ResourceManager
                                        search={searchAvailable}
                                        onSearchChange={(val) => { setSearchAvailable(val); setPageAvailable(1) }}
                                        searchPlaceholder="Buscar usuario disponible..."
                                        onRefresh={fetchAllUsers}
                                        refreshLoading={loadingAvailable}
                                        columns={columns}
                                        items={pagedAvailable}
                                        renderCell={(item, key) => renderCell(item, key, false)}
                                        renderMobileItem={(item) => renderMobileItem(item, false)}
                                        isLoading={loadingAvailable}
                                        page={pageAvailable}
                                        totalPages={totalPagesAvailable}
                                        onPageChange={setPageAvailable}
                                        emptyContent={
                                            <div className="py-8 text-center text-default-400">
                                                No hay usuarios disponibles
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
