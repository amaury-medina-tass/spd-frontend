import { X } from "lucide-react";
import { FormulaStep } from "@/utils/formula";
import { cleanLabel } from "../utils/helpers";

interface StepChipProps {
    step: FormulaStep;
    onDelete?: () => void;
}

export const StepChip = ({ step, onDelete }: StepChipProps) => {
    const getStepStyle = () => {
        switch (step.type) {
            case 'variable':
                return {
                    bg: 'bg-white dark:bg-default-50',
                    border: 'border-default-300 dark:border-default-700',
                    text: 'text-default-900 dark:text-default-100',
                    icon: null
                };
            case 'function':
                return {
                    bg: 'bg-white dark:bg-default-50',
                    border: 'border-default-300 dark:border-default-700',
                    text: 'text-default-900 dark:text-default-100 font-bold',
                    icon: null
                };
            case 'operator':
                return {
                    bg: 'bg-transparent',
                    border: 'border-transparent',
                    text: 'text-default-900 dark:text-default-100',
                    icon: null
                };
            case 'comparison':
                return {
                    bg: 'bg-transparent',
                    border: 'border-transparent',
                    text: 'text-default-900 dark:text-default-100',
                    icon: null
                };
            case 'constant':
                return {
                    bg: 'bg-white dark:bg-default-50',
                    border: 'border-default-300 dark:border-default-700',
                    text: 'text-default-900 dark:text-default-100',
                    icon: null
                };
            case 'goal_variable':
            case 'goal_indicator':
            case 'quadrennium_variable':
            case 'quadrennium_indicator':
            case 'advance':
            case 'baseline':
                return {
                    bg: 'bg-white dark:bg-default-50',
                    border: 'border-default-300 dark:border-default-700',
                    text: 'text-default-900 dark:text-default-100',
                    icon: null
                };
            case 'parenthesis':
            case 'separator':
                return {
                    bg: 'bg-transparent',
                    border: 'border-transparent',
                    text: 'text-default-900 dark:text-default-100',
                    icon: null
                };
            default:
                return {
                    bg: 'bg-white dark:bg-default-50',
                    border: 'border-default-300',
                    text: 'text-default-900',
                    icon: null
                };
        }
    };

    const style = getStepStyle();

    const getDisplayValue = () => {
        switch (step.type) {
            case 'variable': return step.value.code || step.value.name;
            case 'function': return step.value.name + '(';
            case 'operator': return step.value.symbol;
            case 'comparison': return step.value.symbol;
            case 'constant': return step.value;
            case 'goal_variable':
                return `Meta Var [${step.value.year || 'N/A'}]`;
            case 'goal_indicator':
                return `Meta Ind [${step.value.year || 'N/A'}]`;
            case 'quadrennium_variable':
            case 'quadrennium_indicator':
                return cleanLabel(step.value.label, `${step.value.startYear}-${step.value.endYear}`);
            case 'advance':
                return step.value.label || `Avance ${step.value.year}`;
            case 'baseline': return step.value.label;
            case 'parenthesis': return step.value;
            case 'separator': return step.value;
            default: return step.value;
        }
    };

    const isSymbol = step.type === 'parenthesis' || step.type === 'separator';
    const isOperator = step.type === 'operator' || step.type === 'comparison';

    // For parenthesis and separator, render using plain text for better alignment
    if (isSymbol) {
        return (
            <div className="flex items-center px-0.5">
                <span className="font-mono text-base text-default-600 dark:text-default-400">
                    {getDisplayValue()}
                </span>
            </div>
        );
    }

    // For operators, render as simple text
    if (isOperator) {
        return (
            <span className="font-mono text-base font-medium text-default-900 dark:text-default-100 px-1.5 py-0.5">
                {getDisplayValue()}
            </span>
        );
    }

    return (
        <div
            className={`
                group inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-xs border
                ${style.bg} ${style.border} ${style.text}
                transition-all duration-150
            `}
        >
            <span className="font-medium font-mono">{getDisplayValue()}</span>
            {onDelete && (
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="ml-0.5 opacity-0 group-hover:opacity-70 hover:opacity-100 transition-opacity focus:outline-none rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5"
                >
                    <X size={10} strokeWidth={2.5} />
                </button>
            )}
        </div>
    );
};
