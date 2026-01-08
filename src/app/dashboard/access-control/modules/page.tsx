"use client"

import {Button, Card, CardBody, CardHeader} from "@heroui/react"
import {useMemo, useState} from "react"
import {ModulesTable} from "@/components/tables/ModulesTable"
import {ModuleModal} from "@/components/modals/ModuleModal"
import type {Module} from "@/types/module"

export default function AccessControlModulesPage() {
  const [items, setItems] = useState<Module[]>(() => [
    {id: "m1", name: "Masters", description: "Masters module", path: "/masters", created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
    {id: "m2", name: "Access Control", description: "Security admin", path: "/access-control", created_at: new Date().toISOString(), updated_at: new Date().toISOString()},
  ])

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Module | null>(null)

  const onCreate = () => {
    setEditing(null)
    setOpen(true)
  }

  const onEdit = (m: Module) => {
    setEditing(m)
    setOpen(true)
  }

  const onSave = (payload: {name: string; description?: string; path: string}) => {
    const now = new Date().toISOString()

    if (editing) {
      setItems((prev) =>
        prev.map((x) => (x.id === editing.id ? {...x, ...payload, updated_at: now} : x))
      )
    } else {
      const newItem: Module = {
        id: crypto.randomUUID(),
        name: payload.name,
        description: payload.description ?? "",
        path: payload.path,
        created_at: now,
        updated_at: now,
      }
      setItems((prev) => [newItem, ...prev])
    }

    setOpen(false)
    setEditing(null)
  }

  const title = useMemo(() => (editing ? "Edit module" : "Create module"), [editing])

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <span className="font-semibold">Access Control • Modules</span>
          <Button color="primary" onPress={onCreate}>
            Create
          </Button>
        </CardHeader>
        <CardBody>
          <ModulesTable items={items} onEdit={onEdit} />
        </CardBody>
      </Card>

      <ModuleModal
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