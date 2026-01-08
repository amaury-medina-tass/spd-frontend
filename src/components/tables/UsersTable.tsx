// src/components/tables/UsersTable.tsx
"use client"

import {Button, Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@heroui/react"
import type {User} from "@/types/user"

export function UsersTable({
  items,
  onEdit,
}: {
  items: User[]
  onEdit: (user: User) => void
}) {
  return (
    <Table aria-label="Users table">
      <TableHeader>
        <TableColumn>Email</TableColumn>
        <TableColumn>Status</TableColumn>
        <TableColumn>Actions</TableColumn>
      </TableHeader>

      <TableBody emptyContent="No users found">
        {items.map((u) => (
          <TableRow key={u.id}>
            <TableCell>{u.email}</TableCell>
            <TableCell>
              <Chip color={u.is_active ? "success" : "danger"} variant="flat">
                {u.is_active ? "Active" : "Inactive"}
              </Chip>
            </TableCell>
            <TableCell>
              <Button size="sm" variant="flat" onPress={() => onEdit(u)}>
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}