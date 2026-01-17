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

