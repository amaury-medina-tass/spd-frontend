"use client"

import { Button, InputOtp } from "@heroui/react"
import { useState } from "react"
import { post } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import { addToast } from "@heroui/toast"
import { getErrorMessage } from "@/lib/error-codes"

interface VerifyEmailStepProps {
    email: string
    onVerified: () => Promise<void>
    loading: boolean
    setLoading: (loading: boolean) => void
    children?: React.ReactNode
}

export function VerifyEmailStep({ email, onVerified, loading, setLoading, children }: Readonly<VerifyEmailStepProps>) {
    const [code, setCode] = useState("")

    const onVerify = async () => {
        if (!code) return
        setLoading(true)
        try {
            await post(endpoints.auth.verifyEmail, { email, code })
            await onVerified()
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : "Error al verificar código"
            addToast({ title: message, color: "danger" })
        } finally {
            setLoading(false)
        }
    }

    const onResend = async () => {
        setLoading(true)
        try {
            await post(endpoints.auth.resendVerification, { email })
            addToast({ title: "Código reenviado correctamente", color: "success" })
        } catch (e: any) {
            const errorCode = e.data?.errors?.code
            const message = errorCode ? getErrorMessage(errorCode) : (e.data?.message ?? "Error al reenviar código")
            addToast({ title: message, color: "danger" })
        } finally {
            setLoading(false)
        }
    }

    return (
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

            {children}
        </>
    )
}
