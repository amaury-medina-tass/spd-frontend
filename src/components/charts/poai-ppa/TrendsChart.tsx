"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Globe, ArrowUpRight } from "lucide-react"
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
    totalProjected: {
        label: "Total Proyectado",
        color: "hsl(var(--chart-3))", // Deep blue/slate
    },
    totalAssigned: {
        label: "Total Asignado",
        color: "hsl(var(--chart-4))", // Purple/violet
    },
} satisfies ChartConfig

export function TrendsChart({ data }: Props) {
    const chartData = data.map(item => ({
        year: item.year.toString(),
        totalProjected: item.totalProjected,
        totalAssigned: item.totalAssigned,
    }))

    const totalGrowth = data.length >= 2
        ? ((data[data.length - 1].totalAssigned - data[0].totalAssigned) / data[0].totalAssigned) * 100
        : 0

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-col items-start gap-1 px-6 pt-6 pb-0">
                <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5 text-default-500" />
                    <h3 className="text-lg font-semibold">Tendencias Globales</h3>
                </div>
                <div className="flex items-center gap-2">
                    <p className="text-sm text-default-500">
                        Consolidado de todos los proyectos
                    </p>
                    {totalGrowth > 0 && (
                        <span className="flex items-center text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            {totalGrowth.toFixed(1)}% crecimiento
                        </span>
                    )}
                </div>
            </CardHeader>
            <CardBody className="px-6 pb-6">
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                    >
                        <defs>
                            <linearGradient id="fillProjected" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-totalProjected)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-totalProjected)" stopOpacity={0.1} />
                            </linearGradient>
                            <linearGradient id="fillAssigned" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-totalAssigned)" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="var(--color-totalAssigned)" stopOpacity={0.1} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="year"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={10}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                        />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Area
                            type="monotone"
                            dataKey="totalProjected"
                            stroke="var(--color-totalProjected)"
                            fill="url(#fillProjected)"
                            strokeWidth={2}
                        />
                        <Area
                            type="monotone"
                            dataKey="totalAssigned"
                            stroke="var(--color-totalAssigned)"
                            fill="url(#fillAssigned)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardBody>
        </Card>
    )
}
