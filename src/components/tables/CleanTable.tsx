"use client"

import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Spinner,
    SortDescriptor
} from "@heroui/react"

export type ColumnDef = {
    name: string
    uid: string
    sortable?: boolean
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
}: Props<T>) {
    return (
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
        >
            <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn
                        key={column.uid}
                        allowsSorting={column.sortable ?? true}
                    >
                        {column.name}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody
                items={items}
                isLoading={isLoading}
                loadingContent={loadingContent}
                emptyContent={emptyContent}
            >
                {(item) => (
                    <TableRow key={item.id}>
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}
