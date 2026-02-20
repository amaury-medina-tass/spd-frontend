import { type LucideIcon } from "lucide-react"

interface DetailFieldProps {
    icon?: LucideIcon
    label: string
    value: React.ReactNode
    colSpan?: 1 | 2
    valueClassName?: string
}

export function DetailField({ icon: Icon, label, value, colSpan = 1, valueClassName = "text-small font-medium text-foreground" }: Readonly<DetailFieldProps>) {
    const wrapperClass = colSpan === 2 ? "col-span-2" : ""

    if (!Icon) {
        return (
            <div className={wrapperClass}>
                <span className="text-tiny text-default-400 uppercase tracking-wide">
                    {label}
                </span>
                <p className={valueClassName}>{value}</p>
            </div>
        )
    }

    return (
        <div className={wrapperClass}>
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={16} className="text-default-500" />
                </div>
                <div className="flex-1">
                    <span className="text-tiny text-default-400 uppercase tracking-wide">
                        {label}
                    </span>
                    <p className={valueClassName}>{value}</p>
                </div>
            </div>
        </div>
    )
}
