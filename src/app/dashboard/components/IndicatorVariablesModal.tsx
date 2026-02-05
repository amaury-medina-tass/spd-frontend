"use client"

import { Modal, ModalContent, ModalHeader, ModalBody, Spinner, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@heroui/react"
import { useCallback, useEffect, useState } from "react"
import { getIndicatorLocationVariables } from "@/services/masters/indicators.service"
import { PaginationMeta } from "@/lib/http"

interface VariableData {
    variable: {
        id: string
        code: string
        name: string
        observations: string | null
        createAt: string
        updateAt: string
    }
    matchType: string
}

interface IndicatorVariablesModalProps {
    isOpen: boolean
    onClose: () => void
    indicatorId: string | null
    indicatorCode?: string
    type: 'indicative' | 'action'
}

export function IndicatorVariablesModal({ isOpen, onClose, indicatorId, indicatorCode, type }: IndicatorVariablesModalProps) {
    const [variables, setVariables] = useState<VariableData[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [meta, setMeta] = useState<PaginationMeta | null>(null)

    const fetchVariables = useCallback(async () => {
        if (!indicatorId) return

        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams({
                page: "1",
                limit: "50",
            })
            const result = await getIndicatorLocationVariables(indicatorId, type, params.toString())
            setVariables(result.data)
            setMeta(result.meta)
        } catch (e: any) {
            setError(e.message ?? "Error al cargar variables")
        } finally {
            setLoading(false)
        }
    }, [indicatorId, type])

    useEffect(() => {
        if (isOpen && indicatorId) {
            fetchVariables()
        } else {
            setVariables([])
            setError(null)
        }
    }, [isOpen, indicatorId, fetchVariables])

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <span>Variables Asociadas</span>
                    {indicatorCode && (
                        <span className="text-sm font-normal text-default-500">
                            Indicador: {indicatorCode}
                        </span>
                    )}
                </ModalHeader>
                <ModalBody className="pb-6">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <Spinner size="lg" />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-danger">
                            <p>{error}</p>
                        </div>
                    ) : variables.length === 0 ? (
                        <div className="text-center py-8 text-default-500">
                            <p>No hay variables asociadas a este indicador en esta ubicación.</p>
                        </div>
                    ) : (
                        <Table aria-label="Tabla de variables asociadas" removeWrapper>
                            <TableHeader>
                                <TableColumn>Código</TableColumn>
                                <TableColumn>Nombre</TableColumn>
                                <TableColumn>Tipo de Coincidencia</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {variables.map((item) => (
                                    <TableRow key={item.variable.id}>
                                        <TableCell>
                                            <span className="font-mono text-sm">{item.variable.code}</span>
                                        </TableCell>
                                        <TableCell>{item.variable.name}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.matchType === 'direct' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary'}`}>
                                                {item.matchType === 'direct' ? 'Directa' : item.matchType === 'location' ? 'Por Ubicación' : item.matchType}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                    {meta && variables.length > 0 && (
                        <div className="text-center text-sm text-default-500 mt-4">
                            Mostrando {variables.length} de {meta.total} variables
                        </div>
                    )}
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}
