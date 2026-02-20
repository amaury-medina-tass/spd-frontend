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
import type { DashboardProjectBudget } from "@/types/dashboard"

type Props = {
    data: DashboardProjectBudget[]
}

const chartConfig = {
    currentBudget: {
        label: "Presupuesto Actual",
        color: "hsl(var(--chart-1))",
    },
    execution: {
        label: "Ejecución",
        color: "hsl(var(--chart-2))",
    },
    available: {
        label: "Disponible",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
    }).format(value)

export function ProjectBudgetChart({ data }: Readonly<Props>) {
    const chartData = data.map((p) => ({
        name: p.code,
        currentBudget: p.currentBudget,
        execution: p.execution,
        available: p.available,
    }))

    if (!data.length) {
        return (
            <Card className="h-full">
                <CardHeader className="flex flex-col items-start gap-1 px-6 pt-6 pb-0">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-default-500" />
                        <h3 className="text-lg font-semibold">Presupuesto por Proyecto</h3>
                    </div>
                </CardHeader>
                <CardBody className="flex items-center justify-center h-[300px]">
                    <p className="text-default-400">No hay datos de proyectos</p>
                </CardBody>
            </Card>
        )
    }

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-col items-start gap-1 px-6 pt-6 pb-0">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-default-500" />
                    <h3 className="text-lg font-semibold">Presupuesto por Proyecto</h3>
                </div>
                <p className="text-sm text-default-500">
                    Comparación de presupuesto actual, ejecución y disponible
                </p>
            </CardHeader>
            <CardBody className="px-6 pb-6">
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="name"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                            fontSize={12}
                        />
                        <YAxis
                            tickFormatter={formatCurrency}
                            tickLine={false}
                            axisLine={false}
                            fontSize={11}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(value) =>
                                        new Intl.NumberFormat("es-CO", {
                                            style: "currency",
                                            currency: "COP",
                                            minimumFractionDigits: 0,
                                        }).format(Number(value))
                                    }
                                />
                            }
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar
                            dataKey="currentBudget"
                            fill="var(--color-currentBudget)"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            dataKey="execution"
                            fill="var(--color-execution)"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            dataKey="available"
                            fill="var(--color-available)"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardBody>
        </Card>
    )
}
