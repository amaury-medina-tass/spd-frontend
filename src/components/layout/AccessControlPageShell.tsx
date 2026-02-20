import { ReactNode } from "react"
import { Button, Breadcrumbs, BreadcrumbItem } from "@heroui/react"

interface AccessControlPageShellProps {
    breadcrumbLabel: string
    canRead: boolean
    error: string | null
    onRetry: () => void
    children: ReactNode
    modals?: ReactNode
}

export function AccessControlPageShell({ breadcrumbLabel, canRead, error, onRetry, children, modals }: Readonly<AccessControlPageShellProps>) {
    const mainContent = error ? (
        <div className="text-center py-8 text-danger">
            <p>{error}</p>
            <Button variant="flat" className="mt-2" onPress={onRetry}>
                Reintentar
            </Button>
        </div>
    ) : (
        children
    )

    return (
        <div className="grid gap-4">
            <Breadcrumbs>
                <BreadcrumbItem>Inicio</BreadcrumbItem>
                <BreadcrumbItem>Control de Acceso</BreadcrumbItem>
                <BreadcrumbItem>{breadcrumbLabel}</BreadcrumbItem>
            </Breadcrumbs>

            {canRead ? mainContent : (
                <div className="text-center py-16">
                    <p className="text-xl font-semibold text-danger">Acceso Denegado</p>
                    <p className="text-default-500 mt-2">No tienes permisos para ver este módulo.</p>
                </div>
            )}

            {modals}
        </div>
    )
}
