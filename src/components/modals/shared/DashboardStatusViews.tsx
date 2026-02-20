import { BarChart3, Loader2 } from "lucide-react"

export function DashboardLoadingView() {
    return (
        <div className="flex justify-center items-center py-16">
            <Loader2 className="animate-spin h-10 w-10 text-primary" />
        </div>
    )
}

export function DashboardEmptyView() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-default-400 border rounded-xl border-dashed">
            <BarChart3 size={40} className="mb-3 opacity-50" />
            <p className="text-sm font-medium">No hay datos disponibles</p>
        </div>
    )
}
