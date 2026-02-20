"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Monitor } from "lucide-react"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent
} from "@/components/ui/chart"
import { Card, CardBody, CardHeader } from "@heroui/react"
import type { PoaiPpa } from "@/types/financial"

type Props = {
    data: PoaiPpa[]
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

function formatCurrency(value: number) {
    if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
    return `$${value}`
}

export function YearsComparisonChart({ data }: Readonly<Props>) {
    const chartData = data.map(item => ({
        year: item.year.toString(),
        projectedPoai: Number.parseFloat(item.projectedPoai),
        assignedPoai: Number.parseFloat(item.assignedPoai),
    }))

    return (
        <Card className="h-full">
            <CardHeader className="flex items-center gap-2 px-6 pt-6">
                <Monitor className="w-5 h-5 text-default-500" />
                <div className="flex flex-col gap-1">
                    <h3 className="text-lg font-semibold">Comparativa Anual</h3>
                    <p className="text-sm text-default-500">Proyectado vs Asignado por año</p>
                </div>
            </CardHeader>
            <CardBody className="px-6 pb-6">
                <ChartContainer config={chartConfig} className="h-[350px] w-full">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        barGap={0}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="year"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                        />
                        <YAxis
                            tickFormatter={formatCurrency}
                            tickLine={false}
                            axisLine={false}
                            width={70}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dashed" />}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar
                            dataKey="projectedPoai"
                            fill="var(--color-projectedPoai)"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={50}
                        />
                        <Bar
                            dataKey="assignedPoai"
                            fill="var(--color-assignedPoai)"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={50}
                        />
                    </BarChart>
                </ChartContainer>
            </CardBody>
        </Card>
    )
}
