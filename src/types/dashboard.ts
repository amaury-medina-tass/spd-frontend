// ─── Dashboard Types ──────────────────────────────────────

export type DashboardGlobalData = {
    totalInitialBudget: number
    totalCurrentBudget: number
    totalExecution: number
    totalProjects: number
    totalAdditions: number
    totalReductions: number
    totalTransfers: number
    totalNeeds: number
    totalCdps: number
    totalContracts: number
}

export type DashboardCdp = {
    id: string
    number: string
    totalValue: number
    balance: number
}

export type DashboardActivityBalance = {
    id: string
    code: string
    name: string
    projectCode: string
    cpc: number | null
    budgetCeiling: number
    assignedValue: number
    fundingBalance: number
    percentage: number
}

export type DashboardMasterContract = {
    id: string
    number: string
    object: string
    totalValue: number
    startDate: string
    endDate: string | null
    state: string
    needCode: string | null
}

export type DashboardBudgetRecord = {
    id: string
    number: string
    totalValue: number
    balance: number
    percentage: number
}

export type DashboardProjectBudget = {
    id: string
    code: string
    name: string
    initialBudget: number
    currentBudget: number
    execution: number
    dependencyName: string
    available: number
    executionPercentage: number
}

export type DashboardProjectExecution = {
    id: string
    code: string
    name: string
    initialBudget: number
    currentBudget: number
    execution: number
    dependencyName: string
    executionPercentage: number
    mgaActivitiesCount: number
}

export type DashboardMgaActivity = {
    id: string
    code: string
    name: string
    activityDate: string
    totalValue: number
    totalBalance: number
    executedValue: number
    executionPercentage: number
    detailedActivitiesCount: number
}

export type DashboardDetailedActivity = {
    id: string
    code: string
    name: string
    budgetCeiling: number
    balance: number
    executedValue: number
    executionPercentage: number
    projectCode: string
    cdpCount: number
}

export type DashboardBudgetModificationItem = {
    id: string
    value: number
    dateIssue: string
    legalDocument: string | null
    description: string | null
    previousBalance: number
    newBalance: number
}

export type DashboardBudgetModifications = {
    additions: DashboardBudgetModificationItem[]
    reductions: DashboardBudgetModificationItem[]
    transfers: DashboardBudgetModificationItem[]
    totalAdditions: number
    totalReductions: number
    totalTransfers: number
}
