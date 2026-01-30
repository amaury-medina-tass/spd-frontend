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
            case 'advance': return `ADVANCE[${s.value.year}${s.value.months ? `:${s.value.months.join(',')}` : ''}]`;
            default: return '';
        }
    }).join('');
}

/**
 * Month names for advance selection
 */
export const MONTHS = [
    { value: 1, label: 'Enero' },
    { value: 2, label: 'Febrero' },
    { value: 3, label: 'Marzo' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Mayo' },
    { value: 6, label: 'Junio' },
    { value: 7, label: 'Julio' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Septiembre' },
    { value: 10, label: 'Octubre' },
    { value: 11, label: 'Noviembre' },
    { value: 12, label: 'Diciembre' },
];

export const ALL_MONTH_ITEMS = [
    { key: 'ALL', label: 'Todo el año', isSpecial: true },
    ...MONTHS.map(m => ({ key: m.value.toString(), label: m.label, isSpecial: false }))
];
