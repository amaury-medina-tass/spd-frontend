"use client"

import { SortDescriptor } from "@heroui/react"
import { useCallback, useMemo, useState } from "react"
import { DataTable, ColumnDef, TopAction } from "@/components/tables/DataTable"
import { useDebounce } from "@/hooks/useDebounce"
import { RefreshCw, AlertCircle } from "lucide-react"
import { addToast } from "@heroui/toast"
import type { MGAActivity } from "@/types/activity"

// Columns for MGA Activities
const mgaActivityColumns: ColumnDef<MGAActivity>[] = [
    { key: "code", label: "Código", sortable: true },
    { key: "name", label: "Nombre", sortable: true },
    { key: "description", label: "Descripción", sortable: false },
    {
        key: "budgetCeiling",
        label: "Techo Presupuestal",
        sortable: true,
        render: (activity) => {
            const value = parseFloat(activity.budgetCeiling)
            return new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0,
            }).format(value)
        },
    },
    {
        key: "balance",
        label: "Saldo",
        sortable: true,
        render: (activity) => {
            const value = parseFloat(activity.balance)
            return new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                minimumFractionDigits: 0,
            }).format(value)
        },
    },
]

// Simulated MGA Activities Data
const simulatedMGAActivities: MGAActivity[] = [
    {
        id: "mga-001",
        code: "MGA-2024-001",
        name: "Fortalecimiento institucional",
        description: "Mejora de capacidades organizativas",
        budgetCeiling: "50000000",
        balance: "35000000",
        createAt: "2024-01-15T10:00:00.000Z",
        updateAt: "2024-01-20T15:30:00.000Z",
    },
    {
        id: "mga-002",
        code: "MGA-2024-002",
        name: "Desarrollo de infraestructura",
        description: "Construcción y mejora de instalaciones",
        budgetCeiling: "120000000",
        balance: "80000000",
        createAt: "2024-02-01T08:00:00.000Z",
        updateAt: "2024-02-10T12:00:00.000Z",
    },
    {
        id: "mga-003",
        code: "MGA-2024-003",
        name: "Capacitación y formación",
        description: "Programas de entrenamiento del personal",
        budgetCeiling: "25000000",
        balance: "20000000",
        createAt: "2024-03-01T09:00:00.000Z",
        updateAt: "2024-03-05T11:00:00.000Z",
    },
    {
        id: "mga-004",
        code: "MGA-2024-004",
        name: "Sistemas de información",
        description: "Implementación de plataformas tecnológicas",
        budgetCeiling: "75000000",
        balance: "60000000",
        createAt: "2024-03-15T14:00:00.000Z",
        updateAt: "2024-03-20T16:00:00.000Z",
    },
    {
        id: "mga-005",
        code: "MGA-2024-005",
        name: "Gestión ambiental",
        description: "Proyectos de sostenibilidad y medio ambiente",
        budgetCeiling: "40000000",
        balance: "38000000",
        createAt: "2024-04-01T10:00:00.000Z",
        updateAt: "2024-04-05T11:30:00.000Z",
    },
]

export function MGAActivitiesTab() {
    const [items] = useState<MGAActivity[]>(simulatedMGAActivities)
    const [loading, setLoading] = useState(false)
    const [searchInput, setSearchInput] = useState("")
    const debouncedSearch = useDebounce(searchInput, 400)
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
        column: "code",
        direction: "ascending",
    })

    // Filtered and sorted items (client-side since it's simulated)
    const filteredItems = useMemo(() => {
        let result = [...items]

        // Filter
        if (debouncedSearch.trim()) {
            const search = debouncedSearch.toLowerCase()
            result = result.filter(
                (item) =>
                    item.code.toLowerCase().includes(search) ||
                    item.name.toLowerCase().includes(search) ||
                    item.description.toLowerCase().includes(search)
            )
        }

        // Sort
        if (sortDescriptor.column) {
            const key = sortDescriptor.column as keyof MGAActivity
            result.sort((a, b) => {
                const aVal = a[key] ?? ""
                const bVal = b[key] ?? ""
                const comparison = String(aVal).localeCompare(String(bVal))
                return sortDescriptor.direction === "ascending" ? comparison : -comparison
            })
        }

        return result
    }, [items, debouncedSearch, sortDescriptor])

    const refresh = useCallback(() => {
        setLoading(true)
        // Simulate loading
        setTimeout(() => setLoading(false), 500)
        addToast({ title: "Datos MGA actualizados (simulados)", color: "success" })
    }, [])

    const topActions: TopAction[] = useMemo(() => [
        {
            key: "refresh",
            label: "Actualizar",
            icon: <RefreshCw size={16} />,
            color: "default",
            onClick: refresh,
        },
    ], [refresh])

    return (
        <div>
            <div className="p-4 mb-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-800 flex items-center gap-2">
                <AlertCircle size={18} className="text-warning" />
                <span className="text-warning-600 dark:text-warning-400 text-sm font-medium">
                    Datos simulados - El endpoint para actividades MGA aún no está disponible
                </span>
            </div>
            <DataTable
                items={filteredItems}
                columns={mgaActivityColumns}
                isLoading={loading}
                topActions={topActions}
                searchValue={searchInput}
                onSearchChange={setSearchInput}
                searchPlaceholder="Buscar actividades MGA..."
                ariaLabel="Tabla de actividades MGA"
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
            />
        </div>
    )
}
