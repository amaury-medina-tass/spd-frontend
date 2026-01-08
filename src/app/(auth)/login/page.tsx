"use client"

import { Button, Card, CardBody, CardHeader, Input, Link } from "@heroui/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { post, HttpError } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { useAuth } from "@/components/auth/useAuth"

export default function LoginPage() {
  const router = useRouter()
  const { refreshMe } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      await post(endpoints.auth.login, { email, password })

      await refreshMe()
      router.push("/dashboard")
    } catch (e: any) {
      if (e instanceof HttpError) setError(e.data?.message ?? "Invalid credentials")
      else setError("Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-lg font-semibold">Sign in</CardHeader>
        <CardBody className="gap-4">
          <Input label="Email" value={email} onValueChange={setEmail} />
          <Input label="Password" type="password" value={password} onValueChange={setPassword} />

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button color="primary" isLoading={loading} onPress={onSubmit}>
            Sign in
          </Button>

          <p className="text-sm text-foreground-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" color="primary">
              Create one
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  )
}