export interface VariableAdvance {
    id: string
    variableId: string
    year: number
    month: number
    value: string
    observations: string
    createAt: string
    updateAt: string
}

export interface VariableWithAdvances {
    id: string
    variableId: string
    variableName: string
    variableCode: string
    calculatedValue: number
    lastCalculationDate: string
    actionRelationId?: string
    indicativeRelationId?: string
    advances: VariableAdvance[]
}
export interface CreateVariableAdvanceDto {
    variableId: string
    year: number
    month: number
    value: number
    observations: string
    communeIds?: string[]
}
