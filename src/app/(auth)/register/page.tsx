"use client"

import { Button, Card, CardBody, CardHeader, Input, Link } from "@heroui/react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { post } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { useAuth } from "@/components/auth/useAuth"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { PasswordEndContent, PasswordVisibilityToggle } from "@/components/inputs/PasswordEndContent"
import { getErrorMessage } from "@/lib/error-codes"
import { addToast } from "@heroui/toast"
import { VerifyEmailStep } from "@/components/auth/VerifyEmailStep"
import { generatePassword as generateSecurePassword } from "@/lib/password-utils"

export default function RegisterPage() {
  const router = useRouter()
  const { refreshMe } = useAuth()

  const [step, setStep] = useState<"register" | "verify">("register")

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [documentNumber, setDocumentNumber] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)

  const [loading, setLoading] = useState(false)

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible)
  const toggleConfirmPasswordVisibility = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)

  const handleGeneratePassword = () => {
    const pass = generateSecurePassword()
    setPassword(pass)
    setConfirmPassword(pass)
  }

  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return true
    return password === confirmPassword
  }, [password, confirmPassword])

  const isValid = useMemo(() => {
    return (
      firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      documentNumber.trim() !== "" &&
      email !== "" &&
      password !== "" &&
      passwordsMatch
    )
  }, [firstName, lastName, documentNumber, email, password, passwordsMatch])

  const onSubmitRegister = async () => {
    if (!isValid) return
    setLoading(true)

    try {
      await post(endpoints.auth.register, {
        firstName,
        lastName,
        documentNumber,
        email,
        password,
        system: process.env.NEXT_PUBLIC_SYSTEM
      })

      addToast({
        title: "Registro exitoso. Por favor verifica tu correo.",
        color: "success",
      })

      setStep("verify")
    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : (e.data?.message ?? "No se pudo registrar")
      addToast({
        title: message,
        color: "danger",
      })
    } finally {
      setLoading(false)
    }
  }

  const onVerified = async () => {
    await post(endpoints.auth.login, { email, password })
    await refreshMe()
    addToast({ title: "Cuenta verificada e iniciada correctamente", color: "success" })
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-xl">
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
            {step === "register" ? "Crear Cuenta" : "Verificar Correo"}
          </h1>
        </CardHeader>
        <CardBody className="gap-4">
          {step === "register" ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Nombre" value={firstName} onValueChange={setFirstName} isRequired />
                <Input label="Apellido" value={lastName} onValueChange={setLastName} isRequired />
              </div>
              <Input label="Documento" value={documentNumber} onValueChange={setDocumentNumber} isRequired />
              <Input label="Correo Electrónico" value={email} onValueChange={setEmail} type="email" isRequired />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Contraseña"
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onValueChange={setPassword}
                  isRequired
                  endContent={
                    <PasswordEndContent isVisible={isPasswordVisible} onToggle={togglePasswordVisibility} onGenerate={handleGeneratePassword} />
                  }
                />
                <Input
                  label="Confirmar"
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  value={confirmPassword}
                  onValueChange={setConfirmPassword}
                  errorMessage={passwordsMatch ? "" : "Las contraseñas no coinciden"}
                  isInvalid={!passwordsMatch}
                  isRequired
                  endContent={
                    <PasswordVisibilityToggle isVisible={isConfirmPasswordVisible} onToggle={toggleConfirmPasswordVisibility} />
                  }
                />
              </div>

              <Button color="primary" isLoading={loading} onPress={onSubmitRegister} isDisabled={!isValid}>
                Crear Cuenta
              </Button>

              <p className="text-sm text-foreground-500 text-center">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" color="primary">
                  Inicia Sesión
                </Link>
              </p>
            </>
          ) : (
            <VerifyEmailStep
              email={email}
              onVerified={onVerified}
              loading={loading}
              setLoading={setLoading}
            />
          )}
        </CardBody>
      </Card>
    </div>
  )
}
