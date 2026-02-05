"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { get, PaginatedData, PaginationMeta } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { AuditLog } from "@/types/audit"

export interface AuditFilters {
  search: string
  action: string
  entityType: string
  system: string
  startDate: string
  endDate: string
  sortBy: string
  sortOrder: "ASC" | "DESC"
}

interface UseInfiniteAuditLogsReturn {
  logs: AuditLog[]
  meta: PaginationMeta | null
  isLoading: boolean
  isLoadingMore: boolean
  error: Error | null
  hasMore: boolean
  loadMore: () => void
  refresh: () => void
  filters: AuditFilters
  setFilters: (filters: Partial<AuditFilters>) => void
  resetFilters: () => void
}

const PAGE_SIZE = 20

const DEFAULT_FILTERS: AuditFilters = {
  search: "",
  action: "",
  entityType: "",
  system: "",
  startDate: "",
  endDate: "",
  sortBy: "timestamp",
  sortOrder: "DESC",
}

export function useInfiniteAuditLogs(defaultFilters?: Partial<AuditFilters>): UseInfiniteAuditLogsReturn {
  const mergedDefaults: AuditFilters = { ...DEFAULT_FILTERS, ...defaultFilters }

  const [logs, setLogs] = useState<AuditLog[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [page, setPage] = useState(1)
  const [filters, setFiltersState] = useState<AuditFilters>(mergedDefaults)
  
  // Track if we're currently fetching to prevent duplicate requests
  const isFetchingRef = useRef(false)

  // Sync default filters when they change (e.g. tab switch)
  useEffect(() => {
    setFiltersState(prev => ({ ...prev, ...defaultFilters }))
  }, [defaultFilters?.system])

  const fetchLogs = useCallback(async (pageNum: number, isRefresh: boolean = false) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true

    if (isRefresh) {
      setIsLoading(true)
    } else if (pageNum > 1) {
      setIsLoadingMore(true)
    } else {
      setIsLoading(true)
    }
    
    setError(null)

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: PAGE_SIZE.toString(),
      })
      
      // Add filters
      if (filters.search.trim()) {
        params.set("search", filters.search.trim())
      }
      if (filters.action) {
        params.set("action", filters.action)
      }
      if (filters.entityType) {
        params.set("entityType", filters.entityType)
      }
      if (filters.system) {
        params.set("system", filters.system)
      }
      if (filters.startDate) {
        params.set("startDate", filters.startDate)
      }
      if (filters.endDate) {
        params.set("endDate", filters.endDate)
      }
      if (filters.sortBy) {
        params.set("sortBy", filters.sortBy)
      }
      if (filters.sortOrder) {
        params.set("sortOrder", filters.sortOrder)
      }

      const result = await get<PaginatedData<AuditLog>>(`${endpoints.audit}?${params}`)
      
      if (isRefresh || pageNum === 1) {
        setLogs(result.data)
      } else {
        setLogs(prev => [...prev, ...result.data])
      }
      setMeta(result.meta)
      setPage(pageNum)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Error fetching logs"))
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
      isFetchingRef.current = false
    }
  }, [filters])

  // Initial load and filter changes
  useEffect(() => {
    setPage(1)
    setLogs([])
    fetchLogs(1, true)
  }, [filters])

  // Refresh function
  const refresh = useCallback(() => {
    setPage(1)
    setLogs([])
    fetchLogs(1, true)
  }, [fetchLogs])

  // Load more function
  const loadMore = useCallback(() => {
    if (!isLoadingMore && !isLoading && meta?.hasNextPage) {
      fetchLogs(page + 1)
    }
  }, [fetchLogs, isLoading, isLoadingMore, meta?.hasNextPage, page])

  // Set filters
  const setFilters = useCallback((newFilters: Partial<AuditFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Reset filters
  const resetFilters = useCallback(() => {
    setFiltersState(mergedDefaults)
  }, [mergedDefaults])

  const hasMore = meta?.hasNextPage ?? false

  return {
    logs,
    meta,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
    filters,
    setFilters,
    resetFilters,
  }
}
