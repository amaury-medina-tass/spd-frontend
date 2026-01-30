import { post, patch, get } from "@/lib/http";
import { FormulaValidationResponse } from "@/utils/formula";

export interface CreateFormulaDto {
    expression: string;
    ast: any;
    indicativeIndicatorId?: string;
    actionIndicatorId?: string;
}

export const createFormula = async (data: CreateFormulaDto) => {
    return post("/masters/formulas", data);
};

export const updateFormula = async (id: string, data: Partial<CreateFormulaDto>) => {
    return patch(`/masters/formulas/${id}`, data);
};

export const getIndicatorFormulaData = async (indicatorId: string, year: string, type: 'action' | 'indicative' = 'action') => {
    return get<FormulaValidationResponse>(`/masters/formulas/indicator-data/${indicatorId}?year=${year}&type=${type}`);
};
