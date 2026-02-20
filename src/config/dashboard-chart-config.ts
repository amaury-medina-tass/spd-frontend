import { ChartConfig } from "@/components/ui/chart"

export const DASHBOARD_MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

export const DASHBOARD_MONTHS_FULL = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

export const advancesChartConfig = {
    value: {
        label: "Avance",
        color: "hsl(var(--chart-1))",
    },
} satisfies ChartConfig
