import { useState, useCallback, useEffect, useMemo } from "react";
import {
    Variable,
    GoalVariable,
    GoalIndicator,
    IndicatorQuadrennium,
    FormulaStep,
    ValidationResult,
    parseFormulaString,
    validateFormula,
    buildAST,
    convertAstToSteps
} from "@/utils/formula";
import { getIndicatorFormulaData } from "@/services/masters/formulas.service";

export interface UseFormulaEditorOptions {
    indicatorId: string;
    isOpen: boolean;
    onSave: (payload: any, unused?: any) => Promise<void>;
    type?: 'action' | 'indicative';
}

export interface ValidationState {
    canAddEntity: boolean;
    canAddOperator: boolean;
    canAddMathOperator: boolean;
    canAddOpenParen: boolean;
    canAddCloseParen: boolean;
    canAddSeparator: boolean;
    isInsideFunction: boolean;
    currentContext: { type: 'function' | 'paren', name?: string, argIndex: number } | null;
    canAddUnaryOperator: boolean;
    isInIfCondition: boolean;
    canAddComparisonOperator: boolean;
}

export function useFormulaEditor({ indicatorId, isOpen, onSave, type = 'action' }: UseFormulaEditorOptions) {
    const currentYear = new Date().getFullYear().toString();
    const years = [2024, 2025, 2026, 2027, 2028].map(y => y.toString());

    // Core State
    const [selectedYear, setSelectedYear] = useState<string>(currentYear);
    const [isLoading, setIsLoading] = useState(false);

    // Data State
    const [variables, setVariables] = useState<Variable[]>([]);
    const [goalVariables, setGoalVariables] = useState<GoalVariable[]>([]);
    const [goalIndicators, setGoalIndicators] = useState<GoalIndicator[]>([]);
    const [indicatorQuadrenniums, setIndicatorQuadrenniums] = useState<IndicatorQuadrennium[]>([]);
    const [baseline, setBaseline] = useState<string | undefined>(undefined);
    const [existingFormulaId, setExistingFormulaId] = useState<string | null>(null);

    // Editor State
    const [activeTab, setActiveTab] = useState<string>("variables");
    const [selectedVariableId, setSelectedVariableId] = useState<string | null>(null);

    // Formula States
    const [variableFormulas, setVariableFormulas] = useState<Record<string, FormulaStep[]>>({});
    const [mainFormulaSteps, setMainFormulaSteps] = useState<FormulaStep[]>([]);
    const [isReplicateModalOpen, setIsReplicateModalOpen] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);

    // Editor UI State
    const [cursorIndex, setCursorIndex] = useState<number | null>(null);
    const [constantValue, setConstantValue] = useState<string>('');
    const [advanceYear, setAdvanceYear] = useState<string>(currentYear);
    const [advanceMonths, setAdvanceMonths] = useState<Set<string>>(new Set());

    // Derived: Current Steps
    const currentSteps = activeTab === "variables"
        ? (selectedVariableId ? (variableFormulas[selectedVariableId] || []) : [])
        : mainFormulaSteps;

    // Derived: Validation State
    const validationState = useMemo((): ValidationState => {
        const steps = currentSteps;
        const lastStep = steps[steps.length - 1];

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

        let canAddEntity = false;
        let canAddOperator = false;

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

        let canAddSeparator = canAddOperator && isInsideFunction;
        const canAddCloseParen = canAddOperator && openParens > closeParens;

        const RESTRICTED_OPERATOR_FUNCTIONS = ['AVG', 'MAX', 'MIN', 'SUM'];
        if (currentContext && currentContext.type === 'function' && RESTRICTED_OPERATOR_FUNCTIONS.includes(currentContext.name || '')) {
            canAddOperator = false;
        }

        const isInIfCondition = currentContext && currentContext.type === 'function' && currentContext.name === 'IF' && currentContext.argIndex === 0;

        let canAddComparisonOperator = false;
        if (isInIfCondition) {
            let comparisonCount = 0;
            let bracketDepth = 0;

            for (let i = steps.length - 1; i >= 0; i--) {
                const s = steps[i];
                if (s.type === 'parenthesis' && s.value === ')') bracketDepth++;
                if (s.type === 'parenthesis' && s.value === '(') {
                    if (bracketDepth === 0) break;
                    bracketDepth--;
                }
                if (s.type === 'function') {
                    if (bracketDepth === 0) break;
                }
                if (s.type === 'separator' && bracketDepth === 0) break;

                if (bracketDepth === 0 && s.type === 'comparison') {
                    comparisonCount++;
                }
            }
            canAddComparisonOperator = comparisonCount === 0;
        }

        if (currentContext && currentContext.type === 'function' && currentContext.name === 'IF') {
            if (currentContext.argIndex >= 2) {
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
            canAddSeparator,
            isInsideFunction,
            currentContext,
            canAddUnaryOperator,
            isInIfCondition: !!isInIfCondition,
            canAddComparisonOperator
        };
    }, [currentSteps]);

    // Fetch Data
    const fetchData = useCallback(async (year: string) => {
        if (!indicatorId) return;
        setIsLoading(true);
        try {
            const data = await getIndicatorFormulaData(indicatorId, year, type);

            if (data) {
                const fetchedVariables = data.variables || [];
                setBaseline(data.indicator?.baseline);
                const mappedVariables: Variable[] = fetchedVariables.map((v: any) => ({
                    id: v.id,
                    code: v.code,
                    name: v.name,
                    description: v.description,
                    formula: [],
                    goals: v.goals?.map((g: any) => ({
                        idMeta: g.id,
                        valorMeta: g.value,
                        year: g.year,
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

                const indGoals = data.indicator?.goals?.map((g: any) => ({
                    idMeta: g.id,
                    valorMeta: g.value,
                    year: g.year,
                    label: `Meta Ind [${g.year}]`
                })) || [];
                setGoalIndicators(indGoals);

                const indQuads = data.indicator?.quadrenniums?.map((q: any) => ({
                    id: q.id,
                    startYear: q.startYear,
                    endYear: q.endYear,
                    value: q.value,
                    label: `Cuatrenio Ind [${q.startYear}-${q.endYear}]`
                })) || [];
                setIndicatorQuadrenniums(indQuads);

                setVariables(mappedVariables);

                const formulas = data.indicator?.formulas;
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

                    const extractedFormulas: Record<string, FormulaStep[]> = {};

                    const traverseAndExtract = (node: any) => {
                        if (!node) return;

                        if (node.kind === 'ref' && node.value && node.subFormula) {
                            const steps = convertAstToSteps(
                                node.subFormula,
                                mappedVariables,
                                [],
                                indGoals,
                                [],
                                indQuads
                            );
                            extractedFormulas[node.value] = steps;

                            const v = mappedVariables.find(x => x.id === node.value);
                            if (v) v.formula = steps;

                            traverseAndExtract(node.subFormula);
                        }

                        if (node.left) traverseAndExtract(node.left);
                        if (node.right) traverseAndExtract(node.right);
                        if (node.args && Array.isArray(node.args)) {
                            node.args.forEach((arg: any) => traverseAndExtract(arg));
                        }
                    };

                    if (formulas[0].ast) {
                        traverseAndExtract(formulas[0].ast);
                        setVariableFormulas(extractedFormulas);
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
    }, [indicatorId, type]);

    // Reset and fetch on open
    useEffect(() => {
        if (isOpen) {
            setVariables([]);
            setGoalVariables([]);
            setGoalIndicators([]);
            setIndicatorQuadrenniums([]);
            setBaseline(undefined);
            setExistingFormulaId(null);
            setActiveTab("variables");
            setSelectedVariableId(null);
            setVariableFormulas({});
            setMainFormulaSteps([]);
            setCursorIndex(null);
            setConstantValue('');
            setAdvanceMonths(new Set());

            fetchData(selectedYear);
        }
    }, [isOpen, selectedYear, fetchData]);

    // Helpers
    const getCurrentSteps = useCallback(() => {
        if (activeTab === "variables" && selectedVariableId) {
            return variableFormulas[selectedVariableId] || [];
        }
        if (activeTab === "main") {
            return mainFormulaSteps;
        }
        return [];
    }, [activeTab, selectedVariableId, variableFormulas, mainFormulaSteps]);

    const updateCurrentSteps = useCallback((newSteps: FormulaStep[]) => {
        if (activeTab === "variables" && selectedVariableId) {
            setVariableFormulas(prev => ({
                ...prev,
                [selectedVariableId]: newSteps
            }));
        } else if (activeTab === "main") {
            setMainFormulaSteps(newSteps);
        }
    }, [activeTab, selectedVariableId]);

    const insertStep = useCallback((step: FormulaStep) => {
        const current = getCurrentSteps();
        const newSteps = [...current];
        const insertPos = cursorIndex !== null ? cursorIndex : newSteps.length;
        newSteps.splice(insertPos, 0, step);
        updateCurrentSteps(newSteps);
        setCursorIndex(insertPos + 1);
    }, [getCurrentSteps, updateCurrentSteps, cursorIndex]);

    const removeStep = useCallback((index: number) => {
        const current = getCurrentSteps();
        const newSteps = [...current];
        newSteps.splice(index, 1);
        updateCurrentSteps(newSteps);
        if (cursorIndex !== null && cursorIndex > index) {
            setCursorIndex(cursorIndex - 1);
        }
    }, [getCurrentSteps, updateCurrentSteps, cursorIndex]);

    const undoLastStep = useCallback(() => {
        const current = getCurrentSteps();
        if (current.length > 0) {
            updateCurrentSteps(current.slice(0, -1));
        }
    }, [getCurrentSteps, updateCurrentSteps]);

    const clearAllSteps = useCallback(() => {
        updateCurrentSteps([]);
        setCursorIndex(null);
    }, [updateCurrentSteps]);

    const validateCurrent = useCallback((): ValidationResult => {
        return validateFormula(getCurrentSteps());
    }, [getCurrentSteps]);

    const addConstant = useCallback(() => {
        if (!constantValue) return;
        insertStep({ type: 'constant', value: constantValue });
        setConstantValue('');
    }, [constantValue, insertStep]);

    const handleReplicate = useCallback((targetIds: string[], mappedFormulas: Record<string, FormulaStep[]>) => {
        setVariableFormulas(prev => {
            const next = { ...prev };
            targetIds.forEach(id => {
                if (mappedFormulas[id]) {
                    next[id] = mappedFormulas[id];
                }
            });
            return next;
        });
    }, []);

    const serializeFormula = useCallback((steps: FormulaStep[]) => {
        return steps.map(s => {
            if (s.type === 'variable') return `[${s.value.id}]`;
            if (s.type === 'goal_variable') return `[MV:${s.value.idMeta}]`;
            if (s.type === 'goal_indicator') return `[MI:${s.value.idMeta}]`;
            if (s.type === 'quadrennium_variable') return `[QV:${s.value.id}]`;
            if (s.type === 'quadrennium_indicator') return `[QI:${s.value.id}]`;
            if (s.type === 'baseline') return `[LINEA_BASE]`;
            if (s.type === 'advance') return `[AV:${s.value.year}:${s.value.months.join('-')}]`;
            if (s.type === 'function') return `${s.value.id}(`;
            if (s.type === 'operator') return s.value.symbol;
            if (s.type === 'comparison') return s.value.symbol;
            if (s.type === 'constant') return s.value;
            if (s.type === 'parenthesis') return s.value;
            if (s.type === 'separator') return ',';
            return '';
        }).join('');
    }, []);

    const getHydratedSteps = useCallback((steps: FormulaStep[], visitedIds = new Set<string>()): FormulaStep[] => {
        return steps.map(step => {
            if (step.type === 'variable') {
                const varId = step.value.id;

                if (visitedIds.has(varId)) {
                    return step;
                }

                const currentFormula = variableFormulas[varId] || step.value.formula || [];

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
    }, [variableFormulas]);

    const handleSave = useCallback(() => {
        if (mainFormulaSteps.length === 0) {
            return;
        }

        const hydratedMainSteps = getHydratedSteps(mainFormulaSteps);
        const unifiedAST = buildAST(hydratedMainSteps, true);

        const payload = {
            id: existingFormulaId,
            indicatorId,
            expression: serializeFormula(mainFormulaSteps),
            ast: unifiedAST,
            variables: Object.entries(variableFormulas).map(([varId, steps]) => ({
                variableId: varId,
                formula: serializeFormula(steps),
                ast: buildAST(getHydratedSteps(steps), true)
            }))
        };

        onSave(payload, null);
    }, [mainFormulaSteps, existingFormulaId, indicatorId, serializeFormula, getHydratedSteps, variableFormulas, onSave]);

    return {
        // State
        selectedYear,
        setSelectedYear,
        isLoading,
        variables,
        goalVariables,
        goalIndicators,
        indicatorQuadrenniums,
        baseline,
        existingFormulaId,
        activeTab,
        setActiveTab,
        selectedVariableId,
        setSelectedVariableId,
        variableFormulas,
        mainFormulaSteps,
        isReplicateModalOpen,
        setIsReplicateModalOpen,
        isGuideOpen,
        setIsGuideOpen,
        cursorIndex,
        setCursorIndex,
        constantValue,
        setConstantValue,
        advanceYear,
        setAdvanceYear,
        advanceMonths,
        setAdvanceMonths,
        years,

        // Derived
        currentSteps,
        validationState,

        // Handlers
        fetchData,
        getCurrentSteps,
        updateCurrentSteps,
        insertStep,
        removeStep,
        undoLastStep,
        clearAllSteps,
        validateCurrent,
        addConstant,
        handleReplicate,
        serializeFormula,
        getHydratedSteps,
        handleSave
    };
}
