import { RefreshCw, Download, Plus } from "lucide-react"
import type { TopAction } from "@/components/tables/DataTable"

export function buildBaseTopActions(
    fetchData: () => void,
    handleExport: () => void,
    exporting: boolean,
    exportLabel: string,
): TopAction[] {
    return [
        { key: "refresh", label: "Actualizar", icon: <RefreshCw size={16} />, color: "default", onClick: fetchData },
        { key: "export", label: exportLabel, icon: <Download size={16} />, color: "primary", onClick: handleExport, isLoading: exporting },
    ]
}

export function buildCrudTopActions(
    fetchData: () => void,
    canCreate: boolean,
    onCreate: () => void,
): TopAction[] {
    const actions: TopAction[] = [
        { key: "refresh", label: "Actualizar", icon: <RefreshCw size={16} />, color: "default", onClick: fetchData },
    ]
    if (canCreate) {
        actions.push({ key: "create", label: "Crear", icon: <Plus size={16} />, color: "primary", onClick: onCreate })
    }
    return actions
}
