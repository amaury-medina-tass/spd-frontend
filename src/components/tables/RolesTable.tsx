// src/components/tables/RolesTable.tsx
"use client"

import {Button, Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@heroui/react"
import type {Role} from "@/types/role"

export function RolesTable({
  items,
  onEdit,
}: {
  items: Role[]
  onEdit: (role: Role) => void
}) {
  return (
    <Table aria-label="Roles table">
      <TableHeader>
        <TableColumn>Name</TableColumn>
        <TableColumn>Description</TableColumn>
        <TableColumn>Status</TableColumn>
        <TableColumn>Actions</TableColumn>
      </TableHeader>

      <TableBody emptyContent="No roles found">
        {items.map((r) => (
          <TableRow key={r.id}>
            <TableCell>{r.name}</TableCell>
            <TableCell className="text-foreground-500">{r.description}</TableCell>
            <TableCell>
              <Chip color={r.is_active ? "success" : "danger"} variant="flat">
                {r.is_active ? "Active" : "Inactive"}
              </Chip>
            </TableCell>
            <TableCell>
              <Button size="sm" variant="flat" onPress={() => onEdit(r)}>
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}