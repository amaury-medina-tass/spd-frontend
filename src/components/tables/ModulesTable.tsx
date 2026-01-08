// src/components/tables/ModulesTable.tsx
"use client"

import {Button, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@heroui/react"
import type {Module} from "@/types/module"

export function ModulesTable({
  items,
  onEdit,
}: {
  items: Module[]
  onEdit: (module: Module) => void
}) {
  return (
    <Table aria-label="Modules table">
      <TableHeader>
        <TableColumn>Name</TableColumn>
        <TableColumn>Path</TableColumn>
        <TableColumn>Description</TableColumn>
        <TableColumn>Actions</TableColumn>
      </TableHeader>

      <TableBody emptyContent="No modules found">
        {items.map((m) => (
          <TableRow key={m.id}>
            <TableCell>{m.name}</TableCell>
            <TableCell className="font-mono text-sm">{m.path}</TableCell>
            <TableCell className="text-foreground-500">{m.description}</TableCell>
            <TableCell>
              <Button size="sm" variant="flat" onPress={() => onEdit(m)}>
                Edit
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}