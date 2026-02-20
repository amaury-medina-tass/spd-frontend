import type { ReactNode } from "react"

/** Standard classNames for underlined Tabs used in detail modals. */
export const modalTabsClassNames = {
    tabList: "gap-6",
    cursor: "bg-primary",
    tab: "px-0 h-10",
} as const

/** Renders an icon+label pair for Tab title prop. */
export function TabTitle({ icon, children }: Readonly<{ icon: ReactNode; children: string }>) {
    return (
        <div className="flex items-center gap-2">
            {icon}
            <span>{children}</span>
        </div>
    )
}
