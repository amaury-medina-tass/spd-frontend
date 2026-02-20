"use client"

import { formatCurrency } from "@/lib/format-utils"
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Button,
    Input,
    Card,
    CardBody,
} from "@heroui/react"
import type { MasterContractCdpPosition } from "@/types/financial"
import { get, PaginatedData, PaginationMeta } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { useCallback, useEffect, useState } from "react"
import { CleanTable, ColumnDef } from "@/components/tables/CleanTable"
import { useDebounce } from "@/hooks/useDebounce"
import { FileText, DollarSign, Receipt, Hash, Briefcase, BookOpen, Search } from "lucide-react"

const columns: ColumnDef[] = [
    { name: "N° CDP", uid: "cdpNumber", width: 140 },
    { name: "POSICIÓN", uid: "positionNumber", width: 100 },
    { name: "POSICIÓN PRESUPUESTAL", uid: "rubricCode" },
    { name: "ORIGEN", uid: "fundingSourceName" },
    { name: "PROYECTO", uid: "projectCode" },
    { name: "VALOR CDP", uid: "cdpTotalValue", align: "end" },
    { name: "VALOR POSICIÓN", uid: "positionValue", align: "end" },
]

export function MasterContractCdpsModal({
    isOpen,
    masterContractId,
    masterContractNumber,
    onClose,
}: Readonly<{
    isOpen: boolean
    masterContractId: string | null
    masterContractNumber: string | null
    onClose: () => void
}>) {
    // Data State
    const [items, setItems] = useState<MasterContractCdpPosition[]>([])
    const [meta, setMeta] = useState<PaginationMeta | null>(null)
    const [loading, setLoading] = useState(false)

    // Filter & Pagination State
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(5)
    
    // Search State
    const [search, setSearch] = useState("")
    const [searchInput, setSearchInput] = useState("")
    const debouncedSearch = useDebounce(searchInput, 400)
    // Removing search state as CleanTable handles its own search or we can keep it if needed.
    // The request showed search=CDP in the curl, assuming it might be a filter. 
    // Implementing basic table without complex search for now as CleanTable usually takes items.
    // Wait, CleanTable is usually for client side or simpler server tables.
    // Let's implement full server side pagination as we have meta.
    
    // Actually, CleanTable prop 'isLoading' and 'page' etc suggest it can handle server side if we pass the right props.
    // But CleanTable usually renders items effectively.
    
    // Let's reset page when modal opens
    useEffect(() => {
        if (isOpen) {
            setPage(1)
            setSearch("")
            setSearchInput("")
            // Fetch will be triggered by useEffect below on dependency change or we can call it here if dependencies allow
        }
    }, [isOpen, masterContractId]) 

    // Sync debounced search
    useEffect(() => {
        setSearch(debouncedSearch)
        setPage(1)
    }, [debouncedSearch])

    const fetchCdps = useCallback(async () => {
        if (!masterContractId) return
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sortBy: "cdp.number",
                sortOrder: "DESC"
            })
            
            if (search.trim()) {
                params.set("search", search.trim())
            }
            
            const result = await get<PaginatedData<MasterContractCdpPosition>>(
                `${endpoints.financial.masterContractCdpPositions(masterContractId)}?${params}`
            )
            setItems(result.data)
            setMeta(result.meta)
        } catch (error) {
            console.error("Error fetching master contract CDPs:", error)
        } finally {
            setLoading(false)
        }
    }, [masterContractId, page, limit, search])

    useEffect(() => {
        if (isOpen && masterContractId) {
            fetchCdps()
        }
    }, [fetchCdps, isOpen, masterContractId])


    const renderCell = (item: MasterContractCdpPosition, columnKey: React.Key) => {
        switch (columnKey) {
            case "cdpNumber":
                return (
                    <div className="flex items-center gap-2">
                        <Hash size={14} className="text-default-400" />
                        <span className="font-medium">{item.cdpNumber}</span>
                    </div>
                )
            case "positionNumber":
                return <span className="text-default-500">{item.positionNumber}</span>
            case "rubricCode":
                return (
                    <div className="flex items-center gap-2" title={item.observations}>
                        <BookOpen size={14} className="text-default-400" />
                        <span className="font-mono text-small">{item.rubricCode}</span>
                    </div>
                )
            case "fundingSourceName":
                return (
                    <div className="flex flex-col">
                        <span className="text-small">{item.fundingSourceName}</span>
                        <span className="text-tiny text-default-400 font-mono">
                            {item.fundingSourceCode}
                        </span>
                    </div>
                )
            case "projectCode":
                return (
                    <div className="flex items-center gap-2">
                        <Briefcase size={14} className="text-default-400" />
                        <span className="text-small">{item.projectCode}</span>
                    </div>
                )
            case "cdpTotalValue":
                 return <span className="font-medium text-default-600">{formatCurrency(item.cdpTotalValue)}</span>
            case "positionValue":
                return <span className="font-semibold text-success-600">{formatCurrency(item.positionValue)}</span>
            default:
                return null
        }
    }

    const renderMobileItem = (item: MasterContractCdpPosition) => (
        <Card className="bg-default-50 border border-default-200 shadow-none">
            <CardBody className="p-3 gap-2">
                <div className="flex justify-between items-start">
                    <span className="font-bold text-primary-600">
                        {item.cdpNumber} <span className="text-default-400 text-xs font-normal">#{item.positionNumber}</span>
                    </span>
                    <span className="text-xs font-semibold text-success-600">
                        {formatCurrency(item.positionValue)}
                    </span>
                </div>
                <div className="flex flex-col gap-1 text-xs text-default-500">
                    <div className="flex items-center gap-1">
                        <Briefcase size={12} /> {item.projectCode}
                    </div>
                    <div className="flex items-center gap-1">
                        <BookOpen size={12} /> {item.rubricCode}
                    </div>
                     <div className="flex items-center gap-1">
                        <DollarSign size={12} /> Total CDP: {formatCurrency(item.cdpTotalValue)}
                    </div>
                </div>
                 <div className="flex items-center gap-1 mt-1 text-xs text-foreground font-medium">
                        <Receipt size={12} className="text-default-400" /> {item.fundingSourceName}
                </div>
            </CardBody>
        </Card>
    )

    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={() => onClose()}
            size="4xl"
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
                            <FileText size={18} className="text-default-600" />
                        </div>
                        <div>
                            <span className="text-lg font-semibold text-foreground">
                                CDPs Asociados
                            </span>
                            {masterContractNumber && (
                                <p className="text-tiny text-default-400 font-normal">
                                    Contrato Marco: {masterContractNumber}
                                </p>
                            )}
                        </div>
                    </div>
                </ModalHeader>
                <ModalBody className="py-4">
                    <div className="flex justify-end gap-3 mb-4">
                         <Input
                            size="sm"
                            placeholder="Buscar CDPs..."
                            value={searchInput}
                            onValueChange={setSearchInput}
                            startContent={<Search size={16} className="text-default-400" />}
                            className="w-full sm:w-64"
                            classNames={{
                                inputWrapper: "h-9",
                            }}
                        />
                    </div>
                    <CleanTable
                        columns={columns}
                        items={items}
                        renderCell={renderCell}
                        renderMobileItem={renderMobileItem}
                        isLoading={loading}
                        page={page}
                        totalPages={meta?.totalPages}
                        onPageChange={setPage}
                        limit={limit}
                        onLimitChange={(l) => {
                            setLimit(l)
                            setPage(1)
                        }}
                        limitOptions={[5, 10, 20, 50]}
                        emptyContent={
                            <div className="flex items-center justify-center py-8 text-default-400">
                                <p className="text-small">
                                    No hay CDPs asociados a este contrato
                                </p>
                            </div>
                        }
                    />
                </ModalBody>
                <ModalFooter>
                    <Button variant="flat" onPress={onClose}>
                        Cerrar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
