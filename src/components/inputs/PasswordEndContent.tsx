"use client"

import { Button } from "@heroui/react"
import { Eye, EyeOff, RefreshCw } from "lucide-react"

interface PasswordVisibilityToggleProps {
    isVisible: boolean
    onToggle: () => void
}

export function PasswordVisibilityToggle({ isVisible, onToggle }: Readonly<PasswordVisibilityToggleProps>) {
    return (
        <Button isIconOnly size="sm" variant="light" onPress={onToggle}>
            {isVisible ? (
                <EyeOff size={18} className="text-default-400 pointer-events-none" />
            ) : (
                <Eye size={18} className="text-default-400 pointer-events-none" />
            )}
        </Button>
    )
}

interface PasswordEndContentProps {
    isVisible: boolean
    onToggle: () => void
    onGenerate: () => void
}

export function PasswordEndContent({ isVisible, onToggle, onGenerate }: Readonly<PasswordEndContentProps>) {
    return (
        <div className="flex gap-1 items-center">
            <PasswordVisibilityToggle isVisible={isVisible} onToggle={onToggle} />
            <Button isIconOnly size="sm" variant="light" onPress={onGenerate} title="Generar contraseña">
                <RefreshCw size={18} className="text-default-400" />
            </Button>
        </div>
    )
}
