"use client"

import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Button,
} from "@heroui/react"
import { Plus, X } from "lucide-react"

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
}

const columns = [
    { key: "code", label: "Código" },
    { key: "name", label: "Nombre" },
    { key: "project", label: "Proyecto" },
    { key: "rubric", label: "PosPre" },
    { key: "budget", label: "Techo" },
    { key: "balance", label: "Disponible" },
    { key: "actions", label: "" },
]

const formatCurrency = (n: string | number) => {
    return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    }).format(Number(n))
}

export function ActivityTable({
    items,
    actionType,
    actionLoading,
    onAction,
    emptyMessage = "No hay actividades",
    ariaLabel = "Tabla de actividades detalladas",
}: Props) {
    return (
        <Table
            aria-label={ariaLabel}
            removeWrapper
            classNames={{
                th: "bg-default-100 text-default-600 text-tiny",
                td: "text-small",
            }}
        >
            <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn key={column.key} className={column.key === "actions" ? "w-16" : ""}>
                        {column.label}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody items={items} emptyContent={emptyMessage}>
                {(item) => (
                    <TableRow key={item.id}>
                        <TableCell>
                            <span className="font-mono font-medium">{item.code}</span>
                        </TableCell>
                        <TableCell>
                            <span className="line-clamp-1">{item.name}</span>
                        </TableCell>
                        <TableCell>{item.project?.code || "—"}</TableCell>
                        <TableCell>{item.rubric?.code || "—"}</TableCell>
                        <TableCell>{formatCurrency(item.budgetCeiling)}</TableCell>
                        <TableCell>
                            <span className="text-success-600 dark:text-success-400 font-medium">
                                {formatCurrency(item.balance)}
                            </span>
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}
