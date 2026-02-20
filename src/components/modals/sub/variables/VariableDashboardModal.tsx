"use client"

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Select, SelectItem, Card, CardBody, CardHeader, Chip } from "@heroui/react"
import { useCallback, useEffect, useState, useMemo } from "react"
import { VariableDashboardData } from "@/types/masters/variables"
import { getVariableDashboardData } from "@/services/sub/variables.service"
import { Calendar, Target, TrendingUp, BarChart3, Activity, Layers } from "lucide-react"
import { addToast } from "@heroui/toast"
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { DASHBOARD_MONTHS } from "@/config/dashboard-chart-config"
import { AdvancesLineChart } from "@/components/charts/AdvancesLineChart"
import { DashboardLoadingView, DashboardEmptyView } from "@/components/modals/shared/DashboardStatusViews"

interface VariableDashboardModalProps {
    isOpen: boolean
    onClose: () => void
    variableId: string | null
    variableCode?: string
}

const goalsChartConfig = {
    value: {
        label: "Meta",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

const quadrenniumsChartConfig = {
    value: {
        label: "Cuatrienio",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig

export function VariableDashboardModal({ isOpen, onClose, variableId, variableCode }: Readonly<VariableDashboardModalProps>) {
    const currentYear = new Date().getFullYear()
    const [year, setYear] = useState<string>(currentYear.toString())
    const [month, setMonth] = useState<string>("all")
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<VariableDashboardData | null>(null)

    const years = useMemo(() => {
        const yearsArray = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i)
        return yearsArray.map(y => ({ key: y.toString(), label: y.toString() }))
    }, [])

    const fetchData = useCallback(async () => {
        if (!variableId) return
        setLoading(true)
        try {
            const result = await getVariableDashboardData(variableId, year, month)
            setData(result)
        } catch (e: any) {
            const msg = e.message || "Error al cargar datos de la variable"
            addToast({ title: "Error", description: msg, color: "danger" })
        } finally {
            setLoading(false)
        }
    }, [variableId, year, month])

    useEffect(() => {
        if (isOpen && variableId) {
            fetchData()
        } else if (!isOpen) {
            setData(null)
            setYear(currentYear.toString())
            setMonth("all")
        }
    }, [isOpen, variableId, fetchData, currentYear])

    // Chart data transformations
    const advancesChartData = useMemo(() => {
        if (!data) return []
        // Fill missing months with 0 or null if needed, logic here assumes we show what we have
        return data.advances.map(adv => ({
            month: DASHBOARD_MONTHS[adv.month - 1],
            value: adv.value,
        })).sort((a, b) => DASHBOARD_MONTHS.indexOf(a.month) - DASHBOARD_MONTHS.indexOf(b.month))
    }, [data])

    const goalsChartData = useMemo(() => {
        if (!data) return []
        return data.goals.map(g => ({
            year: g.year.toString(),
            value: g.value,
        })).sort((a, b) => Number.parseInt(a.year) - Number.parseInt(b.year))
    }, [data])

    const quadrenniumsChartData = useMemo(() => {
        if (!data) return []
        return data.quadrenniums.map(q => ({
            range: `${q.startYear}-${q.endYear}`,
            value: q.value,
        })).sort((a, b) => Number.parseInt(a.range.split('-')[0]) - Number.parseInt(b.range.split('-')[0]))
    }, [data])

    return (
        <Modal
            size="5xl"
            isOpen={isOpen}
            onClose={onClose}
            scrollBehavior="inside"
        >
            <ModalContent>
                {(onCloseModal) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 border-b border-divider">
                            <div className="flex items-center gap-2">
                                <BarChart3 className="text-primary" size={20} />
                                <span className="font-bold">Dashboard de Variable</span>
                                {variableCode && <Chip size="sm" variant="flat" color="primary">{variableCode}</Chip>}
                            </div>
                        </ModalHeader>
                        <ModalBody className="p-6">
                            {/* Filters */}
                            <div className="flex gap-4 justify-end mb-6">
                                <Select
                                    label="Año"
                                    placeholder="Seleccionar año"
                                    selectedKeys={[year]}
                                    className="max-w-[140px]"
                                    size="sm"
                                    onChange={(e) => setYear(e.target.value)}
                                    startContent={<Calendar size={14} />}
                                    disallowEmptySelection
                                >
                                    {[
                                        { key: "all", label: "Todos" },
                                        ...years
                                    ].map((y) => (
                                        <SelectItem key={y.key}>
                                            {y.label}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <Select
                                    label="Mes"
                                    placeholder="Seleccionar mes"
                                    selectedKeys={[month]}
                                    className="max-w-[140px]"
                                    size="sm"
                                    onChange={(e) => setMonth(e.target.value)}
                                    startContent={<Calendar size={14} />}
                                    disallowEmptySelection
                                >
                                    {[
                                        { key: "all", label: "Todos" },
                                        ...DASHBOARD_MONTHS.map((m, i) => ({ key: (i + 1).toString(), label: m }))
                                    ].map((m) => (
                                        <SelectItem key={m.key}>
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </Select>
                            </div>

                            {loading && (
                                <DashboardLoadingView />
                            )}
                            {!loading && data && (
                                <div className="flex flex-col gap-6">
                                    {/* Variable Info */}
                                    <Card className="border border-divider shadow-sm">
                                        <CardBody className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                                                    <Activity className="text-primary" size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground">{data.variable.name}</h3>
                                                    <p className="text-sm text-default-500">{data.variable.code}</p>
                                                    {data.variable.observations && (
                                                        <p className="text-xs text-default-400 mt-1">{data.variable.observations}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>

                                    {/* Charts Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {/* Advances Chart */}
                                        <Card className="border border-divider shadow-sm col-span-1 lg:col-span-2">
                                            <CardHeader className="flex flex-row items-center gap-2 pb-2 px-4 pt-4">
                                                <TrendingUp size={18} className="text-success" />
                                                <h4 className="font-semibold text-sm">Avances Mensuales ({year})</h4>
                                            </CardHeader>
                                            <CardBody className="px-4 pb-4 pt-0">
                                                <AdvancesLineChart
                                                    data={advancesChartData}
                                                    height="h-[250px]"
                                                    emptyText="Sin avances registrados para este año"
                                                    leftMargin={10}
                                                />
                                            </CardBody>
                                        </Card>

                                        {/* Goals Chart */}
                                        <Card className="border border-divider shadow-sm">
                                            <CardHeader className="flex flex-row items-center gap-2 pb-2 px-4 pt-4">
                                                <Target size={18} className="text-secondary" />
                                                <h4 className="font-semibold text-sm">Metas Anuales</h4>
                                            </CardHeader>
                                            <CardBody className="px-4 pb-4 pt-0">
                                                {goalsChartData.length === 0 ? (
                                                    <div className="h-[200px] flex items-center justify-center text-default-400 text-sm italic">
                                                        Sin metas registradas
                                                    </div>
                                                ) : (
                                                    <ChartContainer config={goalsChartConfig} className="h-[200px] w-full">
                                                        <BarChart data={goalsChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                                            <XAxis
                                                                dataKey="year"
                                                                tickLine={false}
                                                                axisLine={false}
                                                                tickMargin={8}
                                                                fontSize={12}
                                                            />
                                                            <YAxis
                                                                tickLine={false}
                                                                axisLine={false}
                                                                tickMargin={8}
                                                                fontSize={12}
                                                            />
                                                            <ChartTooltip
                                                                cursor={false}
                                                                content={<ChartTooltipContent indicator="dashed" />}
                                                            />
                                                            <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} />
                                                        </BarChart>
                                                    </ChartContainer>
                                                )}
                                            </CardBody>
                                        </Card>

                                        {/* Quadrenniums Chart */}
                                        <Card className="border border-divider shadow-sm">
                                            <CardHeader className="flex flex-row items-center gap-2 pb-2 px-4 pt-4">
                                                <Layers size={18} className="text-warning" />
                                                <h4 className="font-semibold text-sm">Cuatrienios</h4>
                                            </CardHeader>
                                            <CardBody className="px-4 pb-4 pt-0">
                                                {quadrenniumsChartData.length === 0 ? (
                                                    <div className="h-[200px] flex items-center justify-center text-default-400 text-sm italic">
                                                        Sin cuatrienios registrados
                                                    </div>
                                                ) : (
                                                    <ChartContainer config={quadrenniumsChartConfig} className="h-[200px] w-full">
                                                        <BarChart data={quadrenniumsChartData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                                            <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                                                            <XAxis type="number" hide />
                                                            <YAxis
                                                                dataKey="range"
                                                                type="category"
                                                                tickLine={false}
                                                                axisLine={false}
                                                                tickMargin={8}
                                                                fontSize={12}
                                                                width={70}
                                                            />
                                                            <ChartTooltip
                                                                cursor={false}
                                                                content={<ChartTooltipContent indicator="dashed" />}
                                                            />
                                                            <Bar dataKey="value" fill="var(--color-value)" radius={[0, 4, 4, 0]} barSize={20} />
                                                        </BarChart>
                                                    </ChartContainer>
                                                )}
                                            </CardBody>
                                        </Card>
                                    </div>
                                </div>
                            )}
                            {!loading && !data && (
                                <DashboardEmptyView />
                            )}
                        </ModalBody>
                        <ModalFooter className="border-t border-divider">
                            <Button color="danger" variant="light" onPress={onCloseModal}>
                                Cerrar
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}
