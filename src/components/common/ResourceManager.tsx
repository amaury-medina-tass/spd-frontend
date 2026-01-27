"use client"

import { Input, Button } from "@heroui/react"
import { Search, RefreshCw, Plus } from "lucide-react"
import { CleanTable, ColumnDef } from "@/components/tables/CleanTable"
import { SortDescriptor } from "@heroui/react"

interface Props<T> {
    // Search Props
    search?: string
    onSearchChange?: (value: string) => void
    searchPlaceholder?: string
    
    // Actions
    onRefresh?: () => void
    onCreate?: () => void
    createLabel?: string
    refreshLoading?: boolean
    
    // Table Props
    columns: ColumnDef[]
    items: T[]
    renderCell: (item: T, columnKey: React.Key) => React.ReactNode
    isLoading?: boolean
    emptyContent?: React.ReactNode
    loadingContent?: React.ReactNode
    
    // Pagination & Limit
    page?: number
    totalPages?: number
    onPageChange?: (page: number) => void
    limit?: number
    onLimitChange?: (limit: number) => void
    limitOptions?: number[]
    
    // Sort
    sortDescriptor?: SortDescriptor
    onSortChange?: (descriptor: SortDescriptor) => void
    
    // Mobile
    renderMobileItem?: (item: T) => React.ReactNode
    
    // Styling
    className?: string
    hideHeader?: boolean
    
    // Additional slots
    topContent?: React.ReactNode
}

export function ResourceManager<T extends { id: string | number }>({
    search,
    onSearchChange,
    searchPlaceholder = "Buscar...",
    onRefresh,
    onCreate,
    createLabel = "Crear",
    refreshLoading = false,
    topContent,
    className,
    ...tableProps
}: Props<T>) {
    return (
        <div className={`space-y-4 ${className || ""}`}>
            <div className="flex items-center justify-between gap-3">
                {onSearchChange && (
                    <Input
                        size="sm"
                        placeholder={searchPlaceholder}
                        value={search || ""}
                        onValueChange={onSearchChange}
                        startContent={<Search size={16} className="text-default-400" />}
                        isClearable
                        onClear={() => onSearchChange("")}
                        className="max-w-xs"
                    />
                )}
                
                <div className="flex items-center gap-2">
                    {topContent}
                    
                    {onRefresh && (
                        <Button
                            size="sm"
                            variant="light"
                            startContent={<RefreshCw size={16} />}
                            isLoading={refreshLoading}
                            onPress={onRefresh}
                            isIconOnly={!onCreate}
                        >
                            {!onCreate ? null : "Actualizar"} 
                        </Button>
                    )}

                    {onCreate && (
                        <Button
                            size="sm"
                            color="primary"
                            startContent={<Plus size={16} />}
                            onPress={onCreate}
                        >
                            {createLabel}
                        </Button>
                    )}
                </div>
            </div>

            <CleanTable<T> {...tableProps} />
        </div>
    )
}
