"use client"

import { Button, SortDescriptor, Select, SelectItem, Input } from "@heroui/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction } from "@/components/tables/DataTable"
import { useDebounce } from "@/hooks/useDebounce"
import { usePermissions } from "@/hooks/usePermissions"
import { get, post, patch, del, PaginatedData, PaginationMeta } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { RefreshCw, Eye, Pencil, Plus, Trash2 } from "lucide-react"
import { addToast } from "@heroui/toast"
import type { PoaiPpa, ProjectSelectItem } from "@/types/financial"
import { getErrorMessage } from "@/lib/error-codes"
import { ConfirmationModal } from "@/components/modals/ConfirmationModal"
import { CreatePoaiPpaModal } from "@/components/modals/financial/poai-ppa/CreatePoaiPpaModal"
import { EditPoaiPpaModal } from "@/components/modals/financial/poai-ppa/EditPoaiPpaModal"
import { ViewPoaiPpaModal } from "@/components/modals/financial/poai-ppa/ViewPoaiPpaModal"

const columns: ColumnDef<PoaiPpa>[] = [
    { key: "projectCode", label: "Código Proyecto", sortable: true },
    { key: "year", label: "Año", sortable: true },
    {
        key: "projectedPoai",
        label: "POAI Proyectado",
        sortable: true,
        render: (record) => {
            const value = parseFloat(record.projectedPoai)
            return new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0,
            }).format(value)
        },
    },
    {
        key: "assignedPoai",
        label: "POAI Asignado",
        sortable: true,
        render: (record) => {
            const value = parseFloat(record.assignedPoai)
            return new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0,
            }).format(value)
        },
    },
    {
        key: "project.name",
        label: "Proyecto",
        sortable: false,
        render: (record) => record.project?.name ?? "N/A",
    },
    {
        key: "createAt",
        label: "Creado",
        sortable: true,
        render: (record) => new Date(record.createAt).toLocaleDateString("es-CO"),
    },
]

