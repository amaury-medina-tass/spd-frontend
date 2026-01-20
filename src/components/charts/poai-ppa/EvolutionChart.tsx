"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { TrendingUp, TrendingDown, Layers } from "lucide-react"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart"
import { Card, CardBody, CardHeader } from "@heroui/react"
import type { PoaiPpaEvolutionItem } from "@/types/financial"

type Props = {
    data: PoaiPpaEvolutionItem[]
}

const chartConfig = {
    projectedPoai: {
        label: "Proyectado",
        color: "hsl(var(--chart-1))",
    },
    assignedPoai: {
        label: "Asignado",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

function formatCurrencyShort(value: number): string {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
    return `${value}`
}

export function EvolutionChart({ data }: Props) {
    const chartData = data.map(item => ({
        year: item.year.toString(),
        projectedPoai: parseFloat(item.projectedPoai.toString()),
        assignedPoai: parseFloat(item.assignedPoai.toString()),
    }))

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-col items-start gap-1 px-6 pt-6 pb-0">
                <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-default-500" />
                    <h3 className="text-lg font-semibold">Evolución Presupuestal</h3>
                </div>
                <p className="text-sm text-default-500">
                    Cambios interanuales y tendencias de asignación
                </p>
            </CardHeader>
            <CardBody className="px-6 pb-6">
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <LineChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="year"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="line" />}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line
                            type="monotone"
                            dataKey="projectedPoai"
                            stroke="var(--color-projectedPoai)"
                            strokeWidth={2}
                            dot={{ r: 4, fill: "var(--color-projectedPoai)" }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            type="monotone"
                            dataKey="assignedPoai"
                            stroke="var(--color-assignedPoai)"
                            strokeWidth={2}
                            dot={{ r: 4, fill: "var(--color-assignedPoai)" }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardBody>
        </Card>
    )
}
