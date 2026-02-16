"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Card, CardBody, CardHeader } from "@heroui/react"
import { BarChart3 } from "lucide-react"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart"
import type { DashboardBudgetModifications } from "@/types/dashboard"

type Props = {
    data: DashboardBudgetModifications
    activityBudgetCeiling: number
    activityBalance: number
}

const chartConfig = {
    valor: {
        label: "Valor Inicial",
        color: "hsl(var(--chart-1))",
    },
    saldo: {
        label: "Saldo Actual",
        color: "hsl(var(--chart-2))",
    },
    ajuste: {
        label: "Ajuste",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value)

export function BudgetModificationsChart({ data, activityBudgetCeiling, activityBalance }: Props) {
    const chartData = []

    if (data.totalAdditions > 0) {
        chartData.push({
            type: "Adiciones",
            valor: activityBudgetCeiling,
            saldo: activityBalance,
            ajuste: data.totalAdditions,
        })
    }

    if (data.totalReductions > 0) {
        chartData.push({
            type: "Reducciones",
            valor: activityBudgetCeiling,
            saldo: activityBalance,
            ajuste: data.totalReductions,
        })
    }

    if (!chartData.length) {
        return (
            <Card>
                <CardHeader className="flex flex-col items-start gap-1 px-6 pt-6 pb-0">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-default-500" />
                        <h3 className="text-lg font-semibold">Ajustes Presupuestales</h3>
                    </div>
                </CardHeader>
                <CardBody className="flex items-center justify-center h-[250px]">
                    <p className="text-default-400">No hay ajustes registrados</p>
                </CardBody>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="flex flex-col items-start gap-1 px-6 pt-6 pb-0">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-default-500" />
                    <h3 className="text-lg font-semibold">Ajustes Presupuestales</h3>
                </div>
                <p className="text-sm text-default-500">
                    Adiciones: {formatCurrency(data.totalAdditions)} | Reducciones: {formatCurrency(data.totalReductions)} | Redistribuciones: {data.totalTransfers}
                </p>
            </CardHeader>
            <CardBody className="px-6 pb-6">
                <ChartContainer config={chartConfig} className="h-[280px] w-full">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="type" tickLine={false} axisLine={false} tickMargin={10} />
                        <YAxis
                            tickFormatter={(v) =>
                                new Intl.NumberFormat("es-CO", { notation: "compact" }).format(v)
                            }
                            tickLine={false}
                            axisLine={false}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(value) => formatCurrency(Number(value))}
                                />
                            }
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar dataKey="valor" fill="var(--color-valor)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="saldo" fill="var(--color-saldo)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="ajuste" fill="var(--color-ajuste)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ChartContainer>
            </CardBody>
        </Card>
    )
}
