"use client"

import { Pie, PieChart, Cell } from "recharts"
import { Card, CardBody, CardHeader } from "@heroui/react"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart"
import type { DashboardCdp } from "@/types/dashboard"

type Props = {
    data: DashboardCdp[]
    title: string
    description?: string
}

const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(210, 70%, 50%)",
    "hsl(150, 60%, 45%)",
    "hsl(30, 80%, 55%)",
]

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value)

export function CdpDistributionChart({ data, title, description }: Props) {
    if (!data.length) {
        return (
            <Card>
                <CardHeader className="flex flex-col items-start gap-1 px-6 pt-6 pb-0">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    {description && <p className="text-sm text-default-500">{description}</p>}
                </CardHeader>
                <CardBody className="flex items-center justify-center h-[300px]">
                    <p className="text-default-400">No hay CDPs asociados</p>
                </CardBody>
            </Card>
        )
    }

    const chartConfig = data.reduce((acc, item, i) => {
        acc[`cdp-${i}`] = {
            label: `CDP ${item.number}`,
            color: COLORS[i % COLORS.length],
        }
        return acc
    }, {} as ChartConfig)

    const chartData = data.map((item, i) => ({
        name: `CDP ${item.number}`,
        value: item.totalValue,
        fill: COLORS[i % COLORS.length],
    }))

    return (
        <Card>
            <CardHeader className="flex flex-col items-start gap-1 px-6 pt-6 pb-0">
                <h3 className="text-lg font-semibold">{title}</h3>
                {description && <p className="text-sm text-default-500">{description}</p>}
            </CardHeader>
            <CardBody className="px-6 pb-6">
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <PieChart>
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    formatter={(value) => formatCurrency(Number(value))}
                                />
                            }
                        />
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={100}
                            paddingAngle={2}
                            cornerRadius={4}
                        >
                            {chartData.map((entry, i) => (
                                <Cell key={i} fill={entry.fill} />
                            ))}
                        </Pie>
                        <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                </ChartContainer>
            </CardBody>
        </Card>
    )
}
