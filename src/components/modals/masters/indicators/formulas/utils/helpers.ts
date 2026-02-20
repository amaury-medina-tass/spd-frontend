import { FormulaStep } from "@/utils/formula";

/**
 * Helper function to clean labels that come with ":value" format
 */
export function cleanLabel(label: string | undefined, fallback: string): string {
    if (!label) return fallback;
    // Remove anything after ":" if present
    const colonIndex = label.indexOf(':');
    if (colonIndex !== -1) {
        return label.substring(0, colonIndex).trim();
    }
    return label;
}

/**
 * Serialize formula steps to string expression
 */
export function serializeFormula(steps: FormulaStep[]): string {
    return steps.map(s => {
        switch (s.type) {
            case 'variable': return `VAR[${s.value.id}]`;
            case 'constant': return s.value;
            case 'operator': return s.value.symbol;
            case 'function': return `${s.value.id}(`;
            case 'parenthesis': return s.value;
            case 'separator': return s.value;
            case 'goal_variable': return `GOAL_VAR[${s.value.idMeta}]`;
            case 'goal_indicator': return `GOAL_IND[${s.value.idMeta}]`;
            case 'quadrennium_variable': return `QUAD_VAR[${s.value.id}]`;
            case 'quadrennium_indicator': return `QUAD_IND[${s.value.id}]`;
            case 'advance': {
                const monthsPart = s.value.months ? `:${s.value.months.join(',')}` : '';
                return `ADVANCE[${s.value.year}${monthsPart}]`;
            }
            default: return '';
        }
    }).join('');
}

// Re-export from canonical source to avoid duplication
export { MONTHS, ALL_MONTH_ITEMS } from '../constants/months';
