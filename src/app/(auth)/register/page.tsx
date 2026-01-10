"use client"

import { Button, Card, CardBody, CardHeader, Input, Link, InputOtp } from "@heroui/react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { post, HttpError } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { useAuth } from "@/components/auth/useAuth"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { Eye, EyeOff, RefreshCw } from "lucide-react"
import { getErrorMessage } from "@/lib/error-codes"
import { addToast } from "@heroui/toast"

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
  const [code, setCode] = useState("")

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)

  const [loading, setLoading] = useState(false)

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible)
  const toggleConfirmPasswordVisibility = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)

  const generatePassword = () => {
    const lowercase = "abcdefghijklmnopqrstuvwxyz"
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const numbers = "0123456789"
    const special = "!@#$%^&*"
    const allChars = lowercase + uppercase + numbers + special

    let pass = ""
    pass += lowercase.charAt(Math.floor(Math.random() * lowercase.length))
    pass += uppercase.charAt(Math.floor(Math.random() * uppercase.length))
    pass += numbers.charAt(Math.floor(Math.random() * numbers.length))
    pass += special.charAt(Math.floor(Math.random() * special.length))

    for (let i = 4; i < 12; i++) {
      pass += allChars.charAt(Math.floor(Math.random() * allChars.length))
    }

    pass = pass.split('').sort(() => 0.5 - Math.random()).join('')

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

  const onVerify = async () => {
    if (!code) return
    setLoading(true)
    try {
      await post(endpoints.auth.verifyEmail, { email, code })

      // Auto-login
      await post(endpoints.auth.login, { email, password })
      await refreshMe()

      addToast({
        title: "Cuenta verificada e iniciada correctamente",
        color: "success",
      })
      router.push("/dashboard")

    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : "Error al verificar código"

      addToast({
        title: message,
        color: "danger",
      })
    } finally {
      setLoading(false)
    }
  }

  const onResend = async () => {
    setLoading(true)
    try {
      await post(endpoints.auth.resendVerification, { email })
      addToast({
        title: "Código reenviado correctamente",
        color: "success",
      })
    } catch (e: any) {
      const errorCode = e.data?.errors?.code
      const message = errorCode ? getErrorMessage(errorCode) : (e.data?.message ?? "Error al reenviar código")
      addToast({
        title: message,
        color: "danger",
      })
    } finally {
      setLoading(false)
    }
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
                    <div className="flex gap-1 items-center">
                      <Button isIconOnly size="sm" variant="light" onPress={togglePasswordVisibility}>
                        {isPasswordVisible ? (
                          <EyeOff size={18} className="text-default-400 pointer-events-none" />
                        ) : (
                          <Eye size={18} className="text-default-400 pointer-events-none" />
                        )}
                      </Button>
                      <Button isIconOnly size="sm" variant="light" onPress={generatePassword} title="Generar contraseña">
                        <RefreshCw size={18} className="text-default-400" />
                      </Button>
                    </div>
                  }
                />
                <Input
                  label="Confirmar"
                  type={isConfirmPasswordVisible ? "text" : "password"}
                  value={confirmPassword}
                  onValueChange={setConfirmPassword}
                  errorMessage={!passwordsMatch ? "Las contraseñas no coinciden" : ""}
                  isInvalid={!passwordsMatch}
                  isRequired
                  endContent={
                    <Button isIconOnly size="sm" variant="light" onPress={toggleConfirmPasswordVisibility}>
                      {isConfirmPasswordVisible ? (
                        <EyeOff size={18} className="text-default-400 pointer-events-none" />
                      ) : (
                        <Eye size={18} className="text-default-400 pointer-events-none" />
                      )}
                    </Button>
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
            <>
              <p className="text-sm text-default-500 text-center">
                Ingresa el código que enviamos a <strong>{email}</strong>
              </p>

              <div className="flex justify-center my-4">
                <InputOtp
                  length={6}
                  value={code}
                  onValueChange={setCode}
                  isDisabled={loading}
                />
              </div>

              <Button color="primary" isLoading={loading} onPress={onVerify} isDisabled={!code}>
                Verificar Correo
              </Button>

              <div className="flex justify-center mt-4">
                <Button variant="light" size="sm" onPress={onResend} isDisabled={loading}>
                  ¿No recibiste el código? Reenviar
                </Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
