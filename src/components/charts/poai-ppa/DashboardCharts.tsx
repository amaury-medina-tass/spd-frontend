"use client"

import {
    Bar,
    CartesianGrid,
    Line,
    XAxis,
    ComposedChart
} from "recharts"
import { Activity } from "lucide-react"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart"
import { Card, CardBody, CardHeader } from "@heroui/react"
import type { PoaiPpaTrendItem } from "@/types/financial"

type Props = {
    data: PoaiPpaTrendItem[]
}

const chartConfig = {
    projectCount: {
        label: "Proyectos Activos",
        color: "hsl(var(--chart-3))", // Blue/Slate for bars
    },
    executionRate: {
        label: "Tasa Ejecución (%)",
        color: "hsl(var(--chart-5))", // Orange for line
    },
} satisfies ChartConfig

export function DashboardCharts({ data }: Readonly<Props>) {
    const chartData = data.map(item => ({
        year: item.year.toString(),
        projectCount: item.projectCount,
        executionRate: Number.parseFloat(item.executionRate.toFixed(1)),
    }))

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-col items-start gap-1 px-6 pt-6 pb-0">
                <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-default-500" />
                    <h3 className="text-lg font-semibold">Resumen Ejecutivo</h3>
                </div>
                <p className="text-sm text-default-500">
                    Proyectos activos vs Tasa de ejecución promedio
                </p>
            </CardHeader>
            <CardBody className="px-6 pb-6">
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <ComposedChart
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
                            content={<ChartTooltipContent />}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Bar
                            dataKey="projectCount"
                            fill="var(--color-projectCount)"
                            radius={[4, 4, 0, 0]}
                            barSize={40}
                            yAxisId="left"
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="executionRate"
                            stroke="var(--color-executionRate)"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "var(--color-executionRate)" }}
                            activeDot={{ r: 6 }}
                        />
                    </ComposedChart>
                </ChartContainer>
            </CardBody>
        </Card>
    )
}
