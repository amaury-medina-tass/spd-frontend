import { Button } from "@heroui/react"

export function TableErrorView({ error, onRetry }: Readonly<{ error: string; onRetry: () => void }>) {
    return (
        <div className="text-center py-8 text-danger">
            <p>{error}</p>
            <Button variant="flat" className="mt-2" onPress={onRetry}>
                Reintentar
            </Button>
        </div>
    )
}

export function AccessDeniedView() {
    return (
        <div className="text-center py-16">
            <p className="text-xl font-semibold text-danger">Acceso Denegado</p>
            <p className="text-default-500 mt-2">No tienes permisos para ver este módulo.</p>
        </div>
    )
}
