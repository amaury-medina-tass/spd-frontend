"use client"

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
} from "@heroui/react"
import { AuditLog } from "@/types/audit"
import { AuditActionBadge, AuditEntityBadge, AuditStatusBadge } from "@/components/audit/AuditLogBadge"
import { AuditChangesDisplay } from "@/components/audit/AuditChangesDisplay"
import { AuditMetadataDisplay } from "@/components/audit/AuditMetadataDisplay"
import { Calendar, Database, Hash } from "lucide-react"

interface AuditLogDetailModalProps {
  log: AuditLog | null
  isOpen: boolean
  onClose: () => void
}

function formatFullTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleString("es-CO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function AuditLogDetailModal({
  log,
  isOpen,
  onClose,
}: AuditLogDetailModalProps) {
  if (!log) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        header: "border-b border-default-200",
        footer: "border-t border-default-200",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <AuditActionBadge
              action={log.action}
              actionLabel={log.actionLabel}
              size="md"
            />
            <AuditStatusBadge success={log.success} size="md" />
          </div>
          <span className="text-small font-normal text-default-500">
            Detalle del registro de auditoría
          </span>
        </ModalHeader>

        <ModalBody className="gap-6 py-6">
          {/* Basic info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-default-50 rounded-lg">
              <Database size={18} className="text-primary mt-0.5" />
              <div>
                <div className="text-tiny text-default-400 uppercase font-medium">
                  Entidad
                </div>
                <div className="font-medium">{log.entityName}</div>
                <AuditEntityBadge entityType={log.entityType} />
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-default-50 rounded-lg">
              <Calendar size={18} className="text-primary mt-0.5" />
              <div>
                <div className="text-tiny text-default-400 uppercase font-medium">
                  Fecha y hora
                </div>
                <div className="font-medium capitalize">
                  {formatFullTimestamp(log.timestamp)}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-default-50 rounded-lg">
              <Hash size={18} className="text-primary mt-0.5" />
              <div>
                <div className="text-tiny text-default-400 uppercase font-medium">
                  ID del registro
                </div>
                <div className="font-mono text-small break-all">{log.id}</div>
              </div>
            </div>
          </div>

          {/* Changes section */}
          {log.changes && log.changes.length > 0 && (
            <>
              <Divider />
              <div>
                <h4 className="font-medium mb-3 text-default-700">
                  Cambios realizados
                </h4>
                <AuditChangesDisplay changes={log.changes} />
              </div>
            </>
          )}

          {/* Metadata section */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <>
              <Divider />
              <AuditMetadataDisplay metadata={log.metadata} defaultExpanded />
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button color="primary" variant="flat" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
