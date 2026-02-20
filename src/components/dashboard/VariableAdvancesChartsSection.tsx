"use client"

import { useEffect, useState } from "react"
import { Card, CardBody, CardHeader, Spinner, Divider, Button, Chip } from "@heroui/react"
import { X, MapPin, TrendingUp, Target, Navigation } from "lucide-react"
import { getVariableAdvancesWithLocations } from "@/services/sub/variable-advances.service"
import { getVariableDashboardData } from "@/services/sub/variables.service"
import { VariableAdvanceWithLocation, VariableLocation } from "@/types/sub/variable-locations"
import { VariableDashboardData } from "@/types/masters/variables"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Bar, BarChart } from "recharts"

interface VariableAdvancesChartsSectionProps {
    variableId: string
    variableCode: string
    variableName: string
    onClose: () => void
}

export function VariableAdvancesChartsSection({ variableId, variableCode, variableName, onClose }: Readonly<VariableAdvancesChartsSectionProps>) {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [advancesWithLocations, setAdvancesWithLocations] = useState<VariableAdvanceWithLocation[]>([])
    const [variableLocations, setVariableLocations] = useState<VariableLocation[]>([])
    const [dashboardData, setDashboardData] = useState<VariableDashboardData | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            setError(null)
            try {
                const currentYear = new Date().getFullYear()
                const [locationsData, dashData] = await Promise.all([
                    getVariableAdvancesWithLocations(variableId),
                    getVariableDashboardData(variableId, currentYear.toString(), 'all')
                ])
                setAdvancesWithLocations(locationsData.advances || [])
                setVariableLocations(locationsData.variableLocations || [])
                setDashboardData(dashData)
            } catch (e: any) {
                setError(e.message ?? "Error al cargar datos de la variable")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [variableId])

    // Prepare chart data
    const chartData = dashboardData?.advances.map(advance => {
        const goal = dashboardData.goals.find(g => g.year === advance.year)
        return {
            period: `${advance.year}/${String(advance.month).padStart(2, '0')}`,
            year: advance.year,
            month: advance.month,
            avance: advance.value,
            meta: goal?.value ?? null,
        }
    }).sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        return a.month - b.month
    }) ?? []

    // Group advances by location (now using the communes from each advance)
    const locationStats = (advancesWithLocations || []).reduce((acc, advance) => {
        if (advance.locations && advance.locations.length > 0) {
            advance.locations.forEach(loc => {
                const key = loc.communeName
                if (!acc[key]) {
                    acc[key] = {
                        communeName: loc.communeName,
                        communeCode: loc.communeCode,
                        totalAdvances: 0,
                        totalValue: 0,
                        hasCoordinates: !!(loc.latitude && loc.longitude),
                    }
                }
                acc[key].totalAdvances += 1
                acc[key].totalValue += Number(advance.value) || 0
            })
        } else {
            // If advance has no locations, add to "Sin ubicación específica"
            const key = "Sin ubicación específica"
            if (!acc[key]) {
                acc[key] = {
                    communeName: key,
                    communeCode: "N/A",
                    totalAdvances: 0,
                    totalValue: 0,
                    hasCoordinates: false,
                }
            }
            acc[key].totalAdvances += 1
            acc[key].totalValue += Number(advance.value) || 0
        }
        return acc
    }, {} as Record<string, { communeName: string; communeCode: string; totalAdvances: number; totalValue: number; hasCoordinates: boolean }>)

    const locationChartData = Object.values(locationStats).sort((a, b) => b.totalValue - a.totalValue)

    // Chart configs
    const timelineChartConfig: ChartConfig = {
        avance: {
            label: "Avance",
            color: "hsl(var(--chart-1))",
        },
        meta: {
            label: "Meta",
            color: "hsl(var(--chart-2))",
        },
    }

    const locationChartConfig: ChartConfig = {
        totalValue: {
            label: "Valor Total",
            color: "hsl(var(--chart-3))",
        },
    }

    // Count georeferenced variable locations (with lat/lng)
    const geoLocationsCount = variableLocations.filter(l => l.latitude && l.longitude).length

    if (loading) {
        return (
            <Card className="w-full">
                <CardBody className="flex items-center justify-center py-12">
                    <Spinner size="lg" />
                </CardBody>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="w-full">
                <CardBody className="text-center py-8 text-danger">
                    <p>{error}</p>
                </CardBody>
            </Card>
        )
    }

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <Card className="w-full">
                <CardHeader className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold">Análisis de Variable: {variableCode}</h3>
                        <p className="text-sm text-default-500">{variableName}</p>
                    </div>
                    <Button
                        size="sm"
                        variant="flat"
                        color="default"
                        isIconOnly
                        onPress={onClose}
                    >
                        <X size={18} />
                    </Button>
                </CardHeader>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardBody className="flex flex-row items-center gap-3">
                        <div className="bg-primary/10 p-3 rounded-lg">
                            <TrendingUp className="text-primary" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-default-500">Total Avances</p>
                            <p className="text-2xl font-bold">{advancesWithLocations.length}</p>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="flex flex-row items-center gap-3">
                        <div className="bg-secondary/10 p-3 rounded-lg">
                            <MapPin className="text-secondary" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-default-500">Comunas en Avances</p>
                            <p className="text-2xl font-bold">{Object.keys(locationStats).length}</p>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="flex flex-row items-center gap-3">
                        <div className="bg-warning/10 p-3 rounded-lg">
                            <Navigation className="text-warning" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-default-500">Ubicaciones Georreferenciadas</p>
                            <p className="text-2xl font-bold">{geoLocationsCount} / {variableLocations.length}</p>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody className="flex flex-row items-center gap-3">
                        <div className="bg-success/10 p-3 rounded-lg">
                            <Target className="text-success" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-default-500">Metas Definidas</p>
                            <p className="text-2xl font-bold">{dashboardData?.goals.length ?? 0}</p>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Advances Timeline Chart */}
                <Card>
                    <CardHeader>
                        <h4 className="text-lg font-semibold">Avances en el Tiempo</h4>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        {chartData.length > 0 ? (
                            <ChartContainer config={timelineChartConfig} className="h-[300px] w-full">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="period" 
                                        fontSize={12}
                                        angle={-45}
                                        textAnchor="end"
                                        height={80}
                                    />
                                    <YAxis fontSize={12} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="avance" 
                                        stroke="var(--color-avance)" 
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />
                                    {chartData.some(d => d.meta !== null) && (
                                        <Line 
                                            type="monotone" 
                                            dataKey="meta" 
                                            stroke="var(--color-meta)" 
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            dot={{ r: 4 }}
                                        />
                                    )}
                                </LineChart>
                            </ChartContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-default-500">
                                No hay datos de avances disponibles
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Location Distribution Chart */}
                <Card>
                    <CardHeader>
                        <h4 className="text-lg font-semibold">Distribución por Ubicación</h4>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        {locationChartData.length > 0 ? (
                            <ChartContainer config={locationChartConfig} className="h-[300px] w-full">
                                <BarChart data={locationChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis 
                                        dataKey="communeName" 
                                        fontSize={12}
                                        angle={-45}
                                        textAnchor="end"
                                        height={100}
                                    />
                                    <YAxis fontSize={12} />
                                    <ChartTooltip content={<ChartTooltipContent />} />
                                    <Bar 
                                        dataKey="totalValue" 
                                        fill="var(--color-totalValue)" 
                                        radius={[8, 8, 0, 0]}
                                    />
                                </BarChart>
                            </ChartContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-default-500">
                                No hay datos de ubicación disponibles
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Locations Detail */}
            {(advancesWithLocations.length > 0 || variableLocations.length > 0) && (
                <Card>
                    <CardHeader>
                        <h4 className="text-lg font-semibold">Detalle de Ubicaciones</h4>
                    </CardHeader>
                    <Divider />
                    <CardBody className="space-y-6">
                        {/* Variable-level locations (from variable_locations table, with lat/lng) */}
                        {variableLocations.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Navigation size={18} className="text-warning" />
                                    <h5 className="font-semibold text-md">Ubicaciones Georreferenciadas de la Variable</h5>
                                    <Chip size="sm" variant="flat" color="warning">{variableLocations.length}</Chip>
                                </div>
                                <div className="space-y-3">
                                    {variableLocations.map((loc) => (
                                        <div key={`${loc.communeCode}-${loc.communeName}-${loc.address ?? ''}`} className="flex justify-between items-center p-3 bg-warning-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <MapPin size={20} className={loc.latitude && loc.longitude ? "text-success" : "text-default-400"} />
                                                <div>
                                                    <p className="font-semibold">{loc.communeCode} - {loc.communeName}</p>
                                                    {loc.address && (
                                                        <p className="text-xs text-default-500">{loc.address}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {loc.latitude && loc.longitude ? (
                                                    <div>
                                                        <p className="text-xs font-mono text-success">{loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}</p>
                                                        <Chip size="sm" variant="flat" color="success">Georreferenciada</Chip>
                                                    </div>
                                                ) : (
                                                    <Chip size="sm" variant="flat" color="default">Sin coordenadas</Chip>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {variableLocations.length > 0 && Object.keys(locationStats).length > 0 && <Divider />}

                        {/* Advance-level commune distribution */}
                        {Object.keys(locationStats).length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <MapPin size={18} className="text-secondary" />
                                    <h5 className="font-semibold text-md">Distribución de Avances por Comuna</h5>
                                    <Chip size="sm" variant="flat" color="secondary">{Object.keys(locationStats).length}</Chip>
                                </div>
                                <div className="space-y-3">
                                    {Object.values(locationStats).map((loc) => (
                                        <div key={loc.communeCode} className="flex justify-between items-center p-3 bg-default-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <MapPin size={20} className="text-secondary" />
                                                <div>
                                                    <p className="font-semibold">{loc.communeCode === "N/A" ? "" : `${loc.communeCode} - `}{loc.communeName}</p>
                                                    <p className="text-xs text-default-500">{loc.totalAdvances} avance(s) asociado(s)</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold">{Number(loc.totalValue).toFixed(2)}</p>
                                                <p className="text-xs text-default-500">Valor acumulado</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>
            )}
            {/* Quadrenniums */}
            {dashboardData && dashboardData.quadrenniums.length > 0 && (
                <Card>
                    <CardHeader>
                        <h4 className="text-lg font-semibold">Metas por Cuatrienio</h4>
                    </CardHeader>
                    <Divider />
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {dashboardData.quadrenniums.map((quad) => (
                                <div key={quad.id} className="p-4 bg-default-50 rounded-lg">
                                    <p className="text-sm text-default-500">Cuatrienio</p>
                                    <p className="text-lg font-bold">{quad.startYear} - {quad.endYear}</p>
                                    <p className="text-2xl font-bold text-primary mt-2">{quad.value.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    )
}
