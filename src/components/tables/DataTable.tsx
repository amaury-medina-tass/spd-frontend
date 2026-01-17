"use client"

import {
    Button,
    Chip,
    Input,
    Pagination,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    SortDescriptor,
} from "@heroui/react"
import { MoreVertical, Inbox, ChevronDown } from "lucide-react"
import { ReactNode } from "react"


/** Definición de columna */
export interface ColumnDef<T> {
    key: string
    label: string
    render?: (item: T) => ReactNode
    sortable?: boolean
    className?: string
}

/** Acción de fila (para cada elemento) */
export interface RowAction<T> {
    key: string
    label: string
    icon?: ReactNode
    color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger"
    onClick: (item: T) => void
}

/** Acción de barra superior */
export interface TopAction {
    key: string
    label: string
    icon?: ReactNode
    color?: "default" | "primary" | "secondary" | "success" | "warning" | "danger"
    onClick: () => void
}

/** Props de paginación */
export interface PaginationProps {
    page: number
    totalPages: number
    onChange: (page: number) => void
    pageSize?: number
    onPageSizeChange?: (size: number) => void
    pageSizeOptions?: number[]
}

interface DataTableProps<T extends { id: string }> {
    items: T[]
    columns: ColumnDef<T>[]
    /** Estado de carga */
    isLoading?: boolean
    /** Descriptor de ordenamiento */
    sortDescriptor?: SortDescriptor
    /** Callback de cambio de ordenamiento */
    onSortChange?: (descriptor: SortDescriptor) => void
    /** Acciones para cada fila (aparecen en menú dropdown) */
    rowActions?: RowAction<T>[]
    /** Acciones en la barra superior (junto al buscador) */
    topActions?: TopAction[]
    /** Búsqueda */
    searchValue?: string
    onSearchChange?: (value: string) => void
    searchPlaceholder?: string
    /** Paginación */
    pagination?: PaginationProps
    /** Mensaje cuando no hay datos */
    emptyContent?: ReactNode
    /** Aria label para la tabla */
    ariaLabel?: string
}

