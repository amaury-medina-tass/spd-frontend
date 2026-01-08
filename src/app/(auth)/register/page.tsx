"use client"

import { Button, Card, CardBody, CardHeader, Input, Link } from "@heroui/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { post, HttpError } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { useAuth } from "@/components/auth/useAuth"

export default function RegisterPage() {
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
      await post(endpoints.auth.register, { email, password })

      // Si tu backend hace auto-login al registrar (set-cookie), esto queda perfecto.
      await refreshMe()
      router.push("/dashboard")
    } catch (e: any) {
      if (e instanceof HttpError) setError(e.data?.message ?? "Could not register")
      else setError("Unexpected error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-lg font-semibold">Create account</CardHeader>
        <CardBody className="gap-4">
          <Input label="Email" value={email} onValueChange={setEmail} />
          <Input label="Password" type="password" value={password} onValueChange={setPassword} />

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button color="primary" isLoading={loading} onPress={onSubmit}>
            Create account
          </Button>

          <p className="text-sm text-foreground-500">
            Already have an account?{" "}
            <Link href="/login" color="primary">
              Sign in
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  )
}