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

// ---- Standalone helpers to reduce cognitive complexity ----

interface EditorContextItem {
    type: 'function' | 'paren';
    name?: string;
    argIndex: number;
}

function updateEditorContextStack(step: FormulaStep, stack: EditorContextItem[]): void {
    if (step.type === 'function') {
        stack.push({ type: 'function', name: step.value.id, argIndex: 0 });
        return;
    }
    if (step.type === 'parenthesis' && step.value === '(') {
        stack.push({ type: 'paren', argIndex: 0 });
        return;
    }
    if (step.type === 'parenthesis' && step.value === ')' && stack.length > 0) {
        stack.pop();
        return;
    }
    if (step.type === 'separator' && stack.length > 0) {
        stack.at(-1)!.argIndex++;
    }
}

function buildEditorContextStack(steps: FormulaStep[]): EditorContextItem[] {
    const stack: EditorContextItem[] = [];
    for (const s of steps) {
        updateEditorContextStack(s, stack);
    }
    return stack;
}

function computeEntityOperatorFlags(lastStep: FormulaStep | undefined): { canAddEntity: boolean; canAddOperator: boolean } {
    if (!lastStep) return { canAddEntity: true, canAddOperator: false };
    const ENTITY_TRIGGERS = ['operator', 'comparison', 'separator'];
    const isEntityContext = ENTITY_TRIGGERS.includes(lastStep.type)
        || (lastStep.type === 'parenthesis' && lastStep.value === '(')
        || lastStep.type === 'function';
    return isEntityContext
        ? { canAddEntity: true, canAddOperator: false }
        : { canAddEntity: false, canAddOperator: true };
}

const SCOPE_BOUNDARY_TYPES = new Set(['function', 'separator']);

function countComparisonsAtLevel(steps: FormulaStep[]): number {
    let count = 0;
    let depth = 0;
    for (let i = steps.length - 1; i >= 0; i--) {
        const s = steps[i];
        if (s.type === 'parenthesis') {
            if (s.value === ')') { depth++; continue; }
            if (depth === 0) break;
            depth--; continue;
        }
        if (depth > 0) continue;
        if (SCOPE_BOUNDARY_TYPES.has(s.type)) break;
        if (s.type === 'comparison') count++;
    }
    return count;
}

function computeCanAddUnary(lastStep: FormulaStep | undefined): boolean {
    if (!lastStep) return true;
    return lastStep.type === 'function'
        || (lastStep.type === 'parenthesis' && lastStep.value === '(')
        || lastStep.type === 'separator';
}

const RESTRICTED_FUNCTIONS = new Set(['AVG', 'MAX', 'MIN', 'SUM']);

function isRestrictedFunction(ctx: EditorContextItem | null): boolean {
    return ctx?.type === 'function' && RESTRICTED_FUNCTIONS.has(ctx.name || '');
}

function isIfConditionArg(ctx: EditorContextItem | null): boolean {
    return ctx?.type === 'function' && ctx.name === 'IF' && ctx.argIndex === 0;
}

function isIfLastArg(ctx: EditorContextItem | null): boolean {
    return ctx?.type === 'function' && ctx.name === 'IF' && (ctx.argIndex ?? 0) >= 2;
}

function computeValidationState(steps: FormulaStep[]): ValidationState {
    const lastStep = steps.at(-1);
    const contextStack = buildEditorContextStack(steps);
    const currentContext = contextStack.at(-1) ?? null;
    const isInsideFunction = contextStack.some(c => c.type === 'function');
    const openParens = steps.filter(s => (s.type === 'parenthesis' && s.value === '(') || s.type === 'function').length;
    const closeParens = steps.filter(s => s.type === 'parenthesis' && s.value === ')').length;

    const { canAddEntity, canAddOperator: rawCanAddOperator } = computeEntityOperatorFlags(lastStep);
    let canAddOperator = rawCanAddOperator;
    let canAddSeparator = rawCanAddOperator && isInsideFunction;
    const canAddCloseParen = rawCanAddOperator && openParens > closeParens;

    if (isRestrictedFunction(currentContext)) {
        canAddOperator = false;
    }

    const inIfCondition = isIfConditionArg(currentContext);
    const canAddComparisonOperator = inIfCondition && countComparisonsAtLevel(steps) === 0;

    if (isIfLastArg(currentContext)) {
        canAddSeparator = false;
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
        canAddUnaryOperator: computeCanAddUnary(lastStep),
        isInIfCondition: !!inIfCondition,
        canAddComparisonOperator
    };
}

