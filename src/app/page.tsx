// src/app/page.tsx
import {cookies} from "next/headers"
import {redirect} from "next/navigation"

export default async function HomePage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"

  // Pasamos las cookies del request actual al backend (SSR)
  const cookieHeader = (await cookies())
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ")

  try {
    const res = await fetch(`${baseUrl}/auth/me`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    })

    if (res.ok) {
      redirect("/dashboard")
    }
  } catch {
    // si falla, cae a login
  }

  redirect("/login")
}