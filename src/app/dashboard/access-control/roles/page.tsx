"use client"

import {Button, Card, CardBody, CardHeader} from "@heroui/react"
import {useMemo, useState} from "react"
import {RolesTable} from "@/components/tables/RolesTable"
import {RoleModal} from "@/components/modals/RoleModal"
import type {Role} from "@/types/role"

export default function AccessControlRolesPage() {
  const [items, setItems] = useState<Role[]>(() => [
    {id: "r1", name: "Admin", description: "Full access", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
    {id: "r2", name: "User", description: "Limited access", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
  ])

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)

  const onCreate = () => {
    setEditing(null)
    setOpen(true)
  }

  const onEdit = (r: Role) => {
    setEditing(r)
    setOpen(true)
  }

  const onSave = (payload: {name: string; description?: string; is_active: boolean}) => {
    const now = new Date().toISOString()

    if (editing) {
      setItems((prev) =>
        prev.map((x) => (x.id === editing.id ? {...x, ...payload, updated_at: now} : x))
      )
    } else {
      const newItem: Role = {
        id: crypto.randomUUID(),
        name: payload.name,
        description: payload.description ?? "",
        is_active: payload.is_active,
        created_at: now,
        updated_at: now,
      }
      setItems((prev) => [newItem, ...prev])
    }

    setOpen(false)
    setEditing(null)
  }

  const title = useMemo(() => (editing ? "Edit role" : "Create role"), [editing])

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="font-semibold">Access Control • Roles</span>
          <Button color="primary" onPress={onCreate}>
            Create
          </Button>
        </CardHeader>
        <CardBody>
          <RolesTable items={items} onEdit={onEdit} />
        </CardBody>
      </Card>

      <RoleModal
        isOpen={open}
        title={title}
        initial={editing}
        onClose={() => {
          setOpen(false)
          setEditing(null)
        }}
        onSave={onSave}
      />
    </div>
  )
}