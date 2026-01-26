export interface Variable {
    id: string
    code: string
    name: string
    observations: string | null
    createAt: string
    updateAt: string
}

export interface VariableGoal {
    id: string
    variableId: string
    year: number
    value: string
    createAt: string
    updateAt: string
}

export interface VariableQuadrenniumGoal {
    id: string
    variableId: string
    startYear: number
    endYear: number
    value: string
    createAt: string
    updateAt: string
}
