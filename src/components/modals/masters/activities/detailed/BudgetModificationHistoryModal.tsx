"use client"

import { Modal, ModalBody, ModalContent, ModalHeader, ModalFooter, SortDescriptor, Chip, Button } from "@heroui/react"
import { useCallback, useEffect, useState } from "react"
import { get, PaginatedData, PaginationMeta } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { BudgetModification } from "@/types/activity"
import { History } from "lucide-react"
import { CleanTable, ColumnDef } from "@/components/tables/CleanTable"

type Props = {
    isOpen: boolean
    detailedActivityId: string
    detailedActivityName: string
    onClose: () => void
}

const columns: ColumnDef[] = [
    { name: "TIPO", uid: "modificationType" },
    { name: "RUBRO (TRASLADOS)", uid: "rubricInfo", sortable: false },
    { name: "VALOR", uid: "value" },
    { name: "SALDO ANTERIOR", uid: "previousBalance" },
    { name: "NUEVO SALDO", uid: "newBalance" },
    { name: "FECHA EMISIÓN", uid: "dateIssue" },
    { name: "DOC. LEGAL", uid: "legalDocument", sortable: false },
    { name: "DESCRIPCIÓN", uid: "description", sortable: false },
    { name: "FECHA CREACIÓN", uid: "createdAt" },
]

export function BudgetModificationHistoryModal({
    isOpen,
    detailedActivityId,
    detailedActivityName,
    onClose,
}: Props) {
    const [items, setItems] = useState<BudgetModification[]>([])
    const [meta, setMeta] = useState<PaginationMeta | null>(null)
    const [loading, setLoading] = useState(false)
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "createdAt",
        direction: "descending",
    })
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(5)

    const fetchHistory = useCallback(async (page: number, currentSort: SortDescriptor, currentLimit: number) => {
        if (!isOpen) return
        setLoading(true)
        try {
            const sortColumn = currentSort.column
            const sortDirection = currentSort.direction === "ascending" ? "ASC" : "DESC"

            const params = new URLSearchParams({
                page: page.toString(),
                limit: currentLimit.toString(),
                sortOrder: sortDirection,
                sortBy: sortColumn as string,
                detailedActivityId: detailedActivityId
            })

            const response = await get<PaginatedData<BudgetModification>>(
                `${endpoints.masters.budgetModifications}?${params.toString()}`
            )

            setItems(response.data)
            setMeta(response.meta)
        } catch (error) {
            console.error("Error fetching history:", error)
        } finally {
            setLoading(false)
        }
    }, [detailedActivityId, isOpen])

    useEffect(() => {
        if (isOpen) {
            fetchHistory(1, sortDescriptor, limit)
            setPage(1)
        }
    }, [isOpen, fetchHistory, sortDescriptor, limit])

    const handleSortChange = (descriptor: SortDescriptor) => {
        setSortDescriptor(descriptor)
        fetchHistory(page, descriptor, limit)
    }

    const renderCell = useCallback((item: BudgetModification, columnKey: React.Key) => {
        switch (columnKey) {
            case "modificationType":
                const types: Record<string, string> = {
                    ADDITION: "Adición",
                    REDUCTION: "Reducción",
                    TRANSFER: "Traslado",
                }
                const colors: Record<string, "success" | "danger" | "warning" | "default"> = {
                    ADDITION: "success",
                    REDUCTION: "danger",
                    TRANSFER: "warning",
                }
                return (
                    <Chip
                        color={colors[item.modificationType] || "default"}
                        variant="flat"
                        size="sm"
                        classNames={{ content: "font-semibold" }}
                    >
                        {types[item.modificationType] || item.modificationType}
                    </Chip>
                )
            case "rubricInfo":
                if (item.modificationType === "TRANSFER") {
                    return (
                        <div className="flex flex-col gap-1 min-w-[200px]">
                            {item.previousRubric && (
                                <div className="flex flex-col">
                                    <span className="text-tiny text-default-400">Origen:</span>
                                    <span className="text-tiny font-medium">{item.previousRubric.code}</span>
                                </div>
                            )}
                            {item.newRubric && (
                                <div className="flex flex-col">
                                    <span className="text-tiny text-default-400">Destino:</span>
                                    <span className="text-tiny font-medium">{item.newRubric.code}</span>
                                </div>
                            )}
                        </div>
                    )
                }
                return <span className="text-default-300">-</span>
            case "value":
                return new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                }).format(parseFloat(item.value))
            case "previousBalance":
                return new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                }).format(parseFloat(item.previousBalance))
            case "newBalance":
                return new Intl.NumberFormat("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                }).format(parseFloat(item.newBalance))
            case "dateIssue":
                return (
                    <div className="flex flex-col">
                        <span className="text-small">{new Date(item.dateIssue).toLocaleDateString("es-CO")}</span>
                    </div>
                )
            case "legalDocument":
                return item.legalDocument || <span className="text-default-300">-</span>
            case "description":
                return (
                    <span className="truncate max-w-[150px] block" title={item.description}>
                        {item.description}
                    </span>
                )
            case "createdAt":
                return (
                    <div className="flex flex-col">
                        <span className="text-small">{new Date(item.createdAt).toLocaleDateString("es-CO")}</span>
                        <span className="text-tiny text-default-400">{new Date(item.createdAt).toLocaleTimeString("es-CO")}</span>
                    </div>
                )
            default:
                return (item as any)[columnKey as string]
        }
    }, [])

    return (
        <Modal
            isOpen={isOpen}
            size="5xl"
            onOpenChange={() => onClose()}
            scrollBehavior="inside"
            placement="center"
            classNames={{
                base: "!rounded-2xl !overflow-hidden !max-w-7xl",
                header: "border-b border-divider",
                footer: "border-t border-divider",
            }}
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary-50 text-primary">
                                    <History size={20} className="text-primary" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-large font-semibold text-foreground">
                                        Historial de Modificaciones
                                    </span>
                                    <p className="text-small text-default-500 font-normal">
                                        Actividad: <span className="font-medium text-foreground">{detailedActivityName}</span>
                                    </p>
                                </div>
                            </div>
                        </ModalHeader>
                        <ModalBody className="p-0">
                            <CleanTable
                                columns={columns}
                                items={items}
                                isLoading={loading}
                                sortDescriptor={sortDescriptor}
                                onSortChange={handleSortChange}
                                renderCell={renderCell}
                                page={page}
                                totalPages={meta?.totalPages}
                                onPageChange={(newPage) => {
                                    setPage(newPage)
                                    fetchHistory(newPage, sortDescriptor, limit)
                                }}
                                limit={limit}
                                onLimitChange={(newLimit) => {
                                    setLimit(newLimit)
                                    setPage(1)
                                    fetchHistory(1, sortDescriptor, newLimit)
                                }}
                                emptyContent={
                                    <div className="flex flex-col items-center justify-center p-10 text-default-400">
                                        <div className="w-16 h-16 bg-default-50 rounded-full flex items-center justify-center mb-4">
                                            <History size={32} className="opacity-50" />
                                        </div>
                                        <p className="text-medium font-medium">Sin modificaciones</p>
                                        <p className="text-tiny">Esta actividad no tiene cambios registrados.</p>
                                    </div>
                                }
                            />
                        </ModalBody>
                        <ModalFooter className="justify-between items-center bg-default-50/50">
                            <div className="flex-1">
                                <span className="text-small text-default-400">
                                    Total: {meta?.total || 0} registro(s)
                                </span>
                            </div>
                            <Button variant="light" onPress={onClose}>
                                Cerrar
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
