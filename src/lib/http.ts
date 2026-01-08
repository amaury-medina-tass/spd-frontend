type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

/** Error de validación del API */
export interface ApiValidationError {
  field: string
  message: string
}

/** Metadata de paginación */
export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/** Respuesta paginada */
export interface PaginatedData<T> {
  data: T[]
  meta: PaginationMeta
}

/** Estructura base de respuesta del API */
export interface ApiResponse<T> {
  success: boolean
  statusCode: number
  message: string
  data: T | null
  errors: ApiValidationError[] | null
  meta: {
    timestamp: string
    requestId: string
    path: string
    method: string
  }
}

export class HttpError extends Error {
  status: number
  data: any
  errors: ApiValidationError[] | null

  constructor(status: number, data: any, errors: ApiValidationError[] | null = null, message = "HttpError") {
    super(message)
    this.status = status
    this.data = data
    this.errors = errors
  }

  /** Obtiene el mensaje de error del primer campo específico */
  getFieldError(field: string): string | undefined {
    return this.errors?.find(e => e.field === field)?.message
  }

  /** Obtiene todos los mensajes de error como un array de strings */
  getAllErrorMessages(): string[] {
    return this.errors?.map(e => e.message) ?? []
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"

async function parseBody(res: Response) {
  const contentType = res.headers.get("content-type") || ""
  if (contentType.includes("application/json")) return res.json()
  return res.text()
}

async function refreshSession(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
    return res.ok
  } catch {
    return false
  }
}

interface RequestOptions {
  body?: any
  headers?: Record<string, string>
  signal?: AbortSignal
}

async function request<T>(
  path: string,
  method: HttpMethod,
  options?: RequestOptions
): Promise<T> {
  const doFetch = async () => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: "include",
      headers: {
        ...(options?.body ? { "Content-Type": "application/json" } : {}),
        ...(options?.headers ?? {}),
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
      signal: options?.signal,
    })

    const body = await parseBody(res)

    if (!res.ok) {
      throw new HttpError(res.status, body, body?.errors ?? null, body?.message ?? "Request failed")
    }

    // API returns wrapped response: { success, data, ... }
    // Extract the data field if present
    return (body?.data ?? body) as T
  }

  try {
    return await doFetch()
  } catch (err: any) {
    if (err instanceof HttpError && err.status === 401) {
      const refreshed = await refreshSession()
      if (refreshed) return await doFetch()
    }
    throw err
  }
}

/** GET request */
export async function get<T>(path: string, options?: Omit<RequestOptions, "body">): Promise<T> {
  return request<T>(path, "GET", options)
}

/** POST request */
export async function post<T>(path: string, body?: any, options?: Omit<RequestOptions, "body">): Promise<T> {
  return request<T>(path, "POST", { ...options, body })
}

/** PUT request */
export async function put<T>(path: string, body?: any, options?: Omit<RequestOptions, "body">): Promise<T> {
  return request<T>(path, "PUT", { ...options, body })
}

/** DELETE request */
export async function del<T>(path: string, options?: RequestOptions): Promise<T> {
  return request<T>(path, "DELETE", options)
}