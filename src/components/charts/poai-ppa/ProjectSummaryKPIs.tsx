"use client"

import { Pie, PieChart, Label } from "recharts"
import { DollarSign, Calendar, TrendingUp, Target } from "lucide-react"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { Card, CardBody } from "@heroui/react"
import type { PoaiPpaSummary } from "@/types/financial"

type Props = {
    data: PoaiPpaSummary["summary"]
}

function formatCurrencyShort(value: number): string {
    if (value >= 1_000_000_000) {
        return `$${(value / 1_000_000_000).toFixed(1)}B`
    }
    if (value >= 1_000_000) {
        return `$${(value / 1_000_000).toFixed(1)}M`
    }
    return `$${value}`
}

function renderExecutionLabel(viewBox: Record<string, number | undefined> | undefined, executionRate: number) {
    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
        return (
            <text
                x={viewBox.cx}
                y={viewBox.cy}
                textAnchor="middle"
                dominantBaseline="middle"
            >
                <tspan
                    x={viewBox.cx}
                    y={viewBox.cy}
                    className="fill-foreground text-lg font-bold"
                >
                    {executionRate.toFixed(1)}%
                </tspan>
                <tspan
                    x={viewBox.cx}
                    y={(viewBox.cy || 0) + 16}
                    className="fill-muted-foreground text-[10px]"
                >
                    Ejecutado
                </tspan>
            </text>
        )
    }
    return undefined
}

export function ProjectSummaryKPIs({ data }: Readonly<Props>) {
    const totalRemaining = Math.max(0, data.totalProjected - data.totalAssigned)

    // Config for the donut chart
    const chartConfig = {
        assigned: {
            label: "Asignado",
            color: "hsl(var(--chart-2))", // Using teal/cyan color
        },
        remaining: {
            label: "Pendiente",
            color: "hsl(var(--chart-5))", // Using orange/warm color for remaining
        },
    } satisfies ChartConfig

    const executionData = [
        { name: "assigned", value: data.totalAssigned, fill: "var(--color-assigned)" },
        { name: "remaining", value: totalRemaining, fill: "var(--color-remaining)" },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Projected Card */}
            <Card className="shadow-sm border border-default-100">
                <CardBody className="gap-2">
                    <div className="flex items-center gap-2 text-default-500">
                        <div className="p-2 bg-primary/10 rounded-full">
                            <Target className="w-4 h-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Total Proyectado</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-bold tracking-tight">
                            {formatCurrencyShort(data.totalProjected)}
                        </p>
                        <p className="text-xs text-default-500">
                            Promedio anual: {formatCurrencyShort(data.avgProjected)}
                        </p>
                    </div>
                </CardBody>
            </Card>

            {/* Total Assigned Card */}
            <Card className="shadow-sm border border-default-100">
                <CardBody className="gap-2">
                    <div className="flex items-center gap-2 text-default-500">
                        <div className="p-2 bg-success/10 rounded-full">
                            <DollarSign className="w-4 h-4 text-success" />
                        </div>
                        <span className="text-sm font-medium">Total Asignado</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-bold tracking-tight">
                            {formatCurrencyShort(data.totalAssigned)}
                        </p>
                        <p className="text-xs text-default-500">
                            Promedio anual: {formatCurrencyShort(data.avgAssigned)}
                        </p>
                    </div>
                </CardBody>
            </Card>

            {/* Year Range Card */}
            <Card className="shadow-sm border border-default-100">
                <CardBody className="gap-2">
                    <div className="flex items-center gap-2 text-default-500">
                        <div className="p-2 bg-warning/10 rounded-full">
                            <Calendar className="w-4 h-4 text-warning" />
                        </div>
                        <span className="text-sm font-medium">Cronograma</span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-bold tracking-tight">
                            {data.minYear} - {data.maxYear}
                        </p>
                        <p className="text-xs text-default-500">
                            {data.yearCount} años de proyección
                        </p>
                    </div>
                </CardBody>
            </Card>

            {/* Execution Donut Chart Card */}
            <Card className="shadow-sm border border-default-100 row-span-2 md:row-span-1">
                <CardBody className="p-0 relative h-[160px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-x-0 top-3 px-4 flex items-center justify-between z-10">
                        <div className="flex items-center gap-2 text-default-500">
                            <div className="p-2 bg-secondary/10 rounded-full">
                                <TrendingUp className="w-4 h-4 text-secondary" />
                            </div>
                            <span className="text-sm font-medium">Ejecución</span>
                        </div>
                    </div>

                    <div className="w-full h-full flex items-center justify-center mt-4">
                        <ChartContainer config={chartConfig} className="h-[120px] w-[120px]">
                            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Pie
                                    data={executionData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius={40}
                                    outerRadius={55}
                                    strokeWidth={5}
                                >
                                    <Label
                                        content={({ viewBox }) => renderExecutionLabel(viewBox as Record<string, number | undefined> | undefined, data.executionRate)}
                                    />
                                </Pie>
                            </PieChart>
                        </ChartContainer>
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}
