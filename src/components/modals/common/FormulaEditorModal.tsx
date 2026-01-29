import React, { useState, useEffect, useCallback } from "react";
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Select,
    SelectItem,
    Divider,
    Tabs,
    Tab,
    Spinner,
    Tooltip,
    Input
} from "@heroui/react";
import {
    Variable as VariableIcon,
    Calculator,
    Save,
    HelpCircle,
    FunctionSquare,
    Type,
    AlertCircle,
    CheckCircle2,
    X,
    Target,
    Calendar,
    Sparkles,
    Hash,
    Equal,
    Trash2,
    Undo2,
    TrendingUp,
    Copy
} from "lucide-react";
import { ReplicateFormulaModal } from "./ReplicateFormulaModal";
import { FormulaGuideModal } from "./FormulaGuideModal";

import {
    Variable,
    GoalVariable,
    GoalIndicator,
    VariableQuadrenium,
    IndicatorQuadrennium,
    VariableAdvance,
    FormulaStep,
    ValidationResult,
    parseFormulaString,
    validateFormula,
    buildAST,
    getFormulaStatusMessage,
    FORMULA_FUNCTIONS,
    FORMULA_OPERATORS,
    COMPARISON_OPERATORS,
    convertAstToSteps
} from "@/utils/formula";

// Helper function to clean labels that come with ":value" format
const cleanLabel = (label: string | undefined, fallback: string): string => {
    if (!label) return fallback;
    // Remove pattern like "Cuatrenio [X-Y]: value" -> "Cuatrenio [X-Y]" or just return clean label
    const colonIndex = label.lastIndexOf(':');
    if (colonIndex > 0) {
        return label.substring(0, colonIndex).trim();
    }
    return label;
};

// Month names for advance selection
const MONTHS = [
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

const ALL_MONTH_ITEMS = [
    { key: 'ALL', label: 'Todo el año', isSpecial: true },
    ...MONTHS.map(m => ({ key: m.value.toString(), label: m.label, isSpecial: false }))
];

interface FormulaEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (payload: any, unused?: any) => Promise<void>;
    title?: string;
    indicatorId: string;
}

