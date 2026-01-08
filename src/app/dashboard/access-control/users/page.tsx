"use client"

import { Button, Breadcrumbs, BreadcrumbItem, Chip } from "@heroui/react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { DataTable, ColumnDef, RowAction, TopAction } from "@/components/tables/DataTable"
import { UserModal } from "@/components/modals/UserModal"
import { get, PaginatedData, PaginationMeta } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { Pencil, Trash2, Plus } from "lucide-react"
import type { User } from "@/types/user"

// Definición de columnas
const columns: ColumnDef<User>[] = [
  { key: "first_name", label: "Nombre" },
  { key: "last_name", label: "Apellido" },
  { key: "email", label: "Email" },
  { key: "document_number", label: "Documento" },
  {
    key: "is_active",
    label: "Estado",
    render: (user) => (
      <Chip color={user.is_active ? "success" : "danger"} variant="flat" size="sm">
        {user.is_active ? "Activo" : "Inactivo"}
      </Chip>
    ),
  },
]

export default function AccessControlUsersPage() {
  const [items, setItems] = useState<User[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filtros y paginación
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const limit = 10

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (search.trim()) {
        params.set("search", search.trim())
      }

      const result = await get<PaginatedData<User>>(`${endpoints.accessControl.users}?${params}`)
      setItems(result.data)
      setMeta(result.meta)
    } catch (e: any) {
      setError(e.message ?? "Error al cargar usuarios")
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Debounce search
  const [searchInput, setSearchInput] = useState("")
  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput)
      setPage(1) // Reset page on search
    }, 400)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const onCreate = () => {
    setEditing(null)
    setOpen(true)
  }

  const onEdit = (user: User) => {
    setEditing(user)
    setOpen(true)
  }

  const onDelete = (user: User) => {
    // TODO: Implementar confirmación y llamada al API para eliminar
    console.log("Eliminar usuario:", user.id)
  }

  const onSave = (payload: { email: string; is_active: boolean }) => {
    // TODO: Implementar llamada al API para crear/editar
    setOpen(false)
    setEditing(null)
    fetchUsers() // Refrescar la lista
  }

  // Acciones de fila
  const rowActions: RowAction<User>[] = [
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

  // Acciones de barra superior
  const topActions: TopAction[] = [
    {
      key: "create",
      label: "Crear",
      icon: <Plus size={16} />,
      color: "primary",
      onClick: onCreate,
    },
  ]

  const title = useMemo(() => (editing ? "Editar usuario" : "Crear usuario"), [editing])

  return (
    <div className="grid gap-4">
      <Breadcrumbs>
        <BreadcrumbItem>Inicio</BreadcrumbItem>
        <BreadcrumbItem>Control de Acceso</BreadcrumbItem>
        <BreadcrumbItem>Usuarios</BreadcrumbItem>
      </Breadcrumbs>

      {error ? (
        <div className="text-center py-8 text-danger">
          <p>{error}</p>
          <Button variant="flat" className="mt-2" onPress={fetchUsers}>
            Reintentar
          </Button>
        </div>
      ) : (
        <DataTable
          items={items}
          columns={columns}
          isLoading={loading}
          rowActions={rowActions}
          topActions={topActions}
          searchValue={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Buscar usuarios..."
          ariaLabel="Tabla de usuarios"
          pagination={meta ? {
            page,
            totalPages: meta.totalPages,
            onChange: setPage,
          } : undefined}
        />
      )}

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