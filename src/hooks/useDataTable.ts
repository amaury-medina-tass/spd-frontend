"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import type { PaginatedData, PaginationMeta } from "@/lib/http"
import type { SortDescriptor } from "@/components/tables/DataTable"
import { getErrorMessage } from "@/lib/error-codes"
import { requestExport } from "@/services/exports.service"
import { addToast } from "@heroui/toast"

export interface UseDataTableOptions<T> {
    fetchFn: (queryString: string) => Promise<PaginatedData<T>>
    defaultSort?: SortDescriptor
    defaultLimit?: number
    errorMessage?: string
    exportConfig?: { system: string; type: string }
    sortFieldMap?: Record<string, string>
    useErrorCodes?: boolean
}

export function useDataTable<T>({
    fetchFn,
    defaultSort = { column: "name", direction: "ascending" },
    defaultLimit = 10,
    errorMessage = "Error al cargar datos",
    exportConfig,
    sortFieldMap,
    useErrorCodes = false,
}: UseDataTableOptions<T>) {
    const [items, setItems] = useState<T[]>([])
    const [meta, setMeta] = useState<PaginationMeta | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const [limit, setLimit] = useState(defaultLimit)
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>(defaultSort)
    const [searchInput, setSearchInput] = useState("")
    const debouncedSearch = useDebounce(searchInput, 400)
    const [exporting, setExporting] = useState(false)

    // Use refs for potentially unstable references (inline functions/objects)
    const fetchFnRef = useRef(fetchFn)
    fetchFnRef.current = fetchFn
    const sortFieldMapRef = useRef(sortFieldMap)
    sortFieldMapRef.current = sortFieldMap
    const exportConfigRef = useRef(exportConfig)
    exportConfigRef.current = exportConfig

    const fetchData = useCallback(async () => {
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
            if (sortDescriptor.column) {
                let sortBy = sortDescriptor.column
                if (sortFieldMapRef.current?.[sortBy]) {
                    sortBy = sortFieldMapRef.current[sortBy]
                }
                params.set("sortBy", sortBy)
                params.set("sortOrder", sortDescriptor.direction === "ascending" ? "ASC" : "DESC")
            }
            const result = await fetchFnRef.current(params.toString())
            setItems(result.data)
            setMeta(result.meta)
        } catch (e: any) {
            if (useErrorCodes) {
                const errorCode = e.data?.errors?.code
                const message = errorCode ? getErrorMessage(errorCode) : (e.message ?? errorMessage)
                setError(message)
            } else {
                setError(e.message ?? errorMessage)
            }
        } finally {
            setLoading(false)
        }
    }, [page, search, limit, sortDescriptor, errorMessage, useErrorCodes])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    useEffect(() => {
        setSearch(debouncedSearch)
        setPage(1)
    }, [debouncedSearch])

    const handleExport = useCallback(async () => {
        if (!exportConfigRef.current) return
        try {
            setExporting(true)
            await requestExport(exportConfigRef.current)
            addToast({
                title: "Exportación solicitada",
                description: "Recibirás una notificación cuando el archivo esté listo para descargar.",
                color: "primary",
                timeout: 5000,
            })
        } catch {
            addToast({
                title: "Error",
                description: "No se pudo solicitar la exportación. Intenta de nuevo.",
                color: "danger",
                timeout: 5000,
            })
        } finally {
            setExporting(false)
        }
    }, [])

    const paginationProps = meta ? {
        page,
        totalPages: meta.totalPages,
        onChange: setPage,
        pageSize: limit,
        onPageSizeChange: (newLimit: number) => {
            setLimit(newLimit)
            setPage(1)
        },
    } : undefined

    return {
        items,
        loading,
        error,
        searchInput,
        setSearchInput,
        sortDescriptor,
        setSortDescriptor,
        fetchData,
        exporting,
        handleExport,
        paginationProps,
    }
}