function mapRawVariables(rawVars: any[]): Variable[] {
    return rawVars.map((v: any) => ({
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
}

function mapIndicatorGoals(rawGoals: any[]): GoalIndicator[] {
    return rawGoals.map((g: any) => ({
        idMeta: g.id,
        valorMeta: g.value,
        year: g.year,
        label: `Meta Ind [${g.year}]`
    }));
}

function mapIndicatorQuads(rawQuads: any[]): IndicatorQuadrennium[] {
    return rawQuads.map((q: any) => ({
        id: q.id,
        startYear: q.startYear,
        endYear: q.endYear,
        value: q.value,
        label: `Cuatrenio Ind [${q.startYear}-${q.endYear}]`
    }));
}

function traverseAndExtractFormulas(
    node: any,
    extracted: Record<string, FormulaStep[]>,
    mappedVariables: Variable[],
    indGoals: GoalIndicator[],
    indQuads: IndicatorQuadrennium[]
): void {
    if (!node) return;
    if (node.kind === 'ref' && node.value && node.subFormula) {
        const steps = convertAstToSteps(node.subFormula, mappedVariables, [], indGoals, [], indQuads);
        extracted[node.value] = steps;
        const v = mappedVariables.find(x => x.id === node.value);
        if (v) v.formula = steps;
        traverseAndExtractFormulas(node.subFormula, extracted, mappedVariables, indGoals, indQuads);
    }
    if (node.left) traverseAndExtractFormulas(node.left, extracted, mappedVariables, indGoals, indQuads);
    if (node.right) traverseAndExtractFormulas(node.right, extracted, mappedVariables, indGoals, indQuads);
    if (node.args && Array.isArray(node.args)) {
        node.args.forEach((arg: any) => traverseAndExtractFormulas(arg, extracted, mappedVariables, indGoals, indQuads));
    }
}

interface ProcessedFormulaData {
    mappedVariables: Variable[];
    indGoals: GoalIndicator[];
    indQuads: IndicatorQuadrennium[];
    baseline?: string;
    existingFormulaId: string | null;
    mainFormulaSteps: FormulaStep[];
    variableFormulas: Record<string, FormulaStep[]>;
}

function processFormulaApiData(data: any): ProcessedFormulaData | null {
    if (!data) return null;

    const mappedVariables = mapRawVariables(data.variables || []);
    const indGoals = mapIndicatorGoals(data.indicator?.goals || []);
    const indQuads = mapIndicatorQuads(data.indicator?.quadrenniums || []);

    const result: ProcessedFormulaData = {
        mappedVariables,
        indGoals,
        indQuads,
        baseline: data.indicator?.baseline,
        existingFormulaId: null,
        mainFormulaSteps: [],
        variableFormulas: {},
    };

    const formulas = data.indicator?.formulas;
    if (!formulas || !Array.isArray(formulas) || formulas.length === 0) return result;

    result.existingFormulaId = formulas[0].id;

    if (formulas[0].expression) {
        result.mainFormulaSteps = parseFormulaString(
            formulas[0].expression, mappedVariables, [], indGoals, new Map(), indQuads
        );
    }

    if (formulas[0].ast) {
        const extracted: Record<string, FormulaStep[]> = {};
        traverseAndExtractFormulas(formulas[0].ast, extracted, mappedVariables, indGoals, indQuads);
        result.variableFormulas = extracted;
        result.mappedVariables = [...mappedVariables];
    }

    return result;
}

function serializeStep(s: FormulaStep): string {
    switch (s.type) {
        case 'variable': return `[${s.value.id}]`;
        case 'goal_variable': return `[MV:${s.value.idMeta}]`;
        case 'goal_indicator': return `[MI:${s.value.idMeta}]`;
        case 'quadrennium_variable': return `[QV:${s.value.id}]`;
        case 'quadrennium_indicator': return `[QI:${s.value.id}]`;
        case 'baseline': return `[LINEA_BASE]`;
        case 'advance': return `[AV:${s.value.year}:${s.value.months.join('-')}]`;
        case 'function': return `${s.value.id}(`;
        case 'operator': return s.value.symbol;
        case 'comparison': return s.value.symbol;
        case 'constant': return s.value;
        case 'parenthesis': return s.value;
        case 'separator': return ',';
        default: return '';
    }
}

function hydrateStep(
    step: FormulaStep,
    variableFormulas: Record<string, FormulaStep[]>,
    visitedIds: Set<string>
): FormulaStep {
    if (step.type !== 'variable') return step;
    const varId = step.value.id;
    if (visitedIds.has(varId)) return step;
    const currentFormula = variableFormulas[varId] || step.value.formula || [];
    const nextVisited = new Set(visitedIds);
    nextVisited.add(varId);
    return {
        ...step,
        value: {
            ...step.value,
            formula: hydrateSteps(currentFormula, variableFormulas, nextVisited)
        }
    };
}

function hydrateSteps(
    steps: FormulaStep[],
    variableFormulas: Record<string, FormulaStep[]>,
    visitedIds = new Set<string>()
): FormulaStep[] {
    return steps.map(step => hydrateStep(step, variableFormulas, visitedIds));
}

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
    const variableSteps = selectedVariableId ? (variableFormulas[selectedVariableId] || []) : [];
    const currentSteps = activeTab === "variables" ? variableSteps : mainFormulaSteps;

    // Derived: Validation State
    const validationState = useMemo(() => computeValidationState(currentSteps), [currentSteps]);

    // Fetch Data
    const fetchData = useCallback(async (year: string) => {
        if (!indicatorId) return;
        setIsLoading(true);
        try {
            const data = await getIndicatorFormulaData(indicatorId, year, type);
            const processed = processFormulaApiData(data);

            if (processed) {
                setBaseline(processed.baseline);
                setGoalIndicators(processed.indGoals);
                setIndicatorQuadrenniums(processed.indQuads);
                setVariables(processed.mappedVariables);
                setExistingFormulaId(processed.existingFormulaId);
                setMainFormulaSteps(processed.mainFormulaSteps);
                setVariableFormulas(processed.variableFormulas);
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
        const insertPos = cursorIndex ?? newSteps.length;
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
        return steps.map(serializeStep).join('');
    }, []);

    const getHydratedSteps = useCallback((steps: FormulaStep[], visitedIds = new Set<string>()): FormulaStep[] => {
        return hydrateSteps(steps, variableFormulas, visitedIds);
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
