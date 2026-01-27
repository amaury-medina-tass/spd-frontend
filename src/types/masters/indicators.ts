export type IndicatorDirection = {
    id: number
    name: string
    description: string
}

export type IndicatorUnitMeasure = {
    id: number
    name: string
    description: string
}

export type IndicatorType = {
    id: number
    name: string
    description: string
}

export type IndicatorCatalogs = {
    indicatorTypes: IndicatorType[]
    unitMeasures: IndicatorUnitMeasure[]
    indicatorDirections: IndicatorDirection[]
}

export type Indicator = {
    id: string
    code: string
    name: string
    description: string
    observations: string | null
    advancePercentage: string | number
    baseline: string
    pillarCode: string
    pillarName: string
    componentCode: string
    componentName: string
    programCode: string
    programName: string
    indicatorTypeId: number
    unitMeasureId: number
    directionId: number
    indicatorType?: IndicatorType
    unitMeasure?: IndicatorUnitMeasure
    direction?: IndicatorDirection
}

export type CreateIndicatorDTO = {
    code: string
    name: string
    observations?: string
    advancePercentage: number
    pillarCode: string
    pillarName: string
    componentCode: string
    componentName: string
    programCode: string
    programName: string
    description: string
    baseline: string
    indicatorTypeId: number // ID from catalog
    unitMeasureId: number // ID from catalog
    directionId: number // ID from catalog
}

export type UpdateIndicatorDTO = Partial<CreateIndicatorDTO>

// Action Plan Indicator Types

export type ActionPlanIndicator = {
    id: string
    code: string
    statisticalCode: string
    name: string
    sequenceNumber: number
    description: string
    plannedQuantity: number
    executionCut: string
    compliancePercentage: number
    observations: string | null
    unitMeasureId: number
    unitMeasure?: IndicatorUnitMeasure
}

export type CreateActionPlanIndicatorDTO = {
    code: string
    statisticalCode: string
    name: string
    sequenceNumber: number
    description: string
    plannedQuantity: number
    executionCut: string
    compliancePercentage: number
    observations?: string
    unitMeasureId: number
}

export type UpdateActionPlanIndicatorDTO = Partial<CreateActionPlanIndicatorDTO>

export interface IndicativePlanIndicatorGoal {
    id: string
    indicatorId: string
    year: number
    value: string
    createAt: string
    updateAt: string
}


export interface IndicativePlanIndicatorQuadrenniumGoal {
    id: string
    indicatorId: string
    startYear: number
    endYear: number
    value: string
    createAt: string
    updateAt: string
}


export interface ActionPlanIndicatorGoal {
    id: string
    indicatorId: string
    year: number
    value: string
    createAt: string
    updateAt: string
}

export interface ActionPlanIndicatorQuadrenniumGoal {
    id: string
    indicatorId: string
    startYear: number
    endYear: number
    value: string
    createAt: string
    updateAt: string
}
