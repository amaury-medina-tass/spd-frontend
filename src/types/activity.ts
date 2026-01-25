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
    activityDate: string
}

export type FullDetailedActivity = Omit<DetailedActivity, 'project'> & {
    project: FullRelatedProject
}

export type RelatedProduct = {
    id: string
    productCode: string
    productName: string
}

export type MGAActivityDetailedActivity = {
    id: string
    detailedActivityId: string
    activityCode: string
    activityName: string
    projectCode: string
    value: number
    balance: number
}

export type MGAActivityDetailedMeta = {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
}

export type MGAActivity = {
    id: string
    code: string
    name: string
    observations: string | null
    activityDate: string
    productId: string
    projectId: string
    createAt: string
    updateAt: string
    project: RelatedProject
    product: RelatedProduct
    detailedActivitiesCount: number
    value: number
    balance: number
    detailedActivities?: {
        data: MGAActivityDetailedActivity[]
        meta: MGAActivityDetailedMeta
    }
}

export type BudgetModification = {
    id: string
    modificationType: "ADDITION" | "REDUCTION" | "TRANSFER"
    legalDocument: string | null
    dateIssue: string
    value: string
    previousBalance: string
    newBalance: string
    description: string
    createdAt: string
    detailedActivity: {
        id: string
        code: string
        name: string
    }
    previousRubric?: {
        id: string
        code: string
        accountName: string
    }
    newRubric?: {
        id: string
        code: string
        accountName: string
    }
}
