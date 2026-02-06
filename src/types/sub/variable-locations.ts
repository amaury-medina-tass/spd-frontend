export interface VariableLocation {
    id: string;
    communeId: string;
    communeCode: string;
    communeName: string;
    address?: string;
    latitude?: number;
    longitude?: number;
}

export interface VariableLocationData {
    variableId: string;
    variableCode: string;
    variableName: string;
    locations: VariableLocation[];
}

export interface VariableAdvanceWithLocation {
    id: string;
    year: number;
    month: number;
    value: number;
    observations?: string;
    createAt: string;
    variable: {
        id: string;
        code: string;
        name: string;
    };
    locations: VariableLocation[];
}

export interface VariableAdvancesWithLocationsResponse {
    advances: VariableAdvanceWithLocation[];
    variableLocations: VariableLocation[];
}
