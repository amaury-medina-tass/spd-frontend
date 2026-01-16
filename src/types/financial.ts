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
