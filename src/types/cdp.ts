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

export type CdpPositionDetail = {
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
