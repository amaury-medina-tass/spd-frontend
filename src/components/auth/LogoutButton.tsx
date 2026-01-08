// src/components/auth/LogoutButton.tsx
"use client"

import {Button} from "@heroui/react"
import {useRouter} from "next/navigation"
import {http} from "@/lib/http"
import {endpoints} from "@/lib/endpoints"
import {useAuth} from "./useAuth"
import {useState} from "react"

export function LogoutButton() {
  const router = useRouter()
  const {clear} = useAuth()
  const [loading, setLoading] = useState(false)

  const onLogout = async () => {
    setLoading(true)
    try {
      await http(endpoints.auth.logout, {method: "POST"})
    } catch {
      // incluso si falla, limpiamos front
    } finally {
      clear()
      setLoading(false)
      router.replace("/login")
    }
  }

  return (
    <Button variant="flat" color="danger" isLoading={loading} onPress={onLogout}>
      Logout
    </Button>
  )
}