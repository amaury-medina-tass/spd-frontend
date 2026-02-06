"use client"

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Select, SelectItem, Tabs, Tab, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Pagination, Input, Textarea, Tooltip, Chip } from "@heroui/react"
import { useCallback, useEffect, useState } from "react"
import { VariableWithAdvances } from "@/types/sub/variable-advances"
import { getVariableAdvancesByActionIndicator, getVariableAdvancesByIndicativeIndicator, createVariableAdvance } from "@/services/sub/variable-advances.service"
import { getCommunesSelect, Commune } from "@/services/masters/communes.service"
import { Calendar, Search, Eye, Plus, Loader2 } from "lucide-react"
import { addToast } from "@heroui/toast"
import { PaginatedData, PaginationMeta } from "@/lib/http"
import { useDebounce } from "@/hooks/useDebounce"

interface VariableAdvancesModalProps {
    isOpen: boolean
    onClose: () => void
    indicatorId: string | null
    indicatorCode?: string
    type: "action" | "indicative"
}

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

export function VariableAdvancesModal({ isOpen, onClose, indicatorId, indicatorCode, type }: VariableAdvancesModalProps) {
    const [year, setYear] = useState<number>(new Date().getFullYear())
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<VariableWithAdvances[]>([])
    const [error, setError] = useState<string | null>(null)
    const [meta, setMeta] = useState<PaginationMeta | null>(null)

    // Pagination & Search for Variables
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(5)
    const [search, setSearch] = useState("")
    const debouncedSearch = useDebounce(search, 500)

    // Mini-modal for observations
    const [isObsModalOpen, setIsObsModalOpen] = useState(false)
    const [selectedObs, setSelectedObs] = useState<string>("")

    // Create Advance Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedVariableId, setSelectedVariableId] = useState<string | null>(null)

    // Communes state
    const [communes, setCommunes] = useState<Commune[]>([])
    const [loadingCommunes, setLoadingCommunes] = useState(false)

    // Form state for creating advances
    const [formLoading, setFormLoading] = useState(false)
    const [formErrors, setFormErrors] = useState<{ value?: string; month?: string }>({})
    const [newAdvance, setNewAdvance] = useState({
        month: (new Date().getMonth() + 1).toString(),
        value: "",
        observations: "",
        communeIds: [] as string[]
    })

    const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i)

    const fetchData = useCallback(async () => {
        if (!indicatorId) return
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams({
                year: year.toString(),
                page: page.toString(),
                limit: limit.toString(),
            })

            if (debouncedSearch) {
                params.set("search", debouncedSearch)
            }

            let result: PaginatedData<VariableWithAdvances>;
            if (type === "action") {
                result = await getVariableAdvancesByActionIndicator(indicatorId, params.toString())
            } else {
                result = await getVariableAdvancesByIndicativeIndicator(indicatorId, params.toString())
            }

            const mappedData = result.data.map(item => ({ ...item, id: item.variableId }))
            setData(mappedData)
            setMeta(result.meta)
        } catch (e: any) {
            const msg = e.message || "Error al cargar avances"
            setError(msg)
            addToast({ title: "Error", description: msg, color: "danger" })
        } finally {
            setLoading(false)
        }
    }, [indicatorId, year, page, limit, debouncedSearch, type])

    useEffect(() => {
        if (isOpen && indicatorId) {
            fetchData()
            fetchCommunes()
        } else if (!isOpen) {
            setData([])
            setMeta(null)
            setSearch("")
            setFormErrors({})
        }
    }, [isOpen, indicatorId, fetchData])

    const fetchCommunes = async () => {
        setLoadingCommunes(true)
        try {
            const params = new URLSearchParams({
                page: "1",
                limit: "100"
            })
            const result = await getCommunesSelect(params.toString())
            setCommunes(result.data)
        } catch (e: any) {
            console.error("Error loading communes:", e)
        } finally {
            setLoadingCommunes(false)
        }
    }

    useEffect(() => {
        setPage(1)
    }, [debouncedSearch, year])

    const openCreateModal = (variableId: string) => {
        setSelectedVariableId(variableId)
        setNewAdvance({
            month: (new Date().getMonth() + 1).toString(),
            value: "",
            observations: "",
            communeIds: []
        })
        setFormErrors({})
        setIsCreateModalOpen(true)
    }

    const handleCreateAdvance = async () => {
        if (!selectedVariableId) return

        const errors: { value?: string; month?: string } = {}
        if (!newAdvance.value) {
            errors.value = "El valor es obligatorio"
        }
        if (!newAdvance.month) {
            errors.month = "El mes es obligatorio"
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            return
        }

        setFormLoading(true)
        setFormErrors({})
        try {
            await createVariableAdvance({
                variableId: selectedVariableId,
                year,
                month: Number(newAdvance.month),
                value: Number(newAdvance.value),
                observations: newAdvance.observations,
                communeIds: newAdvance.communeIds.length > 0 ? newAdvance.communeIds : undefined
            })

            addToast({ title: "Éxito", description: "Avance registrado correctamente", color: "success" })
            setIsCreateModalOpen(false)
            fetchData() // Refresh list
        } catch (e: any) {
            const msg = e.message || "Error al guardar avance"
            addToast({ title: "Error", description: msg, color: "danger" })
        } finally {
            setFormLoading(false)
        }
    }

    const openObsModal = (obs: string) => {
        setSelectedObs(obs)
        setIsObsModalOpen(true)
    }

    return (
        <>
            <Modal size="4xl" isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1 border-b border-divider">
                                Avances de Variables - {indicatorCode}
                            </ModalHeader>
                            <ModalBody className="p-4">
                                <div className="flex flex-col sm:flex-row gap-4 justify-between items-end sm:items-center mb-4">
                                    <Input
                                        classNames={{
                                            base: "max-w-full sm:max-w-[15rem] h-10",
                                            mainWrapper: "h-full",
                                            input: "text-small",
                                            inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
                                        }}
                                        placeholder="Buscar variable..."
                                        size="sm"
                                        startContent={<Search size={18} />}
                                        type="search"
                                        value={search}
                                        onValueChange={setSearch}
                                    />
                                    <Select
                                        label="Año del Avance"
                                        placeholder="Seleccionar año"
                                        selectedKeys={[year.toString()]}
                                        className="max-w-xs sm:max-w-[12rem]"
                                        size="sm"
                                        onChange={(e) => setYear(Number(e.target.value))}
                                        startContent={<Calendar size={16} />}
                                        disallowEmptySelection
                                    >
                                        {years.map((y) => (
                                            <SelectItem key={y.toString()}>
                                                {y.toString()}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                </div>

                                {loading ? (
                                    <div className="flex justify-center py-12">
                                        <Loader2 className="animate-spin h-8 w-8 text-primary" />
                                    </div>
                                ) : data.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-default-400 border rounded-lg border-dashed">
                                        <p className="text-sm font-medium">No se encontraron variables</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        <Tabs aria-label="Variables" items={data} variant="underlined" color="primary">
                                            {(item) => (
                                                <Tab key={item.id} title={item.variableCode}>
                                                    <div className="pt-2 flex flex-col gap-6">
                                                        {/* Details Card */}
                                                        <div className="p-4 bg-default-50 rounded-xl border border-divider">
                                                            <div className="flex justify-between items-start">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-small flex-1">
                                                                    <div>
                                                                        <p className="text-default-500 font-medium">Nombre de la Variable</p>
                                                                        <p className="font-semibold text-foreground">{item.variableName}</p>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-default-500 font-medium">Valor Calculado ({year})</p>
                                                                        <p className="font-bold text-primary text-lg">{item.calculatedValue}</p>
                                                                    </div>
                                                                    <div className="md:col-span-2 text-tiny text-default-400">
                                                                        Última actualización: {new Date(item.lastCalculationDate).toLocaleString()}
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    color="primary"
                                                                    variant="flat"
                                                                    size="sm"
                                                                    startContent={<Plus size={16} />}
                                                                    onPress={() => openCreateModal(item.variableId)}
                                                                >
                                                                    Registrar Avance
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Advances Table */}
                                                        {item.advances && item.advances.length > 0 ? (
                                                            <div className="rounded-xl border border-divider overflow-hidden">
                                                                <Table aria-label="Tabla de avances" shadow="none">
                                                                    <TableHeader>
                                                                        <TableColumn>MES</TableColumn>
                                                                        <TableColumn>VALOR</TableColumn>
                                                                        <TableColumn>FECHA REPORTE</TableColumn>
                                                                        <TableColumn>OBSERVACIONES</TableColumn>
                                                                        <TableColumn align="center">ACCIONES</TableColumn>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {item.advances.map((advance) => (
                                                                            <TableRow key={advance.id} className="last:border-0 border-b border-divider/50">
                                                                                <TableCell className="font-medium text-primary">
                                                                                    {MONTHS[advance.month - 1]}
                                                                                </TableCell>
                                                                                <TableCell className="font-bold">
                                                                                    {Number(advance.value)}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    {new Date(advance.createAt).toLocaleDateString()}
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    <span className="block max-w-[150px] md:max-w-xs truncate text-default-500 italic" title={advance.observations}>
                                                                                        {advance.observations || "—"}
                                                                                    </span>
                                                                                </TableCell>
                                                                                <TableCell>
                                                                                    {advance.observations && (
                                                                                        <Tooltip content="Ver observaciones">
                                                                                            <Button
                                                                                                isIconOnly
                                                                                                size="sm"
                                                                                                variant="light"
                                                                                                onPress={() => openObsModal(advance.observations)}
                                                                                            >
                                                                                                <Eye size={18} className="text-default-500" />
                                                                                            </Button>
                                                                                        </Tooltip>
                                                                                    )}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-10 bg-default-50 rounded-xl border border-dashed border-divider text-default-400 italic">
                                                                No hay avances registrados para {year}.
                                                            </div>
                                                        )}
                                                    </div>
                                                </Tab>
                                            )}
                                        </Tabs>

                                        {/* Pagination */}
                                        {meta && meta.totalPages > 1 && (
                                            <div className="flex justify-center mt-4 border-t border-divider pt-4">
                                                <Pagination
                                                    total={meta.totalPages}
                                                    page={page}
                                                    onChange={setPage}
                                                    size="sm"
                                                    showControls
                                                    color="primary"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </ModalBody>
                            <ModalFooter className="border-t border-divider">
                                <Button color="danger" variant="light" onPress={onClose}>
                                    Cerrar
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            {/* Create Advance Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)}>
                <ModalContent>
                    <ModalHeader className="border-b border-divider">Registrar Nuevo Avance</ModalHeader>
                    <ModalBody className="py-6 flex flex-col gap-4">
                        <Select
                            label="Mes"
                            selectedKeys={[newAdvance.month]}
                            onChange={(e) => {
                                setNewAdvance({ ...newAdvance, month: e.target.value })
                                if (formErrors.month) setFormErrors({ ...formErrors, month: undefined })
                            }}
                            className="max-w-full"
                            isInvalid={!!formErrors.month}
                            errorMessage={formErrors.month}
                            color={formErrors.month ? "danger" : "default"}
                        >
                            {MONTHS.map((name, i) => (
                                <SelectItem key={(i + 1).toString()}>{name}</SelectItem>
                            ))}
                        </Select>
                        <Input
                            label="Valor"
                            type="number"
                            value={newAdvance.value}
                            onValueChange={(val) => {
                                setNewAdvance({ ...newAdvance, value: val })
                                if (formErrors.value) setFormErrors({ ...formErrors, value: undefined })
                            }}
                            placeholder="0.00"
                            isInvalid={!!formErrors.value}
                            errorMessage={formErrors.value}
                            color={formErrors.value ? "danger" : "default"}
                        />
                        <Select
                            label="Comunas / Corregimientos (Opcional)"
                            placeholder="Seleccionar ubicaciones"
                            selectionMode="multiple"
                            selectedKeys={newAdvance.communeIds}
                            onSelectionChange={(keys) => {
                                const selectedKeys = Array.from(keys) as string[]
                                setNewAdvance({ ...newAdvance, communeIds: selectedKeys })
                            }}
                            className="max-w-full"
                            isLoading={loadingCommunes}
                            description="Seleccione las comunas/corregimientos donde aplica este avance"
                            renderValue={(items) => {
                                if (items.length === 0) return null
                                if (items.length <= 2) {
                                    return (
                                        <div className="flex gap-1 flex-wrap">
                                            {items.map((item) => {
                                                const commune = communes.find(c => c.id === item.key)
                                                return commune ? (
                                                    <Chip key={item.key} size="sm" variant="flat">
                                                        {commune.code} - {commune.name}
                                                    </Chip>
                                                ) : null
                                            })}
                                        </div>
                                    )
                                }
                                return (
                                    <div className="flex gap-1 items-center">
                                        <Chip size="sm" variant="flat">{items.length} comunas seleccionadas</Chip>
                                    </div>
                                )
                            }}
                        >
                            {communes.map((commune) => (
                                <SelectItem key={commune.id} value={commune.id}>
                                    {commune.code} - {commune.name}
                                </SelectItem>
                            ))}
                        </Select>
                        <Textarea
                            label="Observaciones"
                            placeholder="Escribe aquí los detalles del avance..."
                            value={newAdvance.observations}
                            onValueChange={(val) => setNewAdvance({ ...newAdvance, observations: val })}
                            minRows={3}
                        />
                    </ModalBody>
                    <ModalFooter className="border-t border-divider">
                        <Button variant="light" onPress={() => setIsCreateModalOpen(false)}>
                            Cancelar
                        </Button>
                        <Button color="primary" onPress={handleCreateAdvance} isLoading={formLoading}>
                            Guardar Avance
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>

            {/* Observations Mini-Modal */}
            <Modal size="md" isOpen={isObsModalOpen} onClose={() => setIsObsModalOpen(false)}>
                <ModalContent>
                    <ModalHeader className="border-b border-divider">Observaciones del Avance</ModalHeader>
                    <ModalBody className="py-6">
                        <p className="text-default-700 whitespace-pre-wrap leading-relaxed">
                            {selectedObs}
                        </p>
                    </ModalBody>
                    <ModalFooter className="border-t border-divider">
                        <Button color="primary" variant="flat" onPress={() => setIsObsModalOpen(false)}>
                            Entendido
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}
