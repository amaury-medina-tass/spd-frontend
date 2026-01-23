import { PaginationMeta } from "@/lib/http"

export type PreviousStudy = {
    id: string
    code: string
    status: string
    createAt: string
    updateAt: string
}

export type FinancialNeed = {
    id: string
    code: number
    amount: string
    description: string
    createAt: string
    updateAt: string
    previousStudy: PreviousStudy
}

export type Contractor = {
    id: string
    nit: string
    name: string
}

export type ContractNeed = {
    id: string
    code: number
}

export type MasterContract = {
    id: string
    number: string
    object: string
    totalValue: string
    startDate: string
    endDate: string | null
    state: string
    createAt: string
    updateAt: string
    need: ContractNeed
    contractor: Contractor
}

export type ProjectDependency = {
    id: string
    code: string
    name: string
}

export type Project = {
    id: string
    code: string
    name: string
    initialBudget: string
    currentBudget: string
    execution: string
    commitment: string
    payments: string
    invoiced: string
    origin: string
    state: boolean
    createAt: string
    updateAt: string
    dependency: ProjectDependency
    financialExecutionPercentage: number
}

// POAI PPA Types
export type ProjectBasic = {
    id: string
    code: string
    name: string
    financialExecutionPercentage: number
}

export type PoaiPpa = {
    id: string
    projectCode: string
    year: number
    projectedPoai: string
    assignedPoai: string
    createAt: string
    updateAt: string
    project: ProjectBasic
}

export type PoaiPpaYearsData = {
    data: PoaiPpa[]
    summary: {
        totalYears: number
        years: number[]
        totalProjected: number
        totalAssigned: number
    }
}

export type PoaiPpaSummary = {
    project: {
        id: string
        code: string
        name: string
    }
    summary: {
        yearCount: number
        totalProjected: number
        totalAssigned: number
        avgProjected: number
        avgAssigned: number
        minYear: number
        maxYear: number
        executionRate: number
    }
}

export type PoaiPpaEvolutionItem = {
    year: number
    projectedPoai: number
    assignedPoai: number
    variance: number
    variancePercentage: number
    yoyProjectedChange: number | null
    yoyAssignedChange: number | null
}

export type PoaiPpaEvolution = {
    project: {
        id: string
        code: string
        name: string
    }
    evolution: PoaiPpaEvolutionItem[]
}

export type PoaiPpaTrendItem = {
    year: number
    projectCount: number
    totalProjected: number
    totalAssigned: number
    avgProjected: number
    avgAssigned: number
    executionRate: number
}

export type PoaiPpaTrends = {
    data: PoaiPpaTrendItem[]
    meta: {
        totalYears: number
        yearRange: {
            start: number
            end: number
        }
    }
}

export type ProjectSelectItem = {
    id: string
    code: string
    name: string
    financialExecutionPercentage: number
}


export type NeedCdpPosition = {
    projectCode: string
    cdpNumber: string
    fundingSourceCode: string
    fundingSourceName: string
    cdpTotalValue: number
    positionNumber: string
    positionValue: number
    observations: string
}

export type NeedCdpPositionsResponse = {
    totalValue: number
    data: NeedCdpPosition[]
    meta: PaginationMeta
}
