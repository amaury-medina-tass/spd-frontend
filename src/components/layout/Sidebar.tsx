"use client"

import {Link} from "@heroui/react"
import {usePathname} from "next/navigation"

export function Sidebar() {
  const pathname = usePathname()

  const itemColor = (match: boolean) => (match ? "primary" : "foreground")

  return (
    <aside className="w-64 border-r border-divider p-4">
      <h2 className="font-bold mb-6">Dashboard</h2>

      <nav className="flex flex-col gap-2">
        <Link href="/dashboard" color={itemColor(pathname === "/dashboard")}>
          Home
        </Link>

        <Link href="/dashboard/masters" color={itemColor(pathname.startsWith("/dashboard/masters"))}>
          Masters
        </Link>

        <div className="mt-4">
          <span className="text-xs text-foreground-500 uppercase">Administration</span>
          <div className="ml-2 mt-2 flex flex-col gap-1">
            <Link
              href="/dashboard/access-control/users"
              color={itemColor(pathname.includes("/access-control/users"))}
            >
              Users
            </Link>
            <Link
              href="/dashboard/access-control/roles"
              color={itemColor(pathname.includes("/access-control/roles"))}
            >
              Roles
            </Link>
            <Link
              href="/dashboard/access-control/modules"
              color={itemColor(pathname.includes("/access-control/modules"))}
            >
              Modules
            </Link>
          </div>
        </div>
      </nav>
    </aside>
  )
}