// --- Refined StepChip Component ---
const StepChip = ({ step, onDelete }: { step: FormulaStep; onDelete?: () => void }) => {
    const getStepStyle = () => {
        switch (step.type) {
            case 'variable':
                return {
                    bg: 'bg-white dark:bg-default-50',
                    border: 'border-default-300 dark:border-default-700',
                    text: 'text-default-900 dark:text-default-100',
                    icon: null // Remove icons for cleaner look
                };
            case 'function':
                return {
                    bg: 'bg-white dark:bg-default-50',
                    border: 'border-default-300 dark:border-default-700',
                    text: 'text-default-900 dark:text-default-100 font-bold', // Bold for functions
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
            case 'variable': return step.value.name;
            case 'function': return step.value.name + '(';
            case 'operator': return step.value.symbol;
            case 'comparison': return step.value.symbol;
            case 'constant': return step.value;
            case 'goal_variable':
            case 'goal_indicator':
                return cleanLabel(step.value.label, step.value.valorMeta);
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

export function FormulaEditorModal({
    isOpen,
    onClose,
    onSave,
    title = "Editor de Fórmulas",
    indicatorId
}: FormulaEditorModalProps) {
    const currentYear = new Date().getFullYear().toString();
    const [selectedYear, setSelectedYear] = useState<string>(currentYear);
    const [isLoading, setIsLoading] = useState(false);

    // Data State
    const [variables, setVariables] = useState<Variable[]>([]);
    const [goalVariables, setGoalVariables] = useState<GoalVariable[]>([]);
    const [goalIndicators, setGoalIndicators] = useState<GoalIndicator[]>([]);
    const [indicatorQuadrenniums, setIndicatorQuadrenniums] = useState<IndicatorQuadrennium[]>([]);
    const [existingFormulaId, setExistingFormulaId] = useState<string | null>(null);

    // Editor State
    const [activeTab, setActiveTab] = useState<string>("variables");
    const [selectedVariableId, setSelectedVariableId] = useState<string | null>(null);

    // Formula States
    const [variableFormulas, setVariableFormulas] = useState<Record<string, FormulaStep[]>>({});
    const [mainFormulaSteps, setMainFormulaSteps] = useState<FormulaStep[]>([]);
    const [isReplicateModalOpen, setIsReplicateModalOpen] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);

    // Derived State for Validation Logic
    const currentSteps = activeTab === "variables"
        ? (selectedVariableId ? (variableFormulas[selectedVariableId] || []) : [])
        : mainFormulaSteps;

    const validationState = React.useMemo(() => {
        const steps = currentSteps;
        const lastStep = steps[steps.length - 1];

        // Analyze Context (Function, Argument Index)
        let contextStack: { type: 'function' | 'paren', name?: string, argIndex: number }[] = [];

        for (const s of steps) {
            if (s.type === 'function') {
                contextStack.push({ type: 'function', name: s.value.id, argIndex: 0 });
            } else if (s.type === 'parenthesis' && s.value === '(') {
                contextStack.push({ type: 'paren', argIndex: 0 });
            } else if (s.type === 'parenthesis' && s.value === ')') {
                if (contextStack.length > 0) contextStack.pop();
            } else if (s.type === 'separator') {
                if (contextStack.length > 0) {
                    contextStack[contextStack.length - 1].argIndex++;
                }
            }
        }

        const currentContext = contextStack.length > 0 ? contextStack[contextStack.length - 1] : null;
        const isInsideFunction = contextStack.some(c => c.type === 'function');
        const openParens = steps.filter(s => (s.type === 'parenthesis' && s.value === '(') || s.type === 'function').length;
        const closeParens = steps.filter(s => s.type === 'parenthesis' && s.value === ')').length;

        let canAddEntity = false; // Variable, Advance, Constant, Function, (
        let canAddOperator = false; // Operator, )

        if (!lastStep) {
            canAddEntity = true;
        } else {
            const type = lastStep.type;
            if (type === 'operator' || type === 'comparison' || type === 'separator' || (type === 'parenthesis' && lastStep.value === '(') || type === 'function') {
                canAddEntity = true;
            } else {
                canAddOperator = true;
            }
        }

        // Calculate separator eligibility BEFORE restricting binary operators
        let canAddSeparator = canAddOperator && isInsideFunction;
        // Calculate close paren eligibility BEFORE restricting binary operators (fixes bug in SUM/AVG)
        const canAddCloseParen = canAddOperator && openParens > closeParens;

        // Restrict binary operators in specific functions (AVG, MAX, MIN, SUM) unless in parentheses
        const RESTRICTED_OPERATOR_FUNCTIONS = ['AVG', 'MAX', 'MIN', 'SUM'];
        if (currentContext && currentContext.type === 'function' && RESTRICTED_OPERATOR_FUNCTIONS.includes(currentContext.name || '')) {
            canAddOperator = false; // Disable binary operators at top level of these functions
            // But we might want to allow them if canAddUnaryOperator is true (handled in Button isDisabled)
            // Actually, canAddOperator controls binary ops. Unary ops are separate check in Button.
        }

        // Check if we are in the condition part (first argument) of an IF function
        const isInIfCondition = currentContext && currentContext.type === 'function' && currentContext.name === 'IF' && currentContext.argIndex === 0;

        let canAddComparisonOperator = false;
        if (isInIfCondition) {
            // Count existing comparison operators in the current argument scope
            let comparisonCount = 0;
            let bracketDepth = 0;

            // Iterate backwards to find the start of the current argument
            for (let i = steps.length - 1; i >= 0; i--) {
                const s = steps[i];
                if (s.type === 'parenthesis' && s.value === ')') bracketDepth++;
                if (s.type === 'parenthesis' && s.value === '(') {
                    if (bracketDepth === 0) break; // Reached start of function or paren group
                    bracketDepth--;
                }
                if (s.type === 'function') {
                    if (bracketDepth === 0) break; // Start of function
                }
                if (s.type === 'separator' && bracketDepth === 0) break; // Start of argument

                if (bracketDepth === 0 && s.type === 'comparison') {
                    comparisonCount++;
                }
            }
            canAddComparisonOperator = comparisonCount === 0;
        }

        // let canAddSeparator = canAddOperator && isInsideFunction; // Moved up

        if (currentContext && currentContext.type === 'function' && currentContext.name === 'IF') {
            if (currentContext.argIndex >= 2) { // 0, 1, 2 (3 arguments)
                canAddSeparator = false;
            }
        }

        let canAddUnaryOperator = false;
        if (!lastStep) {
            canAddUnaryOperator = true;
        } else {
            const type = lastStep.type;
            if (type === 'function' || (type === 'parenthesis' && lastStep.value === '(') || type === 'separator') {
                canAddUnaryOperator = true;
            }
        }

        return {
            canAddEntity,
            canAddOperator,
            canAddMathOperator: canAddOperator && !isInsideFunction,
            canAddOpenParen: canAddEntity,
            canAddCloseParen,
            canAddSeparator: canAddSeparator,
            isInsideFunction,
            currentContext,
            canAddUnaryOperator,
            isInIfCondition,
            canAddComparisonOperator
        };
    }, [currentSteps]);

    const [cursorIndex, setCursorIndex] = useState<number | null>(null);

    // Constant input state
    const [constantValue, setConstantValue] = useState<string>('');

    // Advance selection state
    const [advanceYear, setAdvanceYear] = useState<string>(currentYear);
    const [advanceMonths, setAdvanceMonths] = useState<Set<string>>(new Set());

    const years = [2024, 2025, 2026, 2027, 2028].map(y => y.toString());

    // Fetch Data
    const fetchData = useCallback(async (year: string) => {
        if (!indicatorId) return;
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:8080/masters/formulas/indicator-data/${indicatorId}?type=action&year=${year}`);
            if (!response.ok) throw new Error("Failed to fetch data");

            const result = await response.json();
            if (result.success && result.data) {
                const fetchedVariables = result.data.variables || [];
                const mappedVariables: Variable[] = fetchedVariables.map((v: any) => ({
                    id: v.id,
                    code: v.code,
                    name: v.name,
                    description: v.description,
                    formula: [], // Will be populated in second pass
                    goals: v.goals?.map((g: any) => ({
                        idMeta: g.id,
                        valorMeta: g.value,
                        label: `Meta [${g.year}]`
                    })) || [],
                    quadrenniums: v.quadrenniums?.map((q: any) => ({
                        id: q.id,
                        startYear: q.startYear,
                        endYear: q.endYear,
                        value: q.value,
                        label: `Cuatrenio [${q.startYear}-${q.endYear}]`
                    })) || []
                }));

                const indGoals = result.data.indicator?.goals?.map((g: any) => ({
                    idMeta: g.id,
                    valorMeta: g.value,
                    label: `Meta Ind [${g.year}]`
                })) || [];
                setGoalIndicators(indGoals);

                const indQuads = result.data.indicator?.quadrenniums?.map((q: any) => ({
                    id: q.id,
                    startYear: q.startYear,
                    endYear: q.endYear,
                    value: q.value,
                    label: `Cuatrenio Ind [${q.startYear}-${q.endYear}]`
                })) || [];
                setIndicatorQuadrenniums(indQuads);

                setVariables(mappedVariables);

                const formulas = result.data.indicator?.formulas;
                if (formulas && Array.isArray(formulas) && formulas.length > 0) {
                    setExistingFormulaId(formulas[0].id);
                    if (formulas[0].expression) {
                        const parsed = parseFormulaString(
                            formulas[0].expression,
                            mappedVariables,
                            [],
                            indGoals,
                            new Map(),
                            indQuads
                        );
                        setMainFormulaSteps(parsed);
                    }

                    // Extract variable formulas from AST
                    const extractedFormulas: Record<string, FormulaStep[]> = {};
                    console.log("[DEBUG] Starting AST traversal", formulas[0].ast);

                    const traverseAndExtract = (node: any) => {
                        if (!node) return;
                        if (node.kind === 'ref') console.log("[DEBUG] Ref:", node.value, !!node.subFormula);

                        // Check for variable ref with subFormula
                        if (node.kind === 'ref' && node.value && node.subFormula) {
                            const steps = convertAstToSteps(
                                node.subFormula,
                                mappedVariables,
                                [], // goalsVariables implied
                                indGoals,
                                [], // quad vars implied
                                indQuads
                            );
                            extractedFormulas[node.value] = steps;

                            // Update variable reference in the list
                            const v = mappedVariables.find(x => x.id === node.value);
                            if (v) v.formula = steps;

                            // Recurse into subFormula to find nested dependencies
                            traverseAndExtract(node.subFormula);
                        }

                        // Standard traversal
                        if (node.left) traverseAndExtract(node.left);
                        if (node.right) traverseAndExtract(node.right);
                        if (node.args && Array.isArray(node.args)) {
                            node.args.forEach((arg: any) => traverseAndExtract(arg));
                        }
                    };

                    if (formulas[0].ast) {
                        traverseAndExtract(formulas[0].ast);
                        setVariableFormulas(extractedFormulas);
                        // Force update variables to reflect formula changes
                        setVariables([...mappedVariables]);
                    }
                } else {
                    setExistingFormulaId(null);
                    setMainFormulaSteps([]);
                }
            }
        } catch (error) {
            console.error("Error fetching indicator data:", error);
            setVariables([]);
        } finally {
            setIsLoading(false);
        }
    }, [indicatorId]);

    useEffect(() => {
        if (isOpen) {
            fetchData(selectedYear);
        }
    }, [isOpen, selectedYear, fetchData]);

    // Helpers for Formula Editing
    const getCurrentSteps = () => {
        if (activeTab === "variables" && selectedVariableId) {
            return variableFormulas[selectedVariableId] || [];
        }
        if (activeTab === "main") {
            return mainFormulaSteps;
        }
        return [];
    };

    const updateCurrentSteps = (newSteps: FormulaStep[]) => {
        if (activeTab === "variables" && selectedVariableId) {
            setVariableFormulas(prev => ({
                ...prev,
                [selectedVariableId]: newSteps
            }));
        } else if (activeTab === "main") {
            setMainFormulaSteps(newSteps);
        }
    };

    const insertStep = (step: FormulaStep) => {
        const current = getCurrentSteps();
        const newSteps = [...current];
        const insertPos = cursorIndex !== null ? cursorIndex : newSteps.length;
        newSteps.splice(insertPos, 0, step);
        updateCurrentSteps(newSteps);
        setCursorIndex(insertPos + 1);
    };

    const removeStep = (index: number) => {
        const current = getCurrentSteps();
        const newSteps = [...current];
        newSteps.splice(index, 1);
        updateCurrentSteps(newSteps);
        if (cursorIndex !== null && cursorIndex > index) {
            setCursorIndex(cursorIndex - 1);
        }
    };

    const undoLastStep = () => {
        const current = getCurrentSteps();
        if (current.length > 0) {
            updateCurrentSteps(current.slice(0, -1));
        }
    };

    const clearAllSteps = () => {
        updateCurrentSteps([]);
        setCursorIndex(null);
    };

    const validateCurrent = (): ValidationResult => {
        return validateFormula(getCurrentSteps());
    };

    const addConstant = () => {
        if (!constantValue) return;
        insertStep({ type: 'constant', value: constantValue });
        setConstantValue('');
    };

    // --- Replication Handler ---
    const handleReplicate = (targetIds: string[], mappedFormulas: Record<string, FormulaStep[]>) => {
        setVariableFormulas(prev => {
            const next = { ...prev };
            targetIds.forEach(id => {
                if (mappedFormulas[id]) {
                    next[id] = mappedFormulas[id];
                }
            });
            return next;
        });
    };

    // --- Helper: Serialize Formula ---
    const serializeFormula = (steps: FormulaStep[]) => {
        return steps.map(s => {
            if (s.type === 'variable') return `[${s.value.id}]`;
            if (s.type === 'goal_variable') return `[MV:${s.value.idMeta}]`;
            if (s.type === 'goal_indicator') return `[MI:${s.value.idMeta}]`;
            if (s.type === 'quadrennium_variable') return `[QV:${s.value.id}]`;
            if (s.type === 'quadrennium_indicator') return `[QI:${s.value.id}]`;
            if (s.type === 'baseline') return `[LINEA_BASE]`;
            // Fallback for advance to a hypothetical format or simple label as user hasn't specified
            if (s.type === 'advance') return `[AV:${s.value.year}:${s.value.months.join('-')}]`;
            if (s.type === 'function') return `${s.value.id}(`;
            if (s.type === 'operator') return s.value.symbol;
            if (s.type === 'comparison') return s.value.symbol;
            if (s.type === 'constant') return s.value;
            if (s.type === 'parenthesis') return s.value;
            if (s.type === 'separator') return ',';
            return '';
        }).join('');
    };

    // --- Helper: Hydrate Steps (Inject latest Variable Formulas) ---
    const getHydratedSteps = (steps: FormulaStep[], visitedIds = new Set<string>()): FormulaStep[] => {
        return steps.map(step => {
            if (step.type === 'variable') {
                const varId = step.value.id;

                // Prevent infinite recursion (circular ref)
                if (visitedIds.has(varId)) {
                    return step;
                }

                // Get latest formula from state, fallback to existing
                const currentFormula = variableFormulas[varId] || step.value.formula || [];

                // Create a new set for the next level to allow A->B->C, but prevent A->B->A
                const nextVisited = new Set(visitedIds);
                nextVisited.add(varId);

                return {
                    ...step,
                    value: {
                        ...step.value,
                        formula: getHydratedSteps(currentFormula, nextVisited)
                    }
                };
            }
            return step;
        });
    };

    const handleSave = () => {
        if (mainFormulaSteps.length === 0) {
            return;
        }

        // Hydrate main formula steps with latest variable formulas for Unified AST
        const hydratedMainSteps = getHydratedSteps(mainFormulaSteps);
        const unifiedAST = buildAST(hydratedMainSteps, true); // true = expandVariables

        const payload = {
            id: existingFormulaId,
            indicatorId,
            expression: serializeFormula(mainFormulaSteps),
            ast: unifiedAST,
            variables: Object.entries(variableFormulas).map(([varId, steps]) => ({
                variableId: varId,
                formula: serializeFormula(steps),
                ast: buildAST(getHydratedSteps(steps), true) // Also hydrate variable ASTs if needed
            }))
        };

        // Pass payload to parent
        onSave(payload, null);
    };

    // --- Render: Editor Toolbar ---
    const renderEditorToolbar = () => {
        const selectedVariable = selectedVariableId ? variables.find(v => v.id === selectedVariableId) : null;
        const currentVariableGoals = selectedVariable?.goals || [];
        const currentVariableQuadrenniums = selectedVariable?.quadrenniums || [];

        return (
            <div className="p-3 bg-gradient-to-r from-default-50 to-default-100/50 dark:from-default-100/10 dark:to-default-50/5 border-b border-default-200 dark:border-default-800">
                <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
                    {/* Data Insertion Section */}
                    <div className="flex gap-2 items-center flex-wrap w-full sm:w-auto">
                        {activeTab === "main" && (
                            <>
                                <Select
                                    placeholder="Variables"
                                    size="sm"
                                    className="w-full sm:w-48 md:w-52"
                                    aria-label="Insertar Variable"
                                    variant="bordered"
                                    selectedKeys={[]}
                                    isDisabled={!validationState.canAddEntity}
                                    classNames={{
                                        trigger: "bg-white dark:bg-default-100/20 h-9 min-h-9",
                                        value: "text-xs",
                                        listboxWrapper: "max-h-72"
                                    }}
                                    startContent={<VariableIcon size={14} className="text-primary shrink-0" />}
                                    onChange={(e) => {
                                        const v = variables.find(x => x.id === e.target.value);
                                        if (v) insertStep({ type: 'variable', value: v });
                                    }}
                                >
                                    {variables.map(v => (
                                        <SelectItem
                                            key={v.id}
                                            textValue={v.name}
                                            classNames={{ title: "text-xs", description: "text-[10px]" }}
                                            description={v.code || "Sin código"}
                                        >
                                            {v.name}
                                        </SelectItem>
                                    ))}
                                </Select>

                                {goalIndicators.length > 0 && (
                                    <Select
                                        placeholder="Metas Indicador"
                                        size="sm"
                                        className="w-full sm:w-44 md:w-48"
                                        aria-label="Insertar Meta Indicador"
                                        variant="bordered"
                                        selectedKeys={[]}
                                        isDisabled={!validationState.canAddEntity}
                                        classNames={{
                                            trigger: "bg-white dark:bg-default-100/20 h-9 min-h-9",
                                            value: "text-xs",
                                            listboxWrapper: "max-h-72"
                                        }}
                                        startContent={<Target size={14} className="text-emerald-500 shrink-0" />}
                                        onChange={(e) => {
                                            const g = goalIndicators.find(x => x.idMeta === e.target.value);
                                            if (g) insertStep({ type: 'goal_indicator', value: g });
                                        }}
                                    >
                                        {goalIndicators.map(g => (
                                            <SelectItem
                                                key={g.idMeta}
                                                textValue={cleanLabel(g.label, g.valorMeta)}
                                                classNames={{ title: "text-xs", description: "text-[10px]" }}
                                                description={g.valorMeta}
                                            >
                                                {cleanLabel(g.label, g.valorMeta)}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                )}

                                {indicatorQuadrenniums.length > 0 && (
                                    <Select
                                        placeholder="Cuatrenios Indicador"
                                        size="sm"
                                        className="w-full sm:w-48 md:w-52"
                                        aria-label="Insertar Cuatrenio Indicador"
                                        variant="bordered"
                                        selectedKeys={[]}
                                        isDisabled={!validationState.canAddEntity}
                                        classNames={{
                                            trigger: "bg-white dark:bg-default-100/20 h-9 min-h-9",
                                            value: "text-xs",
                                            listboxWrapper: "max-h-72"
                                        }}
                                        startContent={<Calendar size={14} className="text-cyan-500 shrink-0" />}
                                        onChange={(e) => {
                                            const q = indicatorQuadrenniums.find(x => x.id === e.target.value);
                                            if (q) insertStep({ type: 'quadrennium_indicator', value: q });
                                        }}
                                    >
                                        {indicatorQuadrenniums.map(q => (
                                            <SelectItem
                                                key={q.id}
                                                textValue={cleanLabel(q.label, `${q.startYear}-${q.endYear}`)}
                                                classNames={{ title: "text-xs", description: "text-[10px]" }}
                                                description={q.value}
                                            >
                                                {cleanLabel(q.label, `${q.startYear}-${q.endYear}`)}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                )}
                            </>
                        )}

                        {activeTab === "variables" && (
                            <>
                                {currentVariableGoals.length > 0 && (
                                    <Select
                                        placeholder="Metas Variable"
                                        size="sm"
                                        className="w-full sm:w-44 md:w-48"
                                        aria-label="Insertar Meta"
                                        variant="bordered"
                                        selectedKeys={[]}
                                        isDisabled={!validationState.canAddEntity}
                                        classNames={{
                                            trigger: "bg-white dark:bg-default-100/20 h-9 min-h-9",
                                            value: "text-xs",
                                            listboxWrapper: "max-h-72"
                                        }}
                                        startContent={<Target size={14} className="text-emerald-500 shrink-0" />}
                                        onChange={(e) => {
                                            const g = currentVariableGoals.find(x => x.idMeta === e.target.value);
                                            if (g) insertStep({ type: 'goal_variable', value: g });
                                        }}
                                    >
                                        {currentVariableGoals.map(g => (
                                            <SelectItem
                                                key={g.idMeta}
                                                textValue={cleanLabel(g.label, g.valorMeta)}
                                                classNames={{ title: "text-xs", description: "text-[10px]" }}
                                                description={g.valorMeta}
                                            >
                                                {cleanLabel(g.label, g.valorMeta)}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                )}

                                {currentVariableQuadrenniums.length > 0 && (
                                    <Select
                                        placeholder="Cuatrenios Variable"
                                        size="sm"
                                        className="w-full sm:w-48 md:w-52"
                                        aria-label="Insertar Cuatrenio"
                                        variant="bordered"
                                        selectedKeys={[]}
                                        isDisabled={!validationState.canAddEntity}
                                        classNames={{
                                            trigger: "bg-white dark:bg-default-100/20 h-9 min-h-9",
                                            value: "text-xs",
                                            listboxWrapper: "max-h-72"
                                        }}
                                        startContent={<Calendar size={14} className="text-cyan-500 shrink-0" />}
                                        onChange={(e) => {
                                            const q = currentVariableQuadrenniums.find(x => x.id === e.target.value);
                                            if (q) insertStep({ type: 'quadrennium_variable', value: q });
                                        }}
                                    >
                                        {currentVariableQuadrenniums.map(q => (
                                            <SelectItem
                                                key={q.id}
                                                textValue={cleanLabel(q.label, `${q.startYear}-${q.endYear}`)}
                                                classNames={{ title: "text-xs", description: "text-[10px]" }}
                                                description={q.value}
                                            >
                                                {cleanLabel(q.label, `${q.startYear}-${q.endYear}`)}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                )}

                            </>
                        )}
                    </div>

                    <Divider orientation="vertical" className="h-6 mx-1 hidden sm:block" />

                    {/* Operators Group */}
                    <div className="flex items-center gap-0.5 bg-white dark:bg-default-100/20 rounded-lg p-0.5 border border-default-200 dark:border-default-700">
                        {FORMULA_OPERATORS.map(op => (
                            <Tooltip key={op.id} content={op.name || op.symbol} delay={300}>
                                <Button
                                    size="sm"
                                    isIconOnly
                                    variant="light"
                                    isDisabled={
                                        (!validationState.canAddOperator && !(
                                            (op.symbol === '+' || op.symbol === '-') && validationState.canAddUnaryOperator
                                        )) &&
                                        !(op.symbol === '(' && validationState.canAddEntity) &&
                                        !(op.symbol === ')' && validationState.canAddCloseParen)
                                    }
                                    className="w-8 h-7 min-w-8 font-mono text-base font-semibold"
                                    onPress={() => insertStep({ type: 'operator', value: op })}
                                >
                                    {op.symbol}
                                </Button>
                            </Tooltip>
                        ))}
                    </div>

                    {/* Comparison Operators */}
                    <div className="flex items-center gap-0.5 bg-white dark:bg-default-100/20 rounded-lg p-0.5 border border-purple-200 dark:border-purple-700">
                        {COMPARISON_OPERATORS.map(op => (
                            <Tooltip key={op.id} content={op.name || op.symbol} delay={300}>
                                <Button
                                    size="sm"
                                    isIconOnly
                                    variant="light"
                                    isDisabled={!validationState.canAddOperator || !validationState.isInIfCondition || !validationState.canAddComparisonOperator}
                                    className="w-8 h-7 min-w-8 font-mono text-base font-semibold text-purple-600 dark:text-purple-400"
                                    onPress={() => insertStep({ type: 'comparison', value: op })}
                                >
                                    {op.symbol}
                                </Button>
                            </Tooltip>
                        ))}
                    </div>

                    {/* Parenthesis & Separator */}
                    <div className="flex items-center gap-0.5 bg-white dark:bg-default-100/20 rounded-lg p-0.5 border border-default-200 dark:border-default-700">
                        <Tooltip content="Paréntesis izquierdo" delay={300}>
                            <Button size="sm" isIconOnly variant="light" isDisabled={!validationState.canAddEntity} className="w-8 h-7 min-w-8 font-mono text-base" onPress={() => insertStep({ type: 'parenthesis', value: '(' })}>(</Button>
                        </Tooltip>
                        <Tooltip content="Paréntesis derecho" delay={300}>
                            <Button size="sm" isIconOnly variant="light" isDisabled={!validationState.canAddCloseParen} className="w-8 h-7 min-w-8 font-mono text-base" onPress={() => insertStep({ type: 'parenthesis', value: ')' })}>)</Button>
                        </Tooltip>
                        <Tooltip content="Separador de argumentos" delay={300}>
                            <Button size="sm" isIconOnly variant="light" isDisabled={!validationState.canAddSeparator} className="w-8 h-7 min-w-8 font-mono text-base" onPress={() => insertStep({ type: 'separator', value: ',' })}>,</Button>
                        </Tooltip>
                    </div>

                    {/* Functions */}
                    <Select
                        placeholder="Funciones"
                        size="sm"
                        className="w-full sm:w-36 md:w-40"
                        aria-label="Insertar Función"
                        variant="bordered"
                        selectedKeys={[]}
                        isDisabled={!validationState.canAddEntity}
                        classNames={{
                            trigger: "bg-white dark:bg-default-100/20 h-9 min-h-9",
                            value: "text-xs",
                            listboxWrapper: "max-h-72"
                        }}
                        startContent={<FunctionSquare size={14} className="text-violet-500 shrink-0" />}
                        onChange={(e) => {
                            const f = FORMULA_FUNCTIONS.find(x => x.id === e.target.value);
                            if (f) insertStep({ type: 'function', value: f });
                        }}
                    >
                        {FORMULA_FUNCTIONS.map(f => (
                            <SelectItem
                                key={f.id}
                                textValue={f.name}
                                classNames={{ title: "text-xs", description: "text-[10px]" }}
                                description={f.id}
                            >
                                {f.name}
                            </SelectItem>
                        ))}
                    </Select>

                    {/* Constants */}
                    <div className="flex items-center gap-1 w-full sm:w-auto">
                        <Input
                            type="number"
                            placeholder="Constante"
                            size="sm"
                            className="w-full sm:w-28 md:w-32"
                            variant="bordered"
                            value={constantValue}
                            isDisabled={!validationState.canAddEntity}
                            onChange={(e) => setConstantValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') addConstant();
                            }}
                            classNames={{
                                inputWrapper: "bg-white dark:bg-default-100/20 h-9 min-h-9"
                            }}
                            startContent={<Hash size={14} className="text-default-400 shrink-0" />}
                        />
                        <Button
                            size="sm"
                            variant="flat"
                            isDisabled={!constantValue || !validationState.canAddEntity}
                            onPress={addConstant}
                            className="h-9 px-3"
                        >
                            OK
                        </Button>
                    </div>
                </div>

                {/* Advances Section (Updated Placement) */}
                {activeTab === "variables" && (
                    <div className="mt-2 pt-2 border-t border-default-200 dark:border-default-700 flex flex-wrap items-center gap-3">
                        <span className="text-xs font-medium text-default-500 flex items-center gap-1">
                            <TrendingUp size={12} />
                            Avances:
                        </span>

                        <div className="flex items-center gap-2">
                            <Select
                                placeholder="Año"
                                size="sm"
                                className="w-24"
                                aria-label="Año del avance"
                                variant="bordered"
                                selectedKeys={[advanceYear]}
                                classNames={{
                                    trigger: "bg-white dark:bg-default-100/20 h-8 min-h-8",
                                    value: "text-xs"
                                }}
                                onChange={(e) => setAdvanceYear(e.target.value)}
                            >
                                {years.map(y => (
                                    <SelectItem key={y} textValue={y}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </Select>
                            <Select
                                placeholder="Meses"
                                size="sm"
                                className="w-40 sm:w-48"
                                aria-label="Meses del avance"
                                variant="bordered"
                                selectionMode="multiple"
                                selectedKeys={advanceMonths}
                                classNames={{
                                    trigger: "bg-white dark:bg-default-100/20 h-8 min-h-8",
                                    value: "text-xs"
                                }}
                                onSelectionChange={(keys) => {
                                    const newKeys = new Set<string>(Array.from(keys) as string[]);
                                    if (newKeys.has('ALL') && !advanceMonths.has('ALL')) {
                                        setAdvanceMonths(new Set<string>(['ALL']));
                                    } else if (newKeys.has('ALL') && newKeys.size > 1) {
                                        newKeys.delete('ALL');
                                        setAdvanceMonths(newKeys);
                                    } else {
                                        setAdvanceMonths(newKeys);
                                    }
                                }}
                                items={ALL_MONTH_ITEMS}
                            >
                                {(item) => (
                                    <SelectItem key={item.key} textValue={item.label} className={item.isSpecial ? "text-primary font-medium" : ""}>
                                        {item.label}
                                    </SelectItem>
                                )}
                            </Select>
                            <Button
                                size="sm"
                                variant="flat"
                                color="warning"
                                className="h-8"
                                isDisabled={advanceMonths.size === 0 || !validationState.canAddEntity || (
                                    (advanceMonths.has('ALL') || advanceMonths.size > 1) &&
                                    (!validationState.isInsideFunction ||
                                        (validationState.currentContext?.type === 'function' && validationState.currentContext?.name === 'IF') ||
                                        // Check if context is "clean" (last step is '(' OR 'function' which implies '(')
                                        (
                                            (currentSteps[currentSteps.length - 1]?.type !== 'parenthesis' || currentSteps[currentSteps.length - 1]?.value !== '(') &&
                                            currentSteps[currentSteps.length - 1]?.type !== 'function'
                                        )
                                    )
                                )}
                                onPress={() => {
                                    const isAll = advanceMonths.has('ALL');
                                    const monthsArray = isAll
                                        ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                                        : Array.from(advanceMonths).map(m => parseInt(m)).sort((a, b) => a - b);

                                    const monthNames = monthsArray.map(m => MONTHS.find(x => x.value === m)?.label).filter(Boolean);

                                    const label = isAll
                                        ? `Avance ${advanceYear} (Todo el año)`
                                        : monthsArray.length === 1
                                            ? `Avance ${monthNames[0]} ${advanceYear}`
                                            : `Avance ${advanceYear} (${monthsArray.length} meses)`;

                                    insertStep({
                                        type: 'advance',
                                        value: {
                                            id: `adv-${advanceYear}-${isAll ? 'ALL' : monthsArray.join(',')}`,
                                            year: parseInt(advanceYear),
                                            months: monthsArray,
                                            label
                                        }
                                    });
                                    setAdvanceMonths(new Set());
                                }}
                                startContent={<TrendingUp size={14} />}
                            >
                                Insertar
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // --- Render: Editor Canvas ---
    const renderEditorArea = (steps: FormulaStep[]) => {
        const validation = validateCurrent();
        const statusObj = getFormulaStatusMessage(validation, steps.length);

        return (
            <div className="flex-1 flex flex-col bg-white dark:bg-content1 rounded-xl border border-default-200 dark:border-default-800 shadow-sm overflow-hidden">
                {renderEditorToolbar()}

                {/* Formula Canvas */}
                <div
                    className={`
                        flex-1 p-4 flex flex-wrap items-start content-start gap-1.5 cursor-text
                        min-h-[120px] transition-colors
                        ${steps.length === 0 ? 'border-2 border-dashed border-default-200 dark:border-default-700 m-3 rounded-lg bg-default-50/50 dark:bg-default-100/5' : ''}
                    `}
                    onClick={() => setCursorIndex(steps.length)}
                >
                    {steps.length === 0 && (
                        <div className="w-full h-full flex flex-col items-center justify-center text-default-400 select-none py-8">
                            <Calculator size={32} className="mb-2 opacity-30" />
                            <span className="text-sm">La fórmula está vacía</span>
                            <span className="text-xs mt-1">Use los controles de arriba para construir su fórmula</span>
                        </div>
                    )}

                    {steps.map((step, index) => (
                        <React.Fragment key={index}>
                            {cursorIndex === index && (
                                <div className="w-0.5 h-6 bg-primary rounded-full animate-pulse" />
                            )}
                            <StepChip step={step} onDelete={() => removeStep(index)} />
                        </React.Fragment>
                    ))}
                    {cursorIndex === steps.length && steps.length > 0 && (
                        <div className="w-0.5 h-6 bg-primary rounded-full animate-pulse" />
                    )}
                </div>

                {/* Status Bar */}
                <div className={`
                    px-4 py-2 text-xs border-t flex items-center justify-between
                    ${statusObj.type === 'error' ? 'bg-danger-50 dark:bg-danger-950/30 text-danger-600 dark:text-danger-400 border-danger-200 dark:border-danger-800' :
                        statusObj.type === 'success' ? 'bg-success-50 dark:bg-success-950/30 text-success-600 dark:text-success-400 border-success-200 dark:border-success-800' :
                            statusObj.type === 'warning' ? 'bg-warning-50 dark:bg-warning-950/30 text-warning-600 dark:text-warning-400 border-warning-200 dark:border-warning-800' :
                                'bg-default-50 dark:bg-default-100/10 text-default-500 border-default-200 dark:border-default-800'}
                `}>
                    <div className="flex items-center gap-2 font-medium">
                        {statusObj.type === 'error' && <AlertCircle size={14} />}
                        {statusObj.type === 'success' && <CheckCircle2 size={14} />}
                        {statusObj.type === 'warning' && <AlertCircle size={14} />}
                        <span>{statusObj.message}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Tooltip content="Deshacer último">
                            <Button
                                size="sm"
                                isIconOnly
                                variant="light"
                                isDisabled={steps.length === 0}
                                onPress={undoLastStep}
                                className="w-7 h-7 min-w-7"
                            >
                                <Undo2 size={14} />
                            </Button>
                        </Tooltip>
                        <Tooltip content="Borrar todo">
                            <Button
                                size="sm"
                                isIconOnly
                                variant="light"
                                color="danger"
                                isDisabled={steps.length === 0}
                                onPress={clearAllSteps}
                                className="w-7 h-7 min-w-7"
                            >
                                <Trash2 size={14} />
                            </Button>
                        </Tooltip>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="5xl"
            scrollBehavior="outside"
            placement="center"
            classNames={{
                base: "bg-content1 mx-2 sm:mx-4 my-2 sm:my-4 sm:mx-auto",
                header: "border-b border-divider px-4 sm:px-6",
                footer: "border-t border-divider px-4 sm:px-6",
                body: "p-0",
            }}
        >
            <ModalContent className="rounded-2xl overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col">
                <ModalHeader className="py-3 sm:py-4 shrink-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-start w-full gap-4 sm:gap-8">
                        <div>
                            <h2 className="text-base sm:text-lg font-semibold text-foreground">{title}</h2>
                            <p className="text-xs text-default-400">Configure las fórmulas de cálculo</p>
                        </div>

                        <div className="flex items-center gap-2 sm:ml-auto sm:mr-16">
                            <span className="text-xs text-default-400">Año:</span>
                            <Select
                                selectedKeys={[selectedYear]}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                size="sm"
                                variant="bordered"
                                className="w-24"
                                aria-label="Año de vigencia"
                                classNames={{
                                    trigger: "h-8 min-h-8 bg-default-50 dark:bg-default-100/20"
                                }}
                            >
                                {years.map((year) => (
                                    <SelectItem key={year}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </Select>
                        </div>
                    </div>
                </ModalHeader>

                <ModalBody className="flex-1 flex flex-col min-h-0 bg-default-50/50 dark:bg-default-100/5 overflow-auto">
                    {isLoading && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-content1/80 backdrop-blur-sm">
                            <Spinner label="Cargando datos..." color="primary" />
                        </div>
                    )}

                    <Tabs
                        aria-label="Editor Options"
                        color="primary"
                        variant="solid"
                        radius="lg"
                        classNames={{
                            tabList: "gap-2 sm:gap-4 w-full relative p-1 bg-default-100 dark:bg-default-50/10 mx-3 sm:mx-4 mt-3 sm:mt-4 max-w-fit",
                            cursor: "bg-white dark:bg-content1 shadow-sm",
                            tab: "h-8 sm:h-9 px-2 sm:px-4",
                            tabContent: "group-data-[selected=true]:text-primary font-medium text-xs sm:text-sm",
                            panel: "flex-1 p-0 pt-1 sm:pt-2"
                        }}
                        selectedKey={activeTab}
                        onSelectionChange={(key) => setActiveTab(key as string)}
                        className="flex-1 flex flex-col"
                    >
                        {/* TAB 1: Variables Configuration */}
                        <Tab key="variables" title={
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <VariableIcon size={14} className="sm:w-[15px] sm:h-[15px]" />
                                <span>Variables</span>
                            </div>
                        } className="h-full">
                            <div className="flex flex-col h-full min-h-0">
                                {selectedVariableId ? (
                                    /* Variable Formula Editor View */
                                    <div className="flex flex-col h-full gap-2 sm:gap-3 px-3 sm:px-5 pb-3 sm:pb-5">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 shrink-0">
                                            <Button
                                                variant="flat"
                                                size="sm"
                                                onPress={() => setSelectedVariableId(null)}
                                                startContent={<Undo2 size={14} />}
                                            >
                                                Volver
                                            </Button>

                                            <Button
                                                variant="flat"
                                                size="sm"
                                                onPress={() => setIsReplicateModalOpen(true)}
                                                startContent={<Copy size={14} />}
                                                title="Replicar fórmula a otras variables"
                                                isDisabled={getCurrentSteps().length === 0}
                                            >
                                                Replicar
                                            </Button>

                                            <Divider orientation="vertical" className="h-6 hidden sm:block" />
                                            <div>
                                                <h3 className="text-sm sm:text-base font-semibold flex flex-wrap items-center gap-1 sm:gap-2 text-foreground">
                                                    <span>Fórmula:</span>
                                                    <span className="text-primary">{variables.find(v => v.id === selectedVariableId)?.name}</span>
                                                </h3>
                                                <p className="text-[10px] sm:text-xs text-default-400 mt-0.5">
                                                    Defina cómo se calcula el valor de esta variable.
                                                </p>
                                            </div>
                                        </div>
                                        {renderEditorArea(getCurrentSteps())}
                                    </div>
                                ) : (
                                    /* Variables Cards Grid View */
                                    <div className="flex-1 px-3 sm:px-5 pb-3 sm:pb-5 overflow-y-auto">
                                        <div className="mb-3 sm:mb-4">
                                            <h3 className="text-sm sm:text-base font-semibold text-foreground">Variables del Indicador</h3>
                                            <p className="text-[10px] sm:text-xs text-default-400 mt-0.5">
                                                Seleccione una variable para configurar su fórmula de cálculo.
                                            </p>
                                        </div>

                                        {variables.length === 0 && !isLoading ? (
                                            <div className="flex flex-col items-center justify-center py-16 text-center">
                                                <div className="w-16 h-16 rounded-2xl bg-default-100 dark:bg-default-100/20 flex items-center justify-center mb-4">
                                                    <VariableIcon size={28} className="opacity-40" />
                                                </div>
                                                <h3 className="text-base font-medium text-default-500">No hay variables</h3>
                                                <p className="text-xs max-w-[200px] mt-1.5 text-default-400">
                                                    Este indicador no tiene variables asociadas.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                                {variables.map((v) => {
                                                    const formulaSteps = variableFormulas[v.id] || [];
                                                    const hasFormula = formulaSteps.length > 0;

                                                    return (
                                                        <button
                                                            key={v.id}
                                                            onClick={() => setSelectedVariableId(v.id)}
                                                            className={`
                                                                group relative p-3 sm:p-4 rounded-xl border bg-white dark:bg-content1
                                                                hover:border-primary hover:shadow-lg hover:shadow-primary/10
                                                                transition-all duration-200 text-left
                                                                ${hasFormula
                                                                    ? 'border-success-200 dark:border-success-800'
                                                                    : 'border-default-200 dark:border-default-700'}
                                                            `}
                                                        >
                                                            {/* Status indicator */}
                                                            <div className={`
                                                                absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-2 h-2 rounded-full
                                                                ${hasFormula ? 'bg-success-500' : 'bg-default-300'}
                                                            `} />

                                                            <div className="flex items-start gap-2.5 sm:gap-3">
                                                                <div className={`
                                                                    w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0
                                                                    bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white
                                                                    transition-colors duration-200
                                                                `}>
                                                                    <VariableIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="text-xs sm:text-sm font-semibold text-foreground line-clamp-2 mb-0.5 sm:mb-1">
                                                                        {v.name}
                                                                    </h4>
                                                                    <p className="text-[9px] sm:text-[10px] font-mono text-default-400 mb-1.5 sm:mb-2">
                                                                        {v.code || "Sin código"}
                                                                    </p>

                                                                    {/* Formula preview or status */}
                                                                    <div className={`
                                                                        text-[10px] px-2 py-1 rounded-md inline-flex items-center gap-1
                                                                        ${hasFormula
                                                                            ? 'bg-success-50 dark:bg-success-950/30 text-success-600 dark:text-success-400'
                                                                            : 'bg-warning-50 dark:bg-warning-950/30 text-warning-600 dark:text-warning-400'}
                                                                    `}>
                                                                        {hasFormula ? (
                                                                            <>
                                                                                <CheckCircle2 size={10} />
                                                                                <span>{formulaSteps.length} elementos</span>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <AlertCircle size={10} />
                                                                                <span>Sin fórmula</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Tab>

                        {/* TAB 2: Main Formula */}
                        <Tab key="main" title={
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <Calculator size={14} className="sm:w-[15px] sm:h-[15px]" />
                                <span className="hidden sm:inline">Fórmula Principal</span>
                                <span className="sm:hidden">Principal</span>
                            </div>
                        } className="h-full">
                            <div className="flex flex-col h-full px-3 sm:px-5 pb-3 sm:pb-5 gap-2 sm:gap-3">
                                <div className="shrink-0">
                                    <h3 className="text-sm sm:text-base font-semibold flex items-center gap-2 text-foreground">
                                        <span className="w-2 h-2 rounded-full bg-secondary" />
                                        Fórmula del Indicador
                                    </h3>
                                    <p className="text-[10px] sm:text-xs text-default-400 mt-0.5">
                                        Construya la fórmula final utilizando las variables configuradas.
                                    </p>
                                </div>
                                {renderEditorArea(getCurrentSteps())}
                            </div>
                        </Tab>
                    </Tabs>
                </ModalBody>

                <ModalFooter className="py-2 sm:py-3 bg-content1 rounded-b-2xl shrink-0 flex-wrap gap-2">
                    <Button

                        variant="light"
                        onPress={() => setIsGuideOpen(true)}
                        className="mr-auto text-default-500 hidden sm:flex"
                        startContent={<HelpCircle size={16} />}
                        size="sm"
                    >
                        Ayuda
                    </Button>

                    <Button variant="flat" onPress={onClose} size="sm">
                        Cerrar
                    </Button>
                    <Button
                        color="primary"
                        onPress={handleSave}
                        startContent={<Save size={16} />}
                        size="sm"
                        isDisabled={mainFormulaSteps.length === 0}
                        title={mainFormulaSteps.length === 0 ? "La fórmula principal no puede estar vacía" : "Guardar Fórmulas"}
                    >
                        <span className="hidden sm:inline">Guardar Todo</span>
                        <span className="sm:hidden">Guardar</span>
                    </Button>
                </ModalFooter>
            </ModalContent>

            <ReplicateFormulaModal
                isOpen={isReplicateModalOpen}
                onClose={() => setIsReplicateModalOpen(false)}
                sourceVariable={selectedVariableId ? { ...variables.find(v => v.id === selectedVariableId)!, formula: getCurrentSteps() } : null}
                allVariables={variables}
                onReplicate={handleReplicate}
            />

            <FormulaGuideModal
                isOpen={isGuideOpen}
                onClose={() => setIsGuideOpen(false)}
            />
        </Modal>
    );
}
