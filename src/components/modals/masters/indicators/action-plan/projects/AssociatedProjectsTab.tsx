"use client"

import { useCallback, useEffect, useState } from "react"
import {
    Button,
    Input,
    Tooltip,
} from "@heroui/react"
import { getActionPlanIndicatorProjects, disassociateActionPlanIndicatorProject } from "@/services/masters/indicators.service"
import { Project } from "@/types/financial"
import { Minus, X, Inbox } from "lucide-react"
import { ResourceManager } from "@/components/common/ResourceManager"
import { ColumnDef } from "@/components/tables/CleanTable"
import { addToast } from "@heroui/toast"
import { useDebounce } from "@/hooks/useDebounce"

interface Props {
    indicatorId: string | null
}

const formatCurrency = (n: string | number) => {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    }).format(Number(n))
}

export function AssociatedProjectsTab({ indicatorId }: Props) {
    const [projects, setProjects] = useState<Project[]>([])
    const [meta, setMeta] = useState<{
        total: number
        page: number
        limit: number
        totalPages: number
    } | null>(null)

    const [loading, setLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(5)
    const [search, setSearch] = useState("")
    const debouncedSearch = useDebounce(search, 500)
    
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const fetchProjects = useCallback(async () => {
        if (!indicatorId) return

        setLoading(true)
        try {
            const params = new URLSearchParams({
                type: "associated",
                limit: limit.toString(),
                page: page.toString(),
                search: debouncedSearch,
            })
            
            const res = await getActionPlanIndicatorProjects(indicatorId, params.toString())
            setProjects(res.data)
            setMeta(res.meta)
        } catch (error: any) {
            addToast({ title: "Error al cargar proyectos asociados", description: error.message, color: "danger" })
        } finally {
            setLoading(false)
        }
    }, [indicatorId, page, limit, debouncedSearch])

    useEffect(() => {
        if (indicatorId) {
            fetchProjects()
        }
    }, [indicatorId, fetchProjects])

    // Reset pagination when search changes
    useEffect(() => {
        setPage(1)
    }, [debouncedSearch])

    const handleDissociate = async (projectId: string) => {
        if (!indicatorId) return
        setActionLoading(projectId)
        try {
            await disassociateActionPlanIndicatorProject(indicatorId, projectId)
            addToast({ title: "Proyecto desasociado", color: "success" })
            fetchProjects()
        } catch (e: any) {
            addToast({ title: "Error", description: e.message, color: "danger" })
        } finally {
            setActionLoading(null)
        }
    }

    const columns: ColumnDef[] = [
        { name: "CÓDIGO", uid: "code" },
        { name: "NOMBRE", uid: "name" },
        { name: "PRESUPUESTO", uid: "currentBudget" },
        { name: "EJECUCIÓN", uid: "financialExecutionPercentage" },
        { name: "ACCIONES", uid: "actions", align: "center" },
    ]

    const renderCell = (item: Project, columnKey: React.Key) => {
        switch (columnKey) {
            case "code":
                return <span className="font-mono font-medium">{item.code}</span>
            case "name":
                return <span className="line-clamp-2 max-w-[300px]">{item.name}</span>
            case "currentBudget":
                return formatCurrency(item.currentBudget)
            case "financialExecutionPercentage":
                return (
                    <span className={`font-semibold ${
                        item.financialExecutionPercentage >= 80 ? 'text-success' : 
                        item.financialExecutionPercentage >= 50 ? 'text-warning' : 'text-danger'
                    }`}>
                        {item.financialExecutionPercentage}%
                    </span>
                )
            case "actions":
                return (
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        isLoading={actionLoading === item.id}
                        onPress={() => handleDissociate(item.id)}
                        title="Desasociar"
                    >
                        {actionLoading !== item.id && <X size={16} />}
                    </Button>
                )
            default:
                return null
        }
    }

    return (
        <ResourceManager
            columns={columns}
            items={projects}
            renderCell={renderCell}
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Buscar por nombre o código..."
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
            onRefresh={fetchProjects}
            refreshLoading={loading}
            emptyContent={
                <div className="flex flex-col items-center justify-center py-12 text-default-400">
                    <div className="w-12 h-12 rounded-xl bg-default-100 flex items-center justify-center mb-3">
                        <Inbox size={24} className="opacity-50" />
                    </div>
                    <p className="text-sm font-medium">
                        {search ? "No se encontraron proyectos para la búsqueda" : "No hay proyectos asociados"}
                    </p>
                </div>
            }
        />
    )
}
