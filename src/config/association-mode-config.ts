import { Plus, X } from "lucide-react"

export function buildAssociationModeConfig<T extends Record<string, unknown>>(
    associated: T & { errorTitle: string; successTitle: string; emptyText: string },
    available: T & { errorTitle: string; successTitle: string; emptyText: string },
) {
    return {
        associated: { ...associated, buttonColor: "danger" as const, ButtonIcon: X },
        available: { ...available, buttonColor: "primary" as const, ButtonIcon: Plus },
    }
}
