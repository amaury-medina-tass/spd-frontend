export interface IndicatorDetailedAccumulatedAdvance {
  id: string;
  year: number;
  month: number;
  value: number;
}

export interface IndicatorDetailedInfo {
  id: string;
  code: string;
  name: string;
  description: string;
  unitMeasure: string;
  accumulatedAdvance?: IndicatorDetailedAccumulatedAdvance;
}

export interface IndicatorDetailedGoal {
  id: string;
  year: number;
  value: number;
}

export interface IndicatorDetailedAdvance {
  id: string;
  year: number;
  month: number;
  value: number;
}

export interface IndicatorVariableInfo {
  id: string;
  name: string;
  description: string;
}

export interface IndicatorVariableAdvance {
  id: string;
  year: number;
  month: number;
  value: number;
  observations?: string;
}

export interface IndicatorVariableGoal {
  id: string;
  year: number;
  value: number;
}

export interface IndicatorDetailedVariable {
  variable: IndicatorVariableInfo;
  goals: IndicatorVariableGoal[];
  advances: IndicatorVariableAdvance[];
  calculatedValue: number | null;
  lastCalculationDate: string | null;
}

export interface IndicatorDetailedData {
  indicator: IndicatorDetailedInfo;
  goals: IndicatorDetailedGoal[];
  advances: IndicatorDetailedAdvance[];
  variables: IndicatorDetailedVariable[];
}
