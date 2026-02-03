export type CdpTableRow = {
  id: string
  projectCode: string
  rubricCode: string
  positionNumber: string
  positionValue: number
  needCode: string
  cdpNumber: string
  cdpTotalValue: number
  fundingSourceName: string
  fundingSourceCode: string
  observations: string
}

export type ConsumedActivity = {
  id: string
  detailedActivityId: string
  activityCode: string
  activityName: string
  projectCode: string
  assignedValue: number
  balance: number
}

export type ConsumedActivityMeta = {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export type CdpPositionDetail = {
  id: string
  projectCode: string
  rubricCode: string
  positionNumber: string
  positionValue: number
  needCode: string
  cdpNumber: string
  cdpTotalValue: number
  fundingSourceName: string | null
  fundingSourceCode: string | null
  observations: string
  totalConsumed: number
  masterContract: {
    id: string
    number: string
    object: string
    totalValue: number
  } | null
  associatedRps: Array<{
    id: string
    number: string
    totalValue: number
    balance: number
  }>
  consumedByActivity: {
    data: ConsumedActivity[]
    meta: ConsumedActivityMeta
  }
}

export type CdpDetailedActivity = {
  id: string
  code: string
  name: string
  observations: string | null
  budgetCeiling: string
  balance: string
  cpc: string | null
  projectId: string
  rubricId: string
  rubric: {
    id: string
    code: string
    accountName: string
  }
  project: {
    id: string
    code: string
    name: string
    financialExecutionPercentage: number
  }
}
