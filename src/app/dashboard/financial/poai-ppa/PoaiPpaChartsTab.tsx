"use client"

import {
    Card,
    Select,
    SelectItem,
    Spinner,
    Button,
} from "@heroui/react"
import { useState, useEffect, useCallback } from "react"
import { get } from "@/lib/http"
import { endpoints } from "@/lib/endpoints"
import type {
    ProjectSelectItem,
    PoaiPpaYearsData,
    PoaiPpaSummary,
    PoaiPpaEvolution,
    PoaiPpaTrends,
} from "@/types/financial"
import { BarChart3 } from "lucide-react"

// Chart Components
import { YearsComparisonChart } from "@/components/charts/poai-ppa/YearsComparisonChart"
import { ProjectSummaryKPIs } from "@/components/charts/poai-ppa/ProjectSummaryKPIs"
import { EvolutionChart } from "@/components/charts/poai-ppa/EvolutionChart"
import { TrendsChart } from "@/components/charts/poai-ppa/TrendsChart"
import { DashboardCharts } from "@/components/charts/poai-ppa/DashboardCharts"

export function PoaiPpaChartsTab() {
    const [selectedProjectId, setSelectedProjectId] = useState("")
    const [projects, setProjects] = useState<ProjectSelectItem[]>([])
    const [loadingProjects, setLoadingProjects] = useState(true)

    // Chart data states
    const [yearsData, setYearsData] = useState<PoaiPpaYearsData | null>(null)
    const [summaryData, setSummaryData] = useState<PoaiPpaSummary | null>(null)
    const [evolutionData, setEvolutionData] = useState<PoaiPpaEvolution | null>(null)
    const [trendsData, setTrendsData] = useState<PoaiPpaTrends | null>(null)

    const [loadingYears, setLoadingYears] = useState(false)
    const [loadingSummary, setLoadingSummary] = useState(false)
    const [loadingEvolution, setLoadingEvolution] = useState(false)
    const [loadingTrends, setLoadingTrends] = useState(false)

    // Fetch projects for select
    useEffect(() => {
        get<{ data: ProjectSelectItem[] }>(`${endpoints.financial.projectsSelect}?limit=100`)
            .then((result) => setProjects(result.data))
            .catch((e) => console.error("Error loading projects", e))
            .finally(() => setLoadingProjects(false))
    }, [])

    // Fetch trends on mount
    const fetchTrends = useCallback(async () => {
        setLoadingTrends(true)
        try {
            const result = await get<PoaiPpaTrends>(endpoints.financial.poaiPpaTrends)
            setTrendsData(result)
        } catch (e) {
            console.error("Error loading trends", e)
        } finally {
            setLoadingTrends(false)
        }
    }, [])

    useEffect(() => {
        fetchTrends()
    }, [fetchTrends])

    // Fetch project-specific data when a project is selected
    useEffect(() => {
        if (!selectedProjectId) {
            setYearsData(null)
            setSummaryData(null)
            setEvolutionData(null)
            return
        }

        // Fetch years comparison
        setLoadingYears(true)
        get<PoaiPpaYearsData>(endpoints.financial.poaiPpaProjectYears(selectedProjectId))
            .then((result) => setYearsData(result))
            .catch((e) => console.error("Error loading years data", e))
            .finally(() => setLoadingYears(false))

        // Fetch summary
        setLoadingSummary(true)
        get<PoaiPpaSummary>(endpoints.financial.poaiPpaProjectSummary(selectedProjectId))
            .then((result) => setSummaryData(result))
            .catch((e) => console.error("Error loading summary", e))
            .finally(() => setLoadingSummary(false))

        // Fetch evolution
        setLoadingEvolution(true)
        get<PoaiPpaEvolution>(endpoints.financial.poaiPpaProjectEvolution(selectedProjectId))
            .then((result) => setEvolutionData(result))
            .catch((e) => console.error("Error loading evolution", e))
            .finally(() => setLoadingEvolution(false))
    }, [selectedProjectId])

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Global Dashboard - Always visible if trends data exists */}
            {loadingTrends ? (
                <div className="flex justify-center py-12">
                    <Spinner label="Cargando tablero global..." />
                </div>
            ) : trendsData && trendsData.data.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <DashboardCharts data={trendsData.data} />
                    <TrendsChart data={trendsData.data} />
                </div>
            )}

            {/* Project Selection Section */}
            <div className="bg-default-50 rounded-xl p-6 border border-default-100">
                <div className="flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-default-800">Análisis por Proyecto</h2>
                        <p className="text-default-500">Selecciona un proyecto para ver sus métricas detalladas</p>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <Select
                            label="Proyecto"
                            placeholder="Buscar proyecto..."
                            className="w-full md:w-80"
                            isLoading={loadingProjects}
                            selectedKeys={selectedProjectId ? [selectedProjectId] : []}
                            onSelectionChange={(keys) => {
                                const selected = Array.from(keys)[0]?.toString() || ""
                                setSelectedProjectId(selected)
                            }}
                        >
                            {projects.map((project) => (
                                <SelectItem key={project.id} textValue={`${project.code} - ${project.name}`}>
                                    <div className="flex flex-col">
                                        <span className="text-small font-bold">{project.code}</span>
                                        <span className="text-tiny text-default-500 truncate max-w-[280px]">{project.name}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </Select>
                        {selectedProjectId && (
                            <Button variant="flat" isIconOnly onPress={() => setSelectedProjectId("")} aria-label="Limpiar">
                                <span className="i-lucide-x" />X
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Project Details Content */}
            {selectedProjectId ? (
                <div className="space-y-6">
                    {/* KPIs Row */}
                    {loadingSummary ? (
                        <div className="py-12 flex justify-center">
                            <Spinner label="Cargando resumen..." />
                        </div>
                    ) : summaryData && (
                        <ProjectSummaryKPIs data={summaryData.summary} />
                    )}

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Years Comparison */}
                        {loadingYears ? (
                            <Card className="h-[400px] flex items-center justify-center">
                                <Spinner />
                            </Card>
                        ) : yearsData && yearsData.data.length > 0 && (
                            <YearsComparisonChart data={yearsData.data} />
                        )}

                        {/* Evolution */}
                        {loadingEvolution ? (
                            <Card className="h-[400px] flex items-center justify-center">
                                <Spinner />
                            </Card>
                        ) : evolutionData && evolutionData.evolution.length > 0 && (
                            <EvolutionChart data={evolutionData.evolution} />
                        )}
                    </div>
                </div>
            ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-default-200 rounded-xl bg-default-50/50">
                    <div className="w-16 h-16 rounded-full bg-default-100 flex items-center justify-center mb-4 text-default-400">
                        <BarChart3 size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-default-700">Ningún proyecto seleccionado</h3>
                    <p className="text-default-500 max-w-md mx-auto mt-2">
                        Utiliza el selector de arriba para elegir un proyecto y visualizar su comportamiento presupuestal, KPI's y evolución histórica.
                    </p>
                </div>
            )}
        </div>
    )
}
