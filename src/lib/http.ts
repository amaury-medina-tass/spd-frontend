// src/lib/http.ts
type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export class HttpError extends Error {
  status: number
  data: any

  constructor(status: number, data: any, message = "HttpError") {
    super(message)
    this.status = status
    this.data = data
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
      headers: {"Content-Type": "application/json"},
    })
    return res.ok
  } catch {
    return false
  }
}

export async function http<T>(
  path: string,
  options?: {
    method?: HttpMethod
    body?: any
    headers?: Record<string, string>
    signal?: AbortSignal
  }
): Promise<T> {
  const method = options?.method ?? "GET"

  const doFetch = async () => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      credentials: "include",
      headers: {
        ...(options?.body ? {"Content-Type": "application/json"} : {}),
        ...(options?.headers ?? {}),
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
      signal: options?.signal,
    })

    const data = await parseBody(res)

    if (!res.ok) {
      throw new HttpError(res.status, data, data?.message ?? "Request failed")
    }

    return data as T
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