"use client"

import { useState } from "react"
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Divider,
  Tooltip,
  addToast,
} from "@heroui/react"
import { AuditLog } from "@/types/audit"
import { AuditEntityBadge, AuditStatusBadge } from "@/components/audit/AuditLogBadge"
import { AuditChangesDisplay } from "@/components/audit/AuditChangesDisplay"
import { AuditMetadataDisplay } from "@/components/audit/AuditMetadataDisplay"
import { Calendar, Database, Hash, Copy, Check, HelpCircle } from "lucide-react"

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

interface CopyButtonProps {
  text: string
  label: string
}

function CopyButton({ text, label }: Readonly<CopyButtonProps>) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      addToast({
        title: `${label} copiado`,
        color: "success",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Clipboard copy failed:", err)
      addToast({
        title: "Error al copiar",
        color: "danger",
      })
    }
  }

  return (
    <Tooltip content={copied ? "¡Copiado!" : `Copiar ${label}`}>
      <Button
        isIconOnly
        size="sm"
        variant="light"
        className="min-w-6 w-6 h-6"
        onPress={handleCopy as any}
      >
        {copied ? (
          <Check size={12} className="text-success" />
        ) : (
          <Copy size={12} className="text-default-400" />
        )}
      </Button>
    </Tooltip>
  )
}

export function AuditLogDetailModal({
  log,
  isOpen,
  onClose,
}: Readonly<AuditLogDetailModalProps>) {
  if (!log) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-content1",
        header: "border-b border-divider",
        footer: "border-t border-divider",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-foreground">
              {log.actionLabel}
            </span>
            <AuditStatusBadge success={log.success} size="sm" />
          </div>
          <span className="text-small font-normal text-default-400">
            Detalle del registro de auditoría
          </span>
        </ModalHeader>

        <ModalBody className="gap-5 py-5">
          {/* Basic info - Clean list style */}
          <div className="space-y-4">
            {/* Entity info */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0">
                <Database size={16} className="text-default-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <div className="text-tiny text-default-400 uppercase tracking-wide">
                    Entidad
                  </div>
                  <Tooltip content="Indica sobre qué tipo de recurso se realizó la acción (ej. Usuario, Rol, etc.)">
                    <div className="cursor-help text-default-400 hover:text-default-600 transition-colors">
                      <HelpCircle size={12} />
                    </div>
                  </Tooltip>
                </div>
                <div className="font-medium text-foreground mt-0.5">
                  {log.entityName}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <AuditEntityBadge entityType={log.entityType} />
                  <CopyButton text={log.entityId} label="ID de entidad" />
                </div>
              </div>
            </div>

            <Divider className="my-1" />

            {/* Timestamp */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-default-100 flex items-center justify-center flex-shrink-0">
                <Calendar size={16} className="text-default-500" />
              </div>
              <div className="flex-1">
                <div className="text-tiny text-default-400 uppercase tracking-wide">
                  Fecha y hora
                </div>
                <div className="text-small text-default-600 capitalize mt-0.5">
                  {formatFullTimestamp(log.timestamp)}
                </div>
              </div>
            </div>

            <Divider className="my-1" />

          </div>

          {/* Changes section */}
          {log.changes && log.changes.length > 0 && (
            <>
              <Divider />
              <div>
                <h4 className="font-medium mb-3 text-foreground">
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

        <ModalFooter className="justify-between items-center bg-content1">
          <div className="flex items-center gap-2 text-tiny text-default-400">
             <Hash size={14} />
             <span>ID del registro</span>
             <CopyButton text={log.id} label="ID del registro" />
          </div>
          <Button variant="flat" onPress={onClose}>
            Cerrar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