export function PoaiPpaTableTab() {
    const { canCreate, canUpdate, canDelete } = usePermissions("/financial/poai-ppa")

    // Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [selectedRecord, setSelectedRecord] = useState<PoaiPpa | null>(null)
    const [recordToDelete, setRecordToDelete] = useState<PoaiPpa | null>(null)
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // Table State
    const [items, setItems] = useState<PoaiPpa[]>([])
    const [meta, setMeta] = useState<PaginationMeta | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [limit, setLimit] = useState(10)
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "year",
        direction: "descending",
    })
    const [searchInput, setSearchInput] = useState("")
    const debouncedSearch = useDebounce(searchInput, 400)

    // Filter State
    const [yearFilter, setYearFilter] = useState<string>("")
    const [projectFilter, setProjectFilter] = useState<string>("")
    const [projects, setProjects] = useState<ProjectSelectItem[]>([])

    // Fetch projects for filter
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const result = await get<{ data: ProjectSelectItem[] }>(`${endpoints.financial.projectsSelect}?limit=100`)
                setProjects(result.data)
            } catch (e) {
                console.error("Error fetching projects for filter", e)
            }
        }
        fetchProjects()
    }, [])

    const fetchRecords = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            })
            if (search.trim()) {
                params.set("search", search.trim())
            }
            if (yearFilter) {
                params.set("year", yearFilter)
            }
            if (projectFilter) {
                params.set("projectId", projectFilter)
            }
            if (sortDescriptor.column) {
                params.set("sortBy", sortDescriptor.column as string)
                params.set("sortOrder", sortDescriptor.direction === "ascending" ? "ASC" : "DESC")
            }

            const result = await get<PaginatedData<PoaiPpa>>(`${endpoints.financial.poaiPpa}?${params}`)
            setItems(result.data)
            setMeta(result.meta)
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : (e.message ?? "Error al cargar registros POAI PPA")
            setError(message)
        } finally {
            setLoading(false)
        }
    }, [page, search, limit, sortDescriptor, yearFilter, projectFilter])

    useEffect(() => {
        fetchRecords()
    }, [fetchRecords])

    useEffect(() => {
        setSearch(debouncedSearch)
        setPage(1)
    }, [debouncedSearch])

    const topActions: TopAction[] = useMemo(() => {
        const actions: TopAction[] = [
            {
                key: "refresh",
                label: "Actualizar",
                icon: <RefreshCw size={16} />,
                color: "default",
                onClick: fetchRecords,
            },
        ]
        if (canCreate) {
            actions.push({
                key: "create",
                label: "Crear",
                icon: <Plus size={16} />,
                color: "primary",
                onClick: () => setIsCreateModalOpen(true),
            })
        }
        return actions
    }, [fetchRecords, canCreate])

    const onViewRecord = async (record: PoaiPpa) => {
        try {
            const fullRecord = await get<PoaiPpa>(`${endpoints.financial.poaiPpa}/${record.id}`)
            setSelectedRecord(fullRecord)
            setIsViewModalOpen(true)
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al obtener detalles del registro"
            addToast({ title: message, color: "danger" })
        }
    }

    const onEditRecord = async (record: PoaiPpa) => {
        try {
            const fullRecord = await get<PoaiPpa>(`${endpoints.financial.poaiPpa}/${record.id}`)
            setSelectedRecord(fullRecord)
            setIsEditModalOpen(true)
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al obtener detalles del registro"
            addToast({ title: message, color: "danger" })
        }
    }

    const onDeleteRecord = (record: PoaiPpa) => {
        setRecordToDelete(record)
        setIsDeleteModalOpen(true)
    }

    const onCreateRecord = async (data: { projectId: string; projectCode: string; year: number; projectedPoai: number; assignedPoai: number }) => {
        setSaving(true)
        try {
            await post(endpoints.financial.poaiPpa, data)
            addToast({ title: "Registro POAI PPA creado correctamente", color: "success" })
            setIsCreateModalOpen(false)
            fetchRecords()
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al crear el registro"
            addToast({ title: message, color: "danger" })
        } finally {
            setSaving(false)
        }
    }

    const onSaveRecord = async (data: { projectedPoai: number; assignedPoai: number }) => {
        if (!selectedRecord) return
        setSaving(true)
        try {
            await patch(`${endpoints.financial.poaiPpa}/${selectedRecord.id}`, data)
            addToast({ title: "Registro POAI PPA actualizado correctamente", color: "success" })
            setIsEditModalOpen(false)
            setSelectedRecord(null)
            fetchRecords()
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al actualizar el registro"
            addToast({ title: message, color: "danger" })
        } finally {
            setSaving(false)
        }
    }

    const confirmDeleteRecord = async () => {
        if (!recordToDelete) return
        setDeleting(true)
        try {
            await del(`${endpoints.financial.poaiPpa}/${recordToDelete.id}`)
            addToast({ title: "Registro POAI PPA eliminado correctamente", color: "success" })
            setIsDeleteModalOpen(false)
            setRecordToDelete(null)
            fetchRecords()
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al eliminar el registro"
            addToast({ title: message, color: "danger" })
        } finally {
            setDeleting(false)
        }
    }

    const rowActions: RowAction<PoaiPpa>[] = useMemo(() => {
        const actions: RowAction<PoaiPpa>[] = [
            {
                key: "view",
                label: "Ver Detalles",
                icon: <Eye size={16} />,
                onClick: onViewRecord,
            },
        ]
        if (canUpdate) {
            actions.push({
                key: "edit",
                label: "Editar",
                icon: <Pencil size={16} />,
                onClick: onEditRecord,
            })
        }
        if (canDelete) {
            actions.push({
                key: "delete",
                label: "Eliminar",
                icon: <Trash2 size={16} />,
                color: "danger",
                onClick: onDeleteRecord,
            })
        }
        return actions
    }, [canUpdate, canDelete])

    // Generate year options (last 10 years + next 10 years)
    const currentYear = new Date().getFullYear()
    const yearOptions = Array.from({ length: 20 }, (_, i) => currentYear - 10 + i)

    if (error) {
        return (
            <div className="text-center py-8 text-danger">
                <p>{error}</p>
                <Button variant="flat" className="mt-2" onPress={fetchRecords}>
                    Reintentar
                </Button>
            </div>
        )
    }

    return (
        <>
            {/* Filters */}
            <div className="flex gap-4 flex-wrap">
                <Select
                    label="Filtrar por Año"
                    placeholder="Todos los años"
                    className="w-48"
                    size="sm"
                    selectedKeys={yearFilter ? [yearFilter] : []}
                    onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0]?.toString() || ""
                        setYearFilter(selected)
                        setPage(1)
                    }}
                >
                    {yearOptions.map((year) => (
                        <SelectItem key={year.toString()}>{year.toString()}</SelectItem>
                    ))}
                </Select>

                <Select
                    label="Filtrar por Proyecto"
                    placeholder="Todos los proyectos"
                    className="w-64"
                    size="sm"
                    selectedKeys={projectFilter ? [projectFilter] : []}
                    onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0]?.toString() || ""
                        setProjectFilter(selected)
                        setPage(1)
                    }}
                >
                    {projects.map((project) => (
                        <SelectItem key={project.id}>{`${project.code} - ${project.name}`}</SelectItem>
                    ))}
                </Select>

                {(yearFilter || projectFilter) && (
                    <Button
                        variant="flat"
                        size="sm"
                        onPress={() => {
                            setYearFilter("")
                            setProjectFilter("")
                            setPage(1)
                        }}
                    >
                        Limpiar filtros
                    </Button>
                )}
            </div>

            <DataTable
                items={items}
                columns={columns}
                isLoading={loading}
                rowActions={rowActions}
                topActions={topActions}
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                searchPlaceholder="Buscar registros POAI PPA..."
                ariaLabel="Tabla de registros POAI PPA"
                pagination={meta ? {
                    page: page,
                    totalPages: meta.totalPages,
                    onChange: setPage,
                    pageSize: limit,
                    onPageSizeChange: (newLimit) => {
                        setLimit(newLimit)
                        setPage(1)
                    }
                } : undefined}
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
            />

            <CreatePoaiPpaModal
                isOpen={isCreateModalOpen}
                isLoading={saving}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={onCreateRecord}
            />

            <EditPoaiPpaModal
                isOpen={isEditModalOpen}
                record={selectedRecord}
                isLoading={saving}
                onClose={() => {
                    setIsEditModalOpen(false)
                    setSelectedRecord(null)
                }}
                onSave={onSaveRecord}
            />

            <ViewPoaiPpaModal
                isOpen={isViewModalOpen}
                record={selectedRecord}
                onClose={() => {
                    setIsViewModalOpen(false)
                    setSelectedRecord(null)
                }}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    setIsDeleteModalOpen(false)
                    setRecordToDelete(null)
                }}
                onConfirm={confirmDeleteRecord}
                title="Eliminar Registro POAI PPA"
                description={`¿Estás seguro de eliminar el registro del proyecto "${recordToDelete?.projectCode}" para el año ${recordToDelete?.year}? Esta acción no se puede deshacer.`}
                isLoading={deleting}
                confirmText="Eliminar"
                confirmColor="danger"
            />
        </>
    )
}
