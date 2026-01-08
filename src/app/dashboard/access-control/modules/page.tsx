"use client"

import { Button, Breadcrumbs, BreadcrumbItem } from "@heroui/react"
import { useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction } from "@/components/tables/DataTable"
import { ModuleModal } from "@/components/modals/ModuleModal"
import { Pencil, Trash2, Plus } from "lucide-react"
import type { Module } from "@/types/module"

const columns: ColumnDef<Module>[] = [
  { key: "name", label: "Nombre" },
  { key: "description", label: "Descripción" },
  { key: "path", label: "Ruta" },
]

export default function AccessControlModulesPage() {
  const [items, setItems] = useState<Module[]>(() => [
    { id: "m1", name: "Maestros", description: "Configuración general", path: "/masters", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "m2", name: "Control de Acceso", description: "Seguridad y permisos", path: "/access-control", created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ])

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Module | null>(null)
  const [search, setSearch] = useState("")

  const onCreate = () => {
    setEditing(null)
    setOpen(true)
  }

  const onEdit = (m: Module) => {
    setEditing(m)
    setOpen(true)
  }

  const onDelete = (m: Module) => {
    console.log("Delete module", m.id)
  }

  const onSave = (payload: { name: string; description?: string; path: string }) => {
    const now = new Date().toISOString()

    if (editing) {
      setItems((prev) =>
        prev.map((x) => (x.id === editing.id ? { ...x, ...payload, updated_at: now } : x))
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

  const rowActions: RowAction<Module>[] = [
    {
      key: "edit",
      label: "Editar",
      icon: <Pencil size={16} />,
      onClick: onEdit,
    },
    {
      key: "delete",
      label: "Eliminar",
      icon: <Trash2 size={16} />,
      color: "danger",
      onClick: onDelete,
    },
  ]

  const topActions: TopAction[] = [
    {
      key: "create",
      label: "Crear",
      icon: <Plus size={16} />,
      color: "primary",
      onClick: onCreate,
    },
  ]

  // Filtrado simple en cliente para mock data
  const filteredItems = useMemo(() => {
    if (!search) return items
    return items.filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.description || "").toLowerCase().includes(search.toLowerCase())
    )
  }, [items, search])

  const title = useMemo(() => (editing ? "Editar módulo" : "Crear módulo"), [editing])

  return (
    <div className="grid gap-4">
      <Breadcrumbs>
        <BreadcrumbItem>Inicio</BreadcrumbItem>
        <BreadcrumbItem>Control de Acceso</BreadcrumbItem>
        <BreadcrumbItem>Módulos</BreadcrumbItem>
      </Breadcrumbs>

      <DataTable
        items={filteredItems}
        columns={columns}
        rowActions={rowActions}
        topActions={topActions}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar módulos..."
        ariaLabel="Tabla de módulos"
      />

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