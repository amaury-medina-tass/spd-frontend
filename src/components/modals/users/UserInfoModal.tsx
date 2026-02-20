"use client"

import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Switch,
    Spinner,
} from "@heroui/react"
import { useEffect, useState, useMemo } from "react"
import type { User } from "@/types/user"
import { PasswordEndContent, PasswordVisibilityToggle } from "@/components/inputs/PasswordEndContent"
import { generatePassword as generateSecurePassword } from "@/lib/password-utils"

export function UserInfoModal({
    isOpen,
    title,
    initial,
    onClose,
    onSave,
    isLoading,
}: Readonly<{
    isOpen: boolean
    title: string
    initial: User | null
    onClose: () => void
    onSave: (payload: any) => void
    isLoading?: boolean
}>) {
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [documentNumber, setDocumentNumber] = useState("")
    const [email, setEmail] = useState("")
    const [isActive, setIsActive] = useState(true)

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [isPasswordVisible, setIsPasswordVisible] = useState(false)
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false)

    useEffect(() => {
        if (isOpen) {
            if (initial) {
                setFirstName(initial.first_name)
                setLastName(initial.last_name)
                setDocumentNumber(initial.document_number)
                setEmail(initial.email)
                setIsActive(initial.is_active)
                setPassword("")
                setConfirmPassword("")
            } else {
                setFirstName("")
                setLastName("")
                setDocumentNumber("")
                setEmail("")
                setIsActive(true)
                setPassword("")
                setConfirmPassword("")
            }
        }
    }, [isOpen, initial])

    const handleGeneratePassword = () => {
        const pass = generateSecurePassword()
        setPassword(pass)
        setConfirmPassword(pass)
    }

    const passwordsMatch = useMemo(() => {
        if (!password) return true
        return password === confirmPassword
    }, [password, confirmPassword])

    const emailIsValid = useMemo(() => {
        if (email === "") return false
        return /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email)
    }, [email])

    const passwordErrors = useMemo(() => {
        const errors: string[] = []
        if (!password) return errors
        if (password.length < 8) errors.push("Mínimo 8 caracteres")
        if (!/[A-Z]/.test(password)) errors.push("Una mayúscula")
        if (!/[a-z]/.test(password)) errors.push("Una minúscula")
        if (!/\d/.test(password)) errors.push("Un número")
        if (!/[!@#$%^&*]/.test(password)) errors.push("Un carácter especial (!@#$%^&*)")
        return errors
    }, [password])

    const passwordIsValid = passwordErrors.length === 0

    const isValid = useMemo(() => {
        return (
            firstName.trim() !== "" &&
            lastName.trim() !== "" &&
            documentNumber.trim() !== "" &&
            emailIsValid &&
            (initial ? true : passwordIsValid) &&
            (password ? passwordIsValid : true) &&
            passwordsMatch
        )
    }, [firstName, lastName, documentNumber, emailIsValid, password, passwordIsValid, passwordsMatch, initial])

    const handleSave = () => {
        const payload: any = {
            firstName,
            lastName,
            documentNumber,
            email,
            is_active: isActive,
        }

        if (password) {
            payload.password = password
        }

        onSave(payload)
    }

    const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible)
    const toggleConfirmPasswordVisibility = () => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)

    return (
        <Modal isOpen={isOpen} onOpenChange={() => !isLoading && onClose()} size="2xl" scrollBehavior="inside" placement="center" isDismissable={!isLoading}
        >
            <ModalContent>
                <ModalHeader className="font-semibold">{title}</ModalHeader>
                <ModalBody className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="Nombre"
                        value={firstName}
                        onValueChange={setFirstName}
                        isRequired
                    />
                    <Input
                        label="Apellido"
                        value={lastName}
                        onValueChange={setLastName}
                        isRequired
                    />
                    <Input
                        label="Documento"
                        value={documentNumber}
                        onValueChange={(value) => setDocumentNumber(value.replaceAll(/\D/g, ""))}
                        isRequired
                        inputMode="numeric"
                        pattern="[0-9]*"
                    />
                    <Input
                        label="Email"
                        value={email}
                        onValueChange={setEmail}
                        type="email"
                        isRequired
                        isInvalid={email !== "" && !emailIsValid}
                        errorMessage={email !== "" && !emailIsValid ? "Correo electrónico inválido" : ""}
                    />

                    <div className="flex justify-between items-center px-4 py-2 rounded-xl border-2 border-default-100 hover:border-default-200 transition-colors h-14">
                        <span className="text-small text-default-600">{isActive ? "Usuario Activo" : "Usuario Inactivo"}</span>
                        <Switch
                            isSelected={isActive}
                            onValueChange={setIsActive}
                            color="success"
                            size="sm"
                            aria-label="Estado del usuario"
                        />
                    </div>

                    {!initial && (
                        <>
                            <div className="col-span-1 sm:col-span-2 border-t my-2" />

                            <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Contraseña"
                                    value={password}
                                    onValueChange={setPassword}
                                    type={isPasswordVisible ? "text" : "password"}
                                    isInvalid={!passwordIsValid && password !== ""}
                                    errorMessage={(!passwordIsValid && password !== "") ? (
                                        <ul className="list-disc pl-4 text-tiny">
                                            {passwordErrors.map((err) => <li key={err}>{err}</li>)}
                                        </ul>
                                    ) : ""}
                                    endContent={
                                        <PasswordEndContent isVisible={isPasswordVisible} onToggle={togglePasswordVisibility} onGenerate={handleGeneratePassword} />
                                    }
                                />
                                <Input
                                    label="Confirmar Contraseña"
                                    value={confirmPassword}
                                    onValueChange={setConfirmPassword}
                                    type={isConfirmPasswordVisible ? "text" : "password"}
                                    errorMessage={passwordsMatch ? "" : "Las contraseñas no coinciden"}
                                    isInvalid={!passwordsMatch}
                                    endContent={
                                        <PasswordVisibilityToggle isVisible={isConfirmPasswordVisible} onToggle={toggleConfirmPasswordVisibility} />
                                    }
                                />
                            </div>
                        </>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="light" onPress={onClose} isDisabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button
                        color="primary"
                        onPress={handleSave}
                        isDisabled={!isValid || isLoading}
                        startContent={isLoading ? <Spinner size="sm" color="current" /> : undefined}
                    >
                        Guardar
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
