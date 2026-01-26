"use client"

import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Spinner,
    SortDescriptor,
    Pagination,
    Select,
    SelectItem
} from "@heroui/react"
import { Inbox } from "lucide-react"

export type ColumnDef = {
    name: string
    uid: string
    sortable?: boolean
    align?: "start" | "center" | "end"
}

interface Props<T> {
    columns: ColumnDef[]
    items: T[]
    renderCell: (item: T, columnKey: React.Key) => React.ReactNode
    sortDescriptor?: SortDescriptor
    onSortChange?: (descriptor: SortDescriptor) => void
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
    // Mobile
    renderMobileItem?: (item: T) => React.ReactNode
    // Other
    hideHeader?: boolean
    className?: string
}

export function CleanTable<T extends { id: string | number }>({
    columns,
    items,
    renderCell,
    sortDescriptor,
    onSortChange,
    isLoading = false,
    emptyContent,
    loadingContent = <Spinner label="Cargando..." />,
    page,
    totalPages,
    onPageChange,
    limit,
    onLimitChange,
    limitOptions = [5, 10, 20, 50],
    renderMobileItem,
    hideHeader = false,
    className
}: Props<T>) {

    // Default empty content if none provided
    const defaultEmptyContent = (
        <div className="flex flex-col items-center justify-center p-10 text-default-400">
            <div className="w-16 h-16 bg-default-50 rounded-full flex items-center justify-center mb-4">
                <Inbox size={32} className="opacity-50" />
            </div>
            <p className="text-medium font-medium">Sin datos para mostrar</p>
        </div>
    )

    const showPagination = (totalPages && totalPages > 1) || onLimitChange

    return (
        <div className={`space-y-4 ${className || ""}`}>
            {/* Desktop Table */}
            <div className={renderMobileItem ? "hidden md:block" : ""}>
                <Table
                    aria-label="Tabla de datos"
                    removeWrapper
                    layout="fixed"
                    classNames={{
                        base: "min-h-[150px]",
                        th: "bg-default-50 text-default-600 font-medium h-10 first:pl-6",
                        td: "h-12 first:pl-6 border-b border-default-100 group-last:border-none",
                        tr: "hover:bg-default-50 transition-colors",
                    }}
                    sortDescriptor={sortDescriptor}
                    onSortChange={onSortChange}
                    hideHeader={hideHeader}
                >
                    <TableHeader columns={columns}>
                        {(column) => (
                            <TableColumn
                                key={column.uid}
                                allowsSorting={column.sortable ?? true}
                                align={column.align || "start"}
                            >
                                {column.name}
                            </TableColumn>
                        )}
                    </TableHeader>
                    <TableBody
                        items={items}
                        isLoading={isLoading}
                        loadingContent={loadingContent}
                        emptyContent={emptyContent || defaultEmptyContent}
                    >
                        {(item) => (
                            <TableRow key={item.id}>
                                {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile View */}
            {renderMobileItem && (
                <div className="md:hidden space-y-3">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            {loadingContent}
                        </div>
                    ) : items.length === 0 ? (
                        emptyContent || defaultEmptyContent
                    ) : (
                        items.map((item) => (
                            <div key={item.id}>
                                {renderMobileItem(item)}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Pagination & Limit Footer */}
            {showPagination && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 px-2">
                    <div className="hidden sm:block w-[30%]">
                        {/* Spacer or Total count could go here if passed as prop */}
                    </div>

                    {totalPages && totalPages > 1 && (
                        <div className="flex justify-center">
                            <Pagination
                                isCompact
                                showControls
                                showShadow
                                color="primary"
                                page={page || 1}
                                total={totalPages}
                                onChange={(p) => onPageChange?.(p)}
                                size="sm"
                            />
                        </div>
                    )}

                    {onLimitChange && limit && (
                        <div className="flex justify-end w-full sm:w-[30%]">
                            <Select
                                label="Filas"
                                size="sm"
                                variant="bordered"
                                className="max-w-[100px]"
                                selectedKeys={[limit.toString()]}
                                onChange={(e) => {
                                    if (e.target.value) onLimitChange(Number(e.target.value))
                                }}
                            >
                                {limitOptions.map(opt => (
                                    <SelectItem key={opt.toString()} textValue={opt.toString()}>
                                        {opt}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