export function DataTable<T extends { id: string }>({
    items,
    columns,
    isLoading = false,
    sortDescriptor,
    onSortChange,
    rowActions,
    topActions,
    searchValue,
    onSearchChange,
    searchPlaceholder = "Buscar...",
    pagination,
    emptyContent,
    ariaLabel = "Tabla de datos",
}: DataTableProps<T>) {
    // Agregar columna de acciones si hay rowActions
    const allColumns = rowActions?.length
        ? [...columns, { key: "_actions", label: "Acciones" }]
        : columns

    const renderCell = (item: T, columnKey: string) => {
        if (columnKey === "_actions" && rowActions?.length) {
            return (
                <Dropdown>
                    <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
                            <MoreVertical size={16} />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Acciones">
                        {rowActions.map((action) => (
                            <DropdownItem
                                key={action.key}
                                color={action.color}
                                startContent={action.icon}
                                onPress={() => action.onClick(item)}
                            >
                                {action.label}
                            </DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>
            )
        }

        const column = columns.find((c) => c.key === columnKey)
        if (column?.render) {
            return column.render(item)
        }

        // Acceso genérico a la propiedad
        const value = (item as Record<string, unknown>)[columnKey]

        // Renderizado básico para booleanos
        if (typeof value === "boolean") {
            return (
                <Chip color={value ? "success" : "danger"} variant="flat" size="sm">
                    {value ? "Activo" : "Inactivo"}
                </Chip>
            )
        }

        return value as ReactNode
    }

    // Contenido vacío mejorado
    const defaultEmptyContent = (
        <div className="flex flex-col items-center justify-center py-10 text-default-400">
            <Inbox size={48} className="mb-3 opacity-50" />
            <p className="text-lg font-medium">No hay registros</p>
            <p className="text-sm">No se encontraron datos para mostrar</p>
        </div>
    )

    const topContent = (
        <div className="flex justify-between items-center gap-4">
            {onSearchChange ? (
                <Input
                    placeholder={searchPlaceholder}
                    size="sm"
                    className="w-full sm:w-64"
                    value={searchValue}
                    onValueChange={onSearchChange}
                />
            ) : (
                <div />
            )}
            {topActions?.length ? (
                <div className="flex gap-2">
                    {topActions.map((action) => (
                        <Button
                            key={action.key}
                            color={action.color ?? "primary"}
                            onPress={action.onClick}
                            startContent={action.icon}
                            className="hidden sm:flex"
                        >
                            {action.label}
                        </Button>
                    ))}
                    {topActions.map((action) => (
                        <Button
                            key={action.key + "-mobile"}
                            isIconOnly
                            color={action.color ?? "primary"}
                            onPress={action.onClick}
                            className="flex sm:hidden"
                        >
                            {action.icon}
                        </Button>
                    ))}
                </div>
            ) : null}
        </div>
    )

    const bottomContent = pagination && pagination.totalPages > 0 ? (
        <div className="flex flex-col sm:flex-row justify-between items-center px-2 py-2 gap-2">
            <div className="hidden sm:flex flex-1 w-[30%]" /> {/* Spacer only on desktop */}
            <div className="flex justify-center flex-1">
                <Pagination
                    total={pagination.totalPages}
                    page={pagination.page}
                    onChange={pagination.onChange}
                    showControls
                    color="primary"
                    variant="light"
                    size="sm"
                    className="gap-1 sm:gap-2"
                />
            </div>
            <div className="flex justify-end items-center gap-2 flex-1 w-full sm:w-[30%]">
                {pagination.onPageSizeChange && (
                    <div className="flex items-center gap-2 text-small text-default-400 w-full justify-center sm:justify-end">
                        <span>Filas por página:</span>
                        <Dropdown>
                            <DropdownTrigger>
                                <Button
                                    variant="flat"
                                    color="default"
                                    size="sm"
                                    className="min-w-16"
                                    endContent={<ChevronDown size={14} className="text-default-500" />}
                                >
                                    {pagination.pageSize ?? 10}
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                aria-label="Seleccionar filas por página"
                                onAction={(key) => pagination.onPageSizeChange?.(Number(key))}
                                selectionMode="single"
                                selectedKeys={new Set([String(pagination.pageSize ?? 10)])}
                            >
                                {(pagination.pageSizeOptions ?? [5, 10, 20, 50]).map((option) => (
                                    <DropdownItem key={option} textValue={String(option)}>
                                        {option}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                )}
            </div>
        </div>
    ) : null

    return (
        <Table
            aria-label={ariaLabel}
            topContent={topContent}
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            sortDescriptor={sortDescriptor}
            onSortChange={onSortChange}
            isHeaderSticky
            classNames={{
                wrapper: "min-h-[222px] overflow-x-auto max-w-[calc(100vw-2rem)] md:max-w-full",
                table: "min-w-[600px]",
                th: "bg-default-100 text-default-600 font-medium shadow-none group-data-[sticky=true]:shadow-none",
            }}
        >
            <TableHeader columns={allColumns}>
                {(column) => (
                    <TableColumn
                        key={column.key}
                        allowsSorting={column.sortable}
                        className={(column as any).className}
                    >
                        {column.label}
                    </TableColumn>
                )}
            </TableHeader>

            <TableBody
                items={isLoading ? [] : items}
                emptyContent={
                    isLoading ? (
                        <div className="flex items-center justify-center h-48 w-full text-default-500">
                            <Spinner size="lg" label="Cargando..." color="current" />
                        </div>
                    ) : (
                        emptyContent ?? defaultEmptyContent
                    )
                }
                isLoading={false}
            >
                {(item) => (
                    <TableRow key={item.id}>
                        {(columnKey) => {
                            const column = allColumns.find(c => c.key === columnKey)
                            return (
                                <TableCell className={(column as any)?.className}>
                                    {renderCell(item, columnKey as string)}
                                </TableCell>
                            )
                        }}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}
