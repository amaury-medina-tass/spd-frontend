"use client"

import { Button, Card, CardBody, CardHeader, Input, Link } from "@heroui/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { post } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { useAuth } from "@/components/auth/useAuth"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { Eye, EyeOff, CircleAlert } from "lucide-react"
import { getErrorMessage, ErrorCodes } from "@/lib/error-codes"
import { addToast } from "@heroui/toast"
import { VerifyEmailStep } from "@/components/auth/VerifyEmailStep"

export default function LoginPage() {
  const router = useRouter()
  const { refreshMe } = useAuth()

  const [step, setStep] = useState<"login" | "verify">("login")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggleVisibility = () => setIsVisible(!isVisible)

  const onSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      await post(endpoints.auth.login, {
        email,
        password,
        system: process.env.NEXT_PUBLIC_SYSTEM
      })

      await refreshMe()
      router.push("/dashboard")
    } catch (e: any) {
      const errorCode = e.data?.errors?.code

      if (errorCode === ErrorCodes.EMAIL_NOT_VERIFIED) {
        try {
          await post(endpoints.auth.resendVerification, { email })
          addToast({
            title: "Código de verificación reenviado.",
            color: "success"
          })
        } catch {
        }
        setStep("verify")
        return
      }

      const message = errorCode ? getErrorMessage(errorCode) : (e.data?.message ?? "Credenciales inválidas")
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const onVerified = async () => {
    await post(endpoints.auth.login, {
      email,
      password,
      system: process.env.NEXT_PUBLIC_SYSTEM
    })
    await refreshMe()
    addToast({ title: "Cuenta verificada e iniciada correctamente", color: "success" })
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-6 items-center pt-8 pb-4">
          <div className="flex items-center justify-center w-full">
            <div className="relative h-40 w-full max-w-sm">
              <Image
                src="/images/lgos_colores.png"
                alt="Logos Institucionales"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-default-900">
            {step === "login" ? "Bienvenido" : "Verificar Correo"}
          </h1>
        </CardHeader>
        <CardBody className="gap-4">
          {step === "login" ? (
            <>
              <Input label="Correo Electrónico" value={email} onValueChange={setEmail} />
              <Input
                label="Contraseña"
                type={isVisible ? "text" : "password"}
                value={password}
                onValueChange={setPassword}
                endContent={
                  <Button isIconOnly size="sm" variant="light" onPress={toggleVisibility}>
                    {isVisible ? (
                      <EyeOff size={18} className="text-default-400 pointer-events-none" />
                    ) : (
                      <Eye size={18} className="text-default-400 pointer-events-none" />
                    )}
                  </Button>
                }
              />

              {error && (
                <div className="bg-danger-50 border border-danger-200 text-danger-600 px-4 py-3 rounded-medium flex items-center gap-2 text-sm">
                  <CircleAlert size={18} className="shrink-0" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              <div className="flex justify-end">
                <Link href="/forgot-password" size="sm" color="primary">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <Button color="primary" isLoading={loading} onPress={onSubmit}>
                Ingresar
              </Button>

              <p className="text-sm text-foreground-500 text-center">
                ¿No tienes cuenta?{" "}
                <Link href="/register" color="primary">
                  Regístrate
                </Link>
              </p>
            </>
          ) : (
            <VerifyEmailStep
              email={email}
              onVerified={onVerified}
              loading={loading}
              setLoading={setLoading}
            >
              <div className="text-center mt-2">
                <Link href="#" size="sm" color="foreground" onPress={() => setStep("login")}>
                  Volver al inicio de sesión
                </Link>
              </div>
            </VerifyEmailStep>
          )}
        </CardBody>
      </Card>
    </div>
  )
}