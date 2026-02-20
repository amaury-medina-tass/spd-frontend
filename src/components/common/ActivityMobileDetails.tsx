import { formatCurrency } from "@/lib/format-utils"

interface ActivityMobileDetailsProps {
    projectCode?: string
    rubricCode?: string
    budgetCeiling: string
    balance: string
}

export function ActivityMobileDetails({ projectCode, rubricCode, budgetCeiling, balance }: Readonly<ActivityMobileDetailsProps>) {
    return (
        <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
                <span className="text-tiny text-default-400">Proyecto</span>
                <p className="text-xs font-medium">{projectCode || "—"}</p>
            </div>
            <div>
                <span className="text-tiny text-default-400">Pos. Presupuestal</span>
                <p className="text-xs font-medium">{rubricCode || "—"}</p>
            </div>
            <div>
                <span className="text-tiny text-default-400">Techo</span>
                <p className="text-xs font-medium">{formatCurrency(budgetCeiling)}</p>
            </div>
            <div>
                <span className="text-tiny text-default-400">Disponible</span>
                <p className="text-xs font-medium text-success-600 dark:text-success-400">
                    {formatCurrency(balance)}
                </p>
            </div>
        </div>
    )
}
