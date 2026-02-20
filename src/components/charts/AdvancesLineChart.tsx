"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { advancesChartConfig } from "@/config/dashboard-chart-config"

interface AdvancesLineChartProps {
    data: { month: string; value: number }[]
    config?: ChartConfig
    height?: string
    emptyText?: string
    leftMargin?: number
    fontSize?: number
}

export function AdvancesLineChart({
    data,
    config = advancesChartConfig,
    height = "h-[200px]",
    emptyText = "Sin avances registrados",
    leftMargin = 0,
    fontSize = 12,
}: Readonly<AdvancesLineChartProps>) {
    if (data.length === 0) {
        return (
            <div className={`${height} flex items-center justify-center text-default-400 text-sm italic`}>
                {emptyText}
            </div>
        )
    }

    return (
        <ChartContainer config={config} className={`${height} w-full`}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: leftMargin, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={fontSize}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    fontSize={fontSize}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                />
                <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--color-value)" }}
                    activeDot={{ r: 6 }}
                />
            </LineChart>
        </ChartContainer>
    )
}
