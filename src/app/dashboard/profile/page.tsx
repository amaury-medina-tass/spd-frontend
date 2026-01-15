"use client"

import Link from "next/link"
import { Card, CardBody, CardHeader, Spinner, Chip, Divider, Avatar, Button } from "@heroui/react"
import { useAuth } from "@/components/auth/useAuth"
import { Mail, Shield, Key, CheckCircle, XCircle, IdCard, FileText, ExternalLink } from "lucide-react"

export default function ProfilePage() {
    const { me, loading } = useAuth()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner size="lg" label="Cargando perfil..." />
            </div>
        )
    }

    if (!me) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-foreground-500">No se pudo cargar el perfil</p>
            </div>
        )
    }

    // Get initials for avatar
    const initials = `${me.first_name.charAt(0)}${me.last_name.charAt(0)}`.toUpperCase()

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Profile Header */}
            <Card>
                <CardBody className="p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <Avatar
                            name={initials}
                            className="w-20 h-20 text-2xl font-bold bg-primary text-white shrink-0"
                        />

                        <div className="flex-1 text-center sm:text-left">
                            <h1 className="text-2xl font-bold text-foreground">
                                {me.first_name} {me.last_name}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 mt-2 text-foreground-500">
                                <span className="flex items-center gap-1.5 text-sm">
                                    <Mail className="w-4 h-4" />
                                    {me.email}
                                </span>
                                <span className="flex items-center gap-1.5 text-sm">
                                    <IdCard className="w-4 h-4" />
                                    {me.document_number}
                                </span>
                            </div>
                        </div>

                        <div className="shrink-0">
                            {me.is_active ? (
                                <Chip
                                    color="success"
                                    variant="flat"
                                    startContent={<CheckCircle className="w-3.5 h-3.5" />}
                                    size="md"
                                    className="font-medium"
                                >
                                    Cuenta Activa
                                </Chip>
                            ) : (
                                <Chip
                                    color="danger"
                                    variant="flat"
                                    startContent={<XCircle className="w-3.5 h-3.5" />}
                                    size="md"
                                    className="font-medium"
                                >
                                    Cuenta Inactiva
                                </Chip>
                            )}
                        </div>
                    </div>
                </CardBody>
            </Card>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Roles Card - Takes 1/3 on large screens */}
                <Card className="lg:col-span-1">
                    <CardHeader className="flex items-center gap-2 pb-2">
                        <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                            <Shield className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <span className="font-semibold">Roles</span>
                    </CardHeader>
                    <Divider />
                    <CardBody className="gap-2">
                        {me.roles.map((role) => (
                            <div
                                key={role}
                                className="flex items-center gap-3 p-3 rounded-lg bg-default-100 dark:bg-default-50/50 transition-colors hover:bg-default-200 dark:hover:bg-default-100"
                            >
                                <div className="w-2 h-2 rounded-full bg-primary-500" />
                                <span className="font-medium text-sm">{role}</span>
                            </div>
                        ))}
                    </CardBody>
                </Card>

                {/* Info Card - Takes 2/3 on large screens */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex items-center gap-2 pb-2">
                        <div className="p-2 rounded-lg bg-secondary-100 dark:bg-secondary-900/30">
                            <FileText className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                        </div>
                        <span className="font-semibold">Información Personal</span>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        <div className="grid sm:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1 p-3 rounded-lg border border-divider/50 bg-content1">
                                <span className="text-xs text-foreground-400">
                                    Nombre
                                </span>
                                <span className="text-foreground">{me.first_name}</span>
                            </div>
                            <div className="flex flex-col gap-1 p-3 rounded-lg border border-divider/50 bg-content1">
                                <span className="text-xs text-foreground-400">
                                    Apellido
                                </span>
                                <span className="text-foreground">{me.last_name}</span>
                            </div>
                            <div className="flex flex-col gap-1 p-3 rounded-lg border border-divider/50 bg-content1">
                                <span className="text-xs text-foreground-400">
                                    Correo Electrónico
                                </span>
                                <span className="text-foreground">{me.email}</span>
                            </div>
                            <div className="flex flex-col gap-1 p-3 rounded-lg border border-divider/50 bg-content1">
                                <span className="text-xs text-foreground-400">
                                    Número de Documento
                                </span>
                                <span className="text-foreground font-mono text-sm">{me.document_number}</span>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Permissions Card - Full width */}
            <Card>
                <CardHeader className="flex items-center gap-2 pb-2">
                    <div className="p-2 rounded-lg bg-warning-100 dark:bg-warning-900/30">
                        <Key className="w-4 h-4 text-warning-600 dark:text-warning-500" />
                    </div>
                    <span className="font-semibold">Permisos del Sistema</span>
                    <Chip size="sm" variant="flat" className="ml-auto">
                        {Object.keys(me.permissions).length} módulos
                    </Chip>
                </CardHeader>
                <Divider />
                <CardBody>
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {Object.entries(me.permissions).map(([path, permission]) => (
                            <div
                                key={path}
                                className="p-4 rounded-xl border border-divider bg-default-50/50 dark:bg-default-50/20 hover:border-primary-200 dark:hover:border-primary-800 transition-colors"
                            >
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <h3 className="font-semibold text-sm">{permission.name}</h3>
                                    <Button
                                        as={Link}
                                        href={`/dashboard${path}`}
                                        size="sm"
                                        variant="flat"
                                        color="primary"
                                        endContent={<ExternalLink className="w-3 h-3" />}
                                    >
                                        Ir al módulo
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(permission.actions).map(([actionKey, action]) => (
                                        <Chip
                                            key={actionKey}
                                            size="sm"
                                            variant="dot"
                                            color={action.allowed ? "success" : "danger"}
                                            classNames={{
                                                base: "border-none px-2",
                                                content: "text-xs font-medium"
                                            }}
                                        >
                                            {action.name}
                                        </Chip>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}
