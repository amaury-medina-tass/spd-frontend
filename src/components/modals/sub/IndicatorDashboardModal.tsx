"use client"

import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Select, SelectItem, Tabs, Tab, Card, CardBody, CardHeader, Divider, Chip } from "@heroui/react"
import { useCallback, useEffect, useState, useMemo } from "react"
import { IndicatorDetailedData, IndicatorDetailedVariable } from "@/types/sub/indicator-dashboard"
import { getActionIndicatorDetailed, getIndicativeIndicatorDetailed } from "@/services/sub/variable-advances.service"
import { Calendar, Target, TrendingUp, BarChart3, Variable, Activity } from "lucide-react"
import { addToast } from "@heroui/toast"
import { RadialBarChart, RadialBar, PolarAngleAxis } from "recharts"
import {
    ChartConfig,
    ChartContainer,
} from "@/components/ui/chart"
import { DASHBOARD_MONTHS, DASHBOARD_MONTHS_FULL } from "@/config/dashboard-chart-config"
import { AdvancesLineChart } from "@/components/charts/AdvancesLineChart"
import { DashboardLoadingView, DashboardEmptyView } from "@/components/modals/shared/DashboardStatusViews"

interface IndicatorDashboardModalProps {
    isOpen: boolean
    onClose: () => void
    indicatorId: string | null
    indicatorCode?: string
    type: "action" | "indicative"
}

