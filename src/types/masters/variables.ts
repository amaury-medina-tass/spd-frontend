export interface Variable {
    id: string;
    code: string;
    name: string;
    observations?: string;
    createAt: string;
    updateAt: string;
}

export interface VariableGoal {
    id: string;
    year: number;
    value: number;
}

export interface VariableQuadrennium {
    id: string;
    startYear: number;
    endYear: number;
    value: number;
}

export interface VariableAdvance {
    id: string;
    year: number;
    month: number;
    value: number;
    observations?: string;
    createAt: string;
}

export interface VariableDashboardData {
    variable: {
        id: string;
        code: string;
        name: string;
        observations?: string;
    };
    goals: VariableGoal[];
    quadrenniums: VariableQuadrennium[];
    advances: VariableAdvance[];
}
