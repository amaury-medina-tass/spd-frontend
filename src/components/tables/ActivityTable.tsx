"use client"

import {
    Button,
    Pagination,
    Select,
    SelectItem,
    Card,
    CardBody,
} from "@heroui/react"
import { Plus, X, Inbox } from "lucide-react"

export type DetailedActivityItem = {
    id: string
    code: string
    name: string
    budgetCeiling: string
    balance: string
    rubric?: { code: string }
    project?: { code: string }
}

type Props = {
    items: DetailedActivityItem[]
    actionType: "associate" | "dissociate"
    actionLoading: string | null
    onAction: (id: string) => void
    emptyMessage?: string
    ariaLabel?: string
    page?: number
    totalPages?: number
    onPageChange?: (page: number) => void
    limit?: number
    onLimitChange?: (limit: number) => void
}

const formatCurrency = (n: string | number) => {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    }).format(Number(n))
}

// Mobile card view for each activity
function ActivityCard({
    item,
    actionType,
    actionLoading,
    onAction,
}: {
    item: DetailedActivityItem
    actionType: "associate" | "dissociate"
    actionLoading: string | null
    onAction: (id: string) => void
}) {
    return (
        <Card className="bg-default-50 border border-default-200 shadow-none">
            <CardBody className="p-3 gap-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <span className="font-mono text-xs font-semibold text-primary-600 dark:text-primary-400">
                            {item.code}
                        </span>
                        <p className="text-sm font-medium text-foreground line-clamp-2 mt-0.5">
                            {item.name}
                        </p>
                    </div>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color={actionType === "dissociate" ? "danger" : "primary"}
                        isLoading={actionLoading === item.id}
                        onPress={() => onAction(item.id)}
                        className="flex-shrink-0"
                    >
                        {actionLoading !== item.id && (
                            actionType === "dissociate" ? <X size={14} /> : <Plus size={14} />
                        )}
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                        <span className="text-tiny text-default-400">Proyecto</span>
                        <p className="text-xs font-medium">{item.project?.code || "—"}</p>
                    </div>
                    <div>
                        <span className="text-tiny text-default-400">Pos. Presupuestal</span>
                        <p className="text-xs font-medium">{item.rubric?.code || "—"}</p>
                    </div>
                    <div>
                        <span className="text-tiny text-default-400">Techo</span>
                        <p className="text-xs font-medium">{formatCurrency(item.budgetCeiling)}</p>
                    </div>
                    <div>
                        <span className="text-tiny text-default-400">Disponible</span>
                        <p className="text-xs font-medium text-success-600 dark:text-success-400">
                            {formatCurrency(item.balance)}
                        </p>
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}

// Desktop table view
function DesktopTable({
    items,
    actionType,
    actionLoading,
    onAction,
    emptyMessage,
    ariaLabel,
}: {
    items: DetailedActivityItem[]
    actionType: "associate" | "dissociate"
    actionLoading: string | null
    onAction: (id: string) => void
    emptyMessage: string
    ariaLabel: string
}) {
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-default-400">
                <div className="w-12 h-12 rounded-xl bg-default-100 flex items-center justify-center mb-3">
                    <Inbox size={24} className="opacity-50" />
                </div>
                <p className="text-sm font-medium">{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto border border-default-200 rounded-lg" aria-label={ariaLabel}>
            <table className="w-full min-w-[700px]">
                <thead>
                    <tr className="bg-default-100">
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-default-600 uppercase">Código</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-default-600 uppercase">Nombre</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-default-600 uppercase">Proyecto</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-default-600 uppercase">PosPre</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-default-600 uppercase">Techo</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-default-600 uppercase">Disponible</th>
                        <th className="px-4 py-2.5 text-center text-xs font-semibold text-default-600 uppercase w-16"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-default-100">
                    {items.map((item) => (
                        <tr key={item.id} className="hover:bg-default-50 transition-colors">
                            <td className="px-4 py-3 text-sm">
                                <span className="font-mono font-medium">{item.code}</span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                                <span className="line-clamp-1 max-w-[200px]">{item.name}</span>
                            </td>
                            <td className="px-4 py-3 text-sm text-default-500">{item.project?.code || "—"}</td>
                            <td className="px-4 py-3 text-sm text-default-500">{item.rubric?.code || "—"}</td>
                            <td className="px-4 py-3 text-sm">{formatCurrency(item.budgetCeiling)}</td>
                            <td className="px-4 py-3 text-sm">
                                <span className="text-success-600 dark:text-success-400 font-medium">
                                    {formatCurrency(item.balance)}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                                <Button
                                    isIconOnly
                                    size="sm"
                                    variant="light"
                                    color={actionType === "dissociate" ? "danger" : "primary"}
                                    isLoading={actionLoading === item.id}
                                    onPress={() => onAction(item.id)}
                                >
                                    {actionLoading !== item.id && (
                                        actionType === "dissociate" ? <X size={14} /> : <Plus size={14} />
                                    )}
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export function ActivityTable({
    items,
    actionType,
    actionLoading,
    onAction,
    emptyMessage = "No hay actividades",
    ariaLabel = "Tabla de actividades detalladas",
    page = 1,
    totalPages = 1,
    onPageChange,
    limit = 10,
    onLimitChange,
}: Props) {
    return (
        <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block">
                <DesktopTable 
                    items={items}
                    actionType={actionType}
                    actionLoading={actionLoading}
                    onAction={onAction}
                    emptyMessage={emptyMessage}
                    ariaLabel={ariaLabel}
                />
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-default-400">
                        <div className="w-12 h-12 rounded-xl bg-default-100 flex items-center justify-center mb-3">
                            <Inbox size={24} className="opacity-50" />
                        </div>
                        <p className="text-sm font-medium">{emptyMessage}</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <ActivityCard
                            key={item.id}
                            item={item}
                            actionType={actionType}
                            actionLoading={actionLoading}
                            onAction={onAction}
                        />
                    ))
                )}
            </div>

            {/* Pagination */}
            {(totalPages > 1 || onLimitChange) && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                    <div className="hidden sm:block w-[30%]"></div>
                    {totalPages > 1 && (
                        <div className="flex justify-center">
                            <Pagination
                                isCompact
                                showControls
                                showShadow
                                color="primary"
                                page={page}
                                total={totalPages}
                                onChange={(page) => onPageChange?.(page)}
                                size="sm"
                            />
                        </div>
                    )}
                    {onLimitChange && (
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
                                <SelectItem key="5">5</SelectItem>
                                <SelectItem key="10">10</SelectItem>
                                <SelectItem key="20">20</SelectItem>
                                <SelectItem key="50">50</SelectItem>
                            </Select>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
