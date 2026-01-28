import { post } from "@/lib/http";

export interface CreateFormulaDto {
    expression: string;
    ast: any;
    indicativeIndicatorId?: string;
    actionIndicatorId?: string;
}

export const createFormula = async (data: CreateFormulaDto) => {
    return post("/masters/formulas", data);
};
