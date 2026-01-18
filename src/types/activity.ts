export type RelatedProject = {
    id: string
    code: string
    name: string
    financialExecutionPercentage: number
}

export type FullRelatedProject = RelatedProject & {
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
}

export type RelatedRubric = {
    id: string
    code: string
    accountName: string
}

export type Rubric = RelatedRubric & {
    level: number
    type: string
    description: string
}

export type DetailedActivity = {
    id: string
    code: string
    name: string
    observations: string
    budgetCeiling: string
    balance: string
    cpc: string
    projectId: string
    rubricId: string
    createAt: string
    updateAt: string
    project: RelatedProject
    rubric: RelatedRubric
}

export type FullDetailedActivity = Omit<DetailedActivity, 'project'> & {
    project: FullRelatedProject
}

export type MGAActivity = {
    id: string
    code: string
    name: string
    description: string
    budgetCeiling: string
    balance: string
    createAt: string
    updateAt: string
}
