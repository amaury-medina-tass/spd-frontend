"use client"

import {
    Button,
    Chip,
    Input,
    Pagination,
    Spinner,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from "@heroui/react"
import { MoreVertical, Inbox, ChevronDown, ChevronUp, Search, ArrowUpDown } from "lucide-react"
import { ReactNode, useMemo } from "react"

/** Definición de columna */
export interface ColumnDef<T> {
    key: string
    label: string
    render?: (item: T) => ReactNode
    sortable?: boolean
    className?: string
    width?: string
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

/** Descriptor de ordenamiento */
export interface SortDescriptor {
    column: string
    direction: "ascending" | "descending"
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
    const hasActions = rowActions && rowActions.length > 0

    const handleSort = (columnKey: string) => {
        if (!onSortChange) return
        const newDirection =
            sortDescriptor?.column === columnKey && sortDescriptor.direction === "ascending"
                ? "descending"
                : "ascending"
        onSortChange({ column: columnKey, direction: newDirection })
    }

    const renderCellContent = (item: T, column: ColumnDef<T>) => {
        if (column.render) {
            return column.render(item)
        }

        const value = (item as Record<string, unknown>)[column.key]

        if (typeof value === "boolean") {
            return (
                <Chip 
                    color={value ? "success" : "danger"} 
                    variant="flat" 
                    size="sm"
                    classNames={{
                        base: "px-2 h-6",
                        content: "text-xs font-medium"
                    }}
                >
                    {value ? "Activo" : "Inactivo"}
                </Chip>
            )
        }

        return value as ReactNode
    }

    const defaultEmptyContent = useMemo(() => (
        <div className="flex flex-col items-center justify-center py-20 text-default-400">
            <div className="w-16 h-16 rounded-2xl bg-default-100 flex items-center justify-center mb-4">
                <Inbox size={32} className="opacity-50" strokeWidth={1.5} />
            </div>
            <p className="text-base font-medium mb-1 text-default-500">No hay registros</p>
            <p className="text-sm text-default-400">No se encontraron datos para mostrar</p>
        </div>
    ), [])

    const loadingContent = useMemo(() => (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
                <div className="w-12 h-12 rounded-full border-3 border-default-200 border-t-primary animate-spin" />
            </div>
            <p className="mt-4 text-default-400 text-sm">Cargando datos...</p>
        </div>
    ), [])

    const getSortIcon = (columnKey: string) => {
        if (sortDescriptor?.column !== columnKey) {
            return <ArrowUpDown size={14} className="text-default-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        }
        return sortDescriptor.direction === "ascending" 
            ? <ChevronUp size={14} className="text-primary" />
            : <ChevronDown size={14} className="text-primary" />
    }

    return (
        <div className="w-full rounded-xl border border-default-200 bg-content1 overflow-hidden shadow-sm">
            {/* Header con búsqueda y acciones */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-content1">
                {onSearchChange ? (
                    <Input
                        placeholder={searchPlaceholder}
                        size="md"
                        radius="sm"
                        className="w-full sm:w-80"
                        value={searchValue}
                        onValueChange={onSearchChange}
                        startContent={<Search size={18} className="text-default-400" />}
                        classNames={{
                            inputWrapper: "bg-default-100/50 border border-default-200 shadow-none",
                            input: "text-sm placeholder:text-default-400",
                        }}
                    />
                ) : (
                    <div />
                )}
                {topActions && topActions.length > 0 && (
                    <div className="flex gap-2 w-full sm:w-auto justify-end">
                        {topActions.map((action) => (
                            <Button
                                key={action.key}
                                color={action.color ?? "primary"}
                                onPress={action.onClick}
                                startContent={action.icon}
                                size="md"
                                radius="sm"
                                className="hidden sm:flex font-medium"
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
                                size="md"
                                radius="sm"
                                className="flex sm:hidden"
                            >
                                {action.icon}
                            </Button>
                        ))}
                    </div>
                )}
            </div>

            {/* Tabla con scroll horizontal */}
            <div className="relative">
                <div className="overflow-x-auto" aria-label={ariaLabel}>
                    <table className="w-full min-w-[600px]">
                        {/* Header */}
                        <thead>
                            <tr className="bg-default-100 border-b-2 border-default-200">
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className={`px-6 py-3 text-left text-xs font-bold text-default-700 uppercase tracking-wide whitespace-nowrap ${column.className ?? ""}`}
                                        style={{ width: column.width, minWidth: column.width ?? '120px' }}
                                    >
                                        {column.sortable && onSortChange ? (
                                            <button
                                                className="flex items-center gap-2 hover:text-default-700 transition-colors group"
                                                onClick={() => handleSort(column.key)}
                                            >
                                                <span>{column.label}</span>
                                                {getSortIcon(column.key)}
                                            </button>
                                        ) : (
                                            column.label
                                        )}
                                    </th>
                                ))}
                                {hasActions && (
                                    <th className="sticky right-0 px-6 py-3 text-center text-xs font-bold text-default-700 uppercase tracking-wide bg-default-100 w-[80px] before:content-[''] before:absolute before:top-0 before:bottom-0 before:-left-8 before:w-8 before:bg-gradient-to-r before:from-transparent before:to-default-100 before:pointer-events-none">
                                        Acciones
                                    </th>
                                )}
                            </tr>
                        </thead>

                        {/* Body */}
                        <tbody className="divide-y divide-default-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={columns.length + (hasActions ? 1 : 0)}>
                                        {loadingContent}
                                    </td>
                                </tr>
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + (hasActions ? 1 : 0)}>
                                        {emptyContent ?? defaultEmptyContent}
                                    </td>
                                </tr>
                            ) : (
                            items.map((item, index) => (
                                    <tr
                                        key={`${item.id}-${index}`}
                                        className="group/row"
                                    >
                                        {columns.map((column) => (
                                            <td
                                                key={column.key}
                                                className={`px-6 py-4 text-sm text-default-600 whitespace-nowrap ${column.className ?? ""}`}
                                                style={{ minWidth: column.width ?? '120px' }}
                                            >
                                                {renderCellContent(item, column)}
                                            </td>
                                        ))}
                                        {hasActions && (
                                                <td className="sticky right-0 px-6 py-4 bg-content1 text-center before:content-[''] before:absolute before:top-0 before:bottom-0 before:-left-8 before:w-8 before:bg-gradient-to-r before:from-transparent before:to-content1 before:pointer-events-none">
                                                    <Dropdown>
                                                        <DropdownTrigger>
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                variant="light"
                                                                radius="sm"
                                                            className="text-default-400"
                                                        >
                                                            <MoreVertical size={16} />
                                                        </Button>
                                                    </DropdownTrigger>
                                                    <DropdownMenu 
                                                        aria-label="Acciones de fila"
                                                        classNames={{
                                                            list: "py-1",
                                                        }}
                                                    >
                                                        {rowActions!.map((action) => (
                                                            <DropdownItem
                                                                key={action.key}
                                                                color={action.color}
                                                                startContent={action.icon}
                                                                onPress={() => action.onClick(item)}
                                                                className="text-sm py-2"
                                                            >
                                                                {action.label}
                                                            </DropdownItem>
                                                        ))}
                                                    </DropdownMenu>
                                                </Dropdown>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer con paginación */}
            {pagination && pagination.totalPages > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 bg-default-50/30 border-t border-default-100 gap-3">
                    <div className="hidden sm:flex items-center gap-2 text-sm text-default-400">
                        <span className="font-medium text-default-600">{pagination.page}</span>
                        <span>de</span>
                        <span className="font-medium text-default-600">{pagination.totalPages}</span>
                        <span>páginas</span>
                    </div>
                    <Pagination
                        total={pagination.totalPages}
                        page={pagination.page}
                        onChange={pagination.onChange}
                        showControls
                        color="primary"
                        variant="flat"
                        size="md"
                        radius="sm"
                        classNames={{
                            cursor: "font-medium",
                            item: "bg-transparent",
                            prev: "bg-transparent",
                            next: "bg-transparent",
                        }}
                    />
                    {pagination.onPageSizeChange && (
                        <div className="flex items-center gap-2 text-sm text-default-400">
                            <span className="hidden sm:inline">Mostrar</span>
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button
                                        variant="flat"
                                        size="md"
                                        radius="sm"
                                        className="min-w-16 bg-default-100 font-medium"
                                        endContent={<ChevronDown size={14} className="text-default-400" />}
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
                                            {option} filas
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