const goalsChartConfig = {
    goal: {
        label: "Meta",
        color: "hsl(var(--chart-2))",
    },
    fill: {
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

const variableChartConfig = {
    value: {
        label: "Valor",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig

export function IndicatorDashboardModal({ isOpen, onClose, indicatorId, indicatorCode, type }: Readonly<IndicatorDashboardModalProps>) {
    const currentYear = new Date().getFullYear()
    const [year, setYear] = useState<string>(currentYear.toString())
    const [month, setMonth] = useState<string>("all")
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<IndicatorDetailedData | null>(null)

    const years = useMemo(() => {
        const yearsArray = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i)
        return [{ key: "all", label: "Todos" }, ...yearsArray.map(y => ({ key: y.toString(), label: y.toString() }))]
    }, [])

    const months = useMemo(() => {
        return [
            { key: "all", label: "Todos" },
            ...DASHBOARD_MONTHS_FULL.map((m, i) => ({ key: (i + 1).toString(), label: m }))
        ]
    }, [])

    const fetchData = useCallback(async () => {
        if (!indicatorId) return
        setLoading(true)
        try {
            let result: IndicatorDetailedData
            if (type === "action") {
                result = await getActionIndicatorDetailed(indicatorId, year, month)
            } else {
                result = await getIndicativeIndicatorDetailed(indicatorId, year, month)
            }
            setData(result)
        } catch (e: any) {
            const msg = e.message || "Error al cargar datos del indicador"
            addToast({ title: "Error", description: msg, color: "danger" })
        } finally {
            setLoading(false)
        }
    }, [indicatorId, year, month, type])

    useEffect(() => {
        if (isOpen && indicatorId) {
            fetchData()
        } else if (!isOpen) {
            setData(null)
            setYear(currentYear.toString())
            setMonth("all")
        }
    }, [isOpen, indicatorId, fetchData, currentYear])

    // Calculate totals
    const totalAdvances = useMemo(() => {
        if (!data) return 0
        return data.advances.reduce((sum, adv) => sum + adv.value, 0)
    }, [data])

    const totalGoal = useMemo(() => {
        if (!data?.goals.length) return 0
        return data.goals.reduce((sum, g) => sum + g.value, 0)
    }, [data])

    const progressPercentage = useMemo(() => {
        if (!totalGoal) return 0
        return Math.min(100, (totalAdvances / totalGoal) * 100)
    }, [totalAdvances, totalGoal])

    // Chart data transformations
    const advancesChartData = useMemo(() => {
        if (!data) return []
        return data.advances.map(adv => ({
            month: DASHBOARD_MONTHS[adv.month - 1],
            value: adv.value,
        }))
    }, [data])

    const goalsChartData = useMemo(() => {
        if (!data) return []
        return data.goals.map(g => ({
            year: g.year.toString(),
            value: g.value,
        }))
    }, [data])

    let progressColorClass = "text-danger";
    if (progressPercentage >= 100) progressColorClass = "text-success";
    else if (progressPercentage >= 50) progressColorClass = "text-warning";

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
                                <span className="font-bold">Dashboard del Indicador</span>
                                <Chip size="sm" variant="flat" color="primary">{indicatorCode}</Chip>
                            </div>
                        </ModalHeader>
                        <ModalBody className="p-6">
                            {/* Filters */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-end items-end sm:items-center mb-6">
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
                                    {years.map((y) => (
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
                                    {months.map((m) => (
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
                                    {/* Indicator Info */}
                                    <Card className="border border-divider shadow-sm">
                                        <CardBody className="p-4">
                                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                                                        <Activity className="text-primary" size={20} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-foreground">{data.indicator.name}</h3>
                                                        <p className="text-sm text-default-500">{data.indicator.code} • {data.indicator.unitMeasure}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-6">
                                                    <div className="text-center">
                                                        <p className="text-xs text-default-400">Meta</p>
                                                        <p className="text-xl font-bold text-primary">{totalGoal || "-"}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs text-default-400">Avance</p>
                                                        <p className="text-xl font-bold text-success">{totalAdvances}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs text-default-400">Cumplimiento</p>
                                                        <p className={`text-xl font-bold ${progressColorClass}`}>
                                                            {progressPercentage.toFixed(0)}%
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>

                                    {/* Charts Grid */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {/* Advances Chart */}
                                        <Card className="border border-divider shadow-sm">
                                            <CardHeader className="flex flex-row items-center gap-2 pb-2 px-4 pt-4">
                                                <TrendingUp size={18} className="text-success" />
                                                <h4 className="font-semibold text-sm">Avances Mensuales</h4>
                                            </CardHeader>
                                            <CardBody className="px-4 pb-4 pt-0">
                                                <AdvancesLineChart data={advancesChartData} />
                                            </CardBody>
                                        </Card>

                                        {/* Goals Chart */}
                                        <Card className="border border-divider shadow-sm">
                                            <CardHeader className="flex flex-row items-center gap-2 pb-2 px-4 pt-4">
                                                <Target size={18} className="text-primary" />
                                                <h4 className="font-semibold text-sm">Metas por Año</h4>
                                            </CardHeader>
                                            <CardBody className="px-4 pb-4 pt-0">
                                                {goalsChartData.length === 0 ? (
                                                    <div className="h-[200px] flex items-center justify-center text-default-400 text-sm italic">
                                                        Sin metas registradas
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-wrap gap-4 justify-center items-center h-[200px]">
                                                        {goalsChartData.map((goal, i) => (
                                                            <div key={goal.year} className="flex flex-col items-center">
                                                                <ChartContainer config={goalsChartConfig} className="h-[120px] w-[120px]">
                                                                    <RadialBarChart
                                                                        data={[{ goal: progressPercentage, fill: "hsl(var(--chart-2))" }]}
                                                                        innerRadius={35}
                                                                        outerRadius={55}
                                                                        startAngle={90}
                                                                        endAngle={-270}
                                                                    >
                                                                        <PolarAngleAxis
                                                                            type="number"
                                                                            domain={[0, 100]}
                                                                            angleAxisId={0}
                                                                            tick={false}
                                                                        />
                                                                        <RadialBar
                                                                            dataKey="goal"
                                                                            background={{ fill: "hsl(var(--muted))" }}
                                                                            cornerRadius={10}
                                                                            fill="hsl(var(--chart-2))"
                                                                        />
                                                                        <text
                                                                            x="50%"
                                                                            y="50%"
                                                                            textAnchor="middle"
                                                                            dominantBaseline="middle"
                                                                            className="fill-foreground text-lg font-bold"
                                                                        >
                                                                            {goal.value}
                                                                        </text>
                                                                    </RadialBarChart>
                                                                </ChartContainer>
                                                                <span className="text-sm font-medium text-default-600 -mt-2">{goal.year}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardBody>
                                        </Card>
                                    </div>

                                    {/* Variables Section */}
                                    {data.variables.length > 0 && (
                                        <Card className="border border-divider shadow-sm">
                                            <CardHeader className="flex flex-row items-center gap-2 pb-0 px-4 pt-4">
                                                <Variable size={18} className="text-secondary" />
                                                <h4 className="font-semibold text-sm">Variables ({data.variables.length})</h4>
                                            </CardHeader>
                                            <Divider className="my-2" />
                                            <CardBody className="p-0">
                                                <Tabs
                                                    aria-label="Variables"
                                                    variant="underlined"
                                                    color="secondary"
                                                    classNames={{
                                                        tabList: "gap-4 w-full relative rounded-none px-4 border-b border-divider",
                                                        cursor: "w-full bg-secondary",
                                                        tab: "max-w-fit px-2 h-10",
                                                        tabContent: "group-data-[selected=true]:text-secondary"
                                                    }}
                                                >
                                                    {data.variables.map((varItem, index) => (
                                                        <Tab key={varItem.variable.id} title={varItem.variable.description || `Var ${index + 1}`}>
                                                            <VariableDetailCard variable={varItem} />
                                                        </Tab>
                                                    ))}
                                                </Tabs>
                                            </CardBody>
                                        </Card>
                                    )}
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

// Sub-component for Variable Detail
function VariableDetailCard({ variable }: Readonly<{ variable: IndicatorDetailedVariable }>) {
    const chartData = useMemo(() => {
        return variable.advances.map(adv => ({
            month: DASHBOARD_MONTHS[adv.month - 1],
            value: adv.value,
        }))
    }, [variable.advances])

    return (
        <div className="p-4 space-y-4">
            {/* Variable Info */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-default-50 rounded-lg p-4">
                <div>
                    <h5 className="font-semibold text-foreground">{variable.variable.name}</h5>
                    <p className="text-sm text-default-500">{variable.variable.description}</p>
                </div>
                <div className="flex gap-4">
                    {variable.calculatedValue !== null && (
                        <div className="text-center">
                            <p className="text-xs text-default-400">Calculado</p>
                            <p className="text-lg font-bold text-secondary">{variable.calculatedValue}</p>
                        </div>
                    )}
                    <div className="text-center">
                        <p className="text-xs text-default-400">Avances</p>
                        <p className="text-lg font-bold text-foreground">{variable.advances.length}</p>
                    </div>
                </div>
            </div>

            {/* Variable Advances Chart */}
            {chartData.length > 0 ? (
                <Card className="border border-divider">
                    <CardHeader className="flex flex-row items-center gap-2 pb-2 px-4 pt-4">
                        <TrendingUp size={16} className="text-success" />
                        <h5 className="font-medium text-sm">Avances de la Variable</h5>
                    </CardHeader>
                    <CardBody className="px-4 pb-4 pt-0">
                        <AdvancesLineChart
                            data={chartData}
                            config={variableChartConfig}
                            height="h-[180px]"
                            fontSize={11}
                            emptyText="Sin avances registrados para esta variable"
                        />
                    </CardBody>
                </Card>
            ) : (
                <div className="text-center py-8 text-default-400 text-sm italic border rounded-lg border-dashed">
                    Sin avances registrados para esta variable
                </div>
            )}

            {/* Variable Goals */}
            {variable.goals.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Target size={14} className="text-primary" />
                        <span className="text-sm font-medium text-default-600">Metas</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {variable.goals.map((goal) => (
                            <Chip key={goal.id} size="sm" variant="bordered" color="primary">
                                {goal.year}: {goal.value}
                            </Chip>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
