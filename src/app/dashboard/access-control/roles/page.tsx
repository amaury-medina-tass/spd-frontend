"use client"

import { Button, Chip, Breadcrumbs, BreadcrumbItem } from "@heroui/react"
import { useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction } from "@/components/tables/DataTable"
import { RoleModal } from "@/components/modals/RoleModal"
import { Pencil, Trash2, Plus } from "lucide-react"
import type { Role } from "@/types/role"

const columns: ColumnDef<Role>[] = [
  { key: "name", label: "Nombre" },
  { key: "description", label: "Descripción" },
  {
    key: "is_active",
    label: "Estado",
    render: (item) => (
      <Chip color={item.is_active ? "success" : "danger"} variant="flat" size="sm">
        {item.is_active ? "Activo" : "Inactivo"}
      </Chip>
    ),
  },
]

export default function AccessControlRolesPage() {
  const [items, setItems] = useState<Role[]>(() => [
    { id: "r1", name: "Administrador", description: "Acceso total al sistema", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: "r2", name: "Usuario", description: "Acceso limitado", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ])

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Role | null>(null)
  const [search, setSearch] = useState("")

  const onCreate = () => {
    setEditing(null)
    setOpen(true)
  }

  const onEdit = (r: Role) => {
    setEditing(r)
    setOpen(true)
  }

  const onDelete = (r: Role) => {
    console.log("Delete role", r.id)
  }

  const onSave = (payload: { name: string; description?: string; is_active: boolean }) => {
    const now = new Date().toISOString()

    if (editing) {
      setItems((prev) =>
        prev.map((x) => (x.id === editing.id ? { ...x, ...payload, updated_at: now } : x))
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

  const rowActions: RowAction<Role>[] = [
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

  const title = useMemo(() => (editing ? "Editar rol" : "Crear rol"), [editing])

  return (
    <div className="grid gap-4">
      <Breadcrumbs>
        <BreadcrumbItem>Inicio</BreadcrumbItem>
        <BreadcrumbItem>Control de Acceso</BreadcrumbItem>
        <BreadcrumbItem>Roles</BreadcrumbItem>
      </Breadcrumbs>

      <DataTable
        items={filteredItems}
        columns={columns}
        rowActions={rowActions}
        topActions={topActions}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar roles..."
        ariaLabel="Tabla de roles"
      />

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