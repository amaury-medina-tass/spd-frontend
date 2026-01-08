"use client"

import {Button, Card, CardBody, CardHeader} from "@heroui/react"
import {useMemo, useState} from "react"
import {UsersTable} from "@/components/tables/UsersTable"
import {UserModal} from "@/components/modals/UserModal"
import type {User} from "@/types/user"

export default function AccessControlUsersPage() {
  const [items, setItems] = useState<User[]>(() => [
    {id: "u1", email: "admin@spd.local", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
    {id: "u2", email: "user@spd.local", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
  ])

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)

  const onCreate = () => {
    setEditing(null)
    setOpen(true)
  }

  const onEdit = (u: User) => {
    setEditing(u)
    setOpen(true)
  }

  const onSave = (payload: {email: string; is_active: boolean}) => {
    const now = new Date().toISOString()

    if (editing) {
      setItems((prev) =>
        prev.map((x) => (x.id === editing.id ? {...x, ...payload, updated_at: now} : x))
      )
    } else {
      const newItem: User = {
        id: crypto.randomUUID(),
        email: payload.email,
        is_active: payload.is_active,
        created_at: now,
        updated_at: now,
      }
      setItems((prev) => [newItem, ...prev])
    }

    setOpen(false)
    setEditing(null)
  }

  const title = useMemo(() => (editing ? "Edit user" : "Create user"), [editing])

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="font-semibold">Access Control • Users</span>
          <Button color="primary" onPress={onCreate}>
            Create
          </Button>
        </CardHeader>
        <CardBody>
          <UsersTable items={items} onEdit={onEdit} />
        </CardBody>
      </Card>

      <UserModal
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