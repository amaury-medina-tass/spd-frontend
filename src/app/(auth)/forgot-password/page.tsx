"use client"

import { Button, Card, CardBody, CardHeader, Input, Link, InputOtp } from "@heroui/react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { post } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { ThemeToggle } from "@/components/layout/ThemeToggle"
import { addToast } from "@heroui/toast"
import { Eye, EyeOff } from "lucide-react"
import { getErrorMessage } from "@/lib/error-codes"

export default function ForgotPasswordPage() {
    const router = useRouter()

    const [step, setStep] = useState<"email" | "reset">("email")

    const [email, setEmail] = useState("")
    const [code, setCode] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [isVisible, setIsVisible] = useState(false)
    const [isConfirmVisible, setIsConfirmVisible] = useState(false)

    const [loading, setLoading] = useState(false)

    const toggleVisibility = () => setIsVisible(!isVisible)
    const toggleConfirmVisibility = () => setIsConfirmVisible(!isConfirmVisible)

    const passwordsMatch = useMemo(() => {
        if (!confirmPassword) return true
        return password === confirmPassword
    }, [password, confirmPassword])

    // Paso 1: Enviar correo
    const onSubmitEmail = async () => {
        if (!email) return
        setLoading(true)

        try {
            await post(endpoints.auth.forgotPassword, { email })

            addToast({
                title: "Si el correo existe, se enviará un código",
                color: "success",
            })

            setStep("reset")

        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : (e.data?.message ?? "Error al procesar solicitud")
            addToast({
                title: message,
                color: "danger",
            })
        } finally {
            setLoading(false)
        }
    }

    // Paso 2: Restablecer contraseña
    const onSubmitReset = async () => {
        if (!code || !password || !passwordsMatch) return
        setLoading(true)

        try {
            await post(endpoints.auth.resetPassword, {
                email,
                code,
                newPassword: password
            })

            addToast({
                title: "Contraseña restablecida correctamente",
                color: "success",
            })

            router.push("/login")
        } catch (e: any) {
            console.log(e)
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : (e.data?.message ?? "Error al restablecer contraseña")
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
                        {step === "email" ? "Recuperar Contraseña" : "Restablecer Contraseña"}
                    </h1>
                </CardHeader>
                <CardBody className="gap-6">
                    {step === "email" ? (
                        <>
                            <p className="text-sm text-default-500 text-center">
                                Ingresa tu correo electrónico para recibir un código de recuperación.
                            </p>
                            <Input
                                label="Correo Electrónico"
                                value={email}
                                onValueChange={setEmail}
                                type="email"
                                isRequired
                            />

                            <Button color="primary" isLoading={loading} onPress={onSubmitEmail} isDisabled={!email}>
                                Enviar código
                            </Button>
                        </>
                    ) : (
                        <>
                            <p className="text-sm text-default-500 text-center">
                                Ingresa el código que enviamos a <strong>{email}</strong> y tu nueva contraseña.
                            </p>

                            <div className="flex justify-center">
                                <InputOtp
                                    length={6}
                                    value={code}
                                    onValueChange={setCode}
                                    isDisabled={loading}
                                />
                            </div>

                            <Input
                                label="Nueva Contraseña"
                                value={password}
                                onValueChange={setPassword}
                                type={isVisible ? "text" : "password"}
                                isRequired
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

                            <Input
                                label="Confirmar Contraseña"
                                value={confirmPassword}
                                onValueChange={setConfirmPassword}
                                type={isConfirmVisible ? "text" : "password"}
                                isRequired
                                errorMessage={!passwordsMatch ? "Las contraseñas no coinciden" : ""}
                                isInvalid={!passwordsMatch}
                                endContent={
                                    <Button isIconOnly size="sm" variant="light" onPress={toggleConfirmVisibility}>
                                        {isConfirmVisible ? (
                                            <EyeOff size={18} className="text-default-400 pointer-events-none" />
                                        ) : (
                                            <Eye size={18} className="text-default-400 pointer-events-none" />
                                        )}
                                    </Button>
                                }
                            />

                            <Button color="primary" isLoading={loading} onPress={onSubmitReset} isDisabled={!code || !password || !passwordsMatch}>
                                Cambiar Contraseña
                            </Button>
                        </>
                    )}

                    <div className="flex justify-center">
                        <Link href="/login" size="sm" color="foreground">
                            Volver al inicio
                        </Link>
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}