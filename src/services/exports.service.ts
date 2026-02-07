import { get, post } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"

export type ExportType = "ACTIVITIES" | "CDP" | "CONTRACTS" | "PROJECTS"
export type ExportFormat = "XLSX" | "CSV"

export interface CreateExportDto {
  system: string
  type: ExportType
  format?: ExportFormat
  filters?: Record<string, unknown>
}

export interface ExportStatusDto {
  jobId: string
  system: string
  type: ExportType
  format: ExportFormat
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
  fileName?: string
  fileUrl?: string
  createdAt: string
}

/** Request a new export job */
export function requestExport(dto: CreateExportDto) {
  return post<ExportStatusDto>(endpoints.exports.create, dto)
}

/** Get the status of an export job */
export function getExportStatus(jobId: string) {
  return get<ExportStatusDto>(endpoints.exports.status(jobId))
}

/** List all export jobs */
export function listExports() {
  return get<ExportStatusDto[]>(endpoints.exports.list)
}
