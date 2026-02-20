import React from "react";
import {
    Select,
    SelectItem,
    Divider,
    Button,
    Tooltip,
    Input
} from "@heroui/react";
import {
    Variable as VariableIcon,
    Target,
    Calendar,
    FunctionSquare,
    Hash,
    TrendingUp,
} from "lucide-react";
import {
    Variable,
    GoalIndicator,
    IndicatorQuadrennium,
    FormulaStep,
    FORMULA_FUNCTIONS,
    FORMULA_OPERATORS,
    COMPARISON_OPERATORS
} from "@/utils/formula";
import { ValidationState } from "../hooks/useFormulaEditor";
import { cleanLabel, MONTHS, ALL_MONTH_ITEMS } from "../utils/helpers";

export interface EditorToolbarProps {
    activeTab: string;
    selectedVariableId: string | null;
    variables: Variable[];
    goalIndicators: GoalIndicator[];
    indicatorQuadrenniums: IndicatorQuadrennium[];
    validationState: ValidationState;
    currentSteps: FormulaStep[];
    years: string[];
    variableFormulas: Record<string, FormulaStep[]>;

    // UI State
    constantValue: string;
    setConstantValue: (value: string) => void;
    advanceYear: string;
    setAdvanceYear: (value: string) => void;
    advanceMonths: Set<string>;
    setAdvanceMonths: (value: Set<string>) => void;

    // Handlers
    insertStep: (step: FormulaStep) => void;
    addConstant: () => void;
    baseline?: string;
    type?: 'action' | 'indicative';
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
    activeTab,
    selectedVariableId,
    variables,
    goalIndicators,
    indicatorQuadrenniums,
    validationState,
    currentSteps,
    years,
    variableFormulas,
    constantValue,
    setConstantValue,
    advanceYear,
    setAdvanceYear,
    advanceMonths,
    setAdvanceMonths,
    insertStep,
    addConstant,
    baseline,
    type
}) => {
    const selectedVariable = selectedVariableId ? variables.find(v => v.id === selectedVariableId) : null;
    const currentVariableGoals = selectedVariable?.goals || [];
    const currentVariableQuadrenniums = selectedVariable?.quadrenniums || [];

    // Check if a variable has a formula defined
    const variableHasFormula = (varId: string) => {
        return (variableFormulas[varId]?.length || 0) > 0;
    };

    // Filter variables that have formulas (for main formula tab)
    const variablesWithFormulas = variables.filter(v => variableHasFormula(v.id));

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
                                isDisabled={!validationState.canAddEntity || variablesWithFormulas.length === 0}
                                classNames={{
                                    trigger: "bg-white dark:bg-default-100/20 h-9 min-h-9",
                                    value: "text-xs",
                                    listboxWrapper: "max-h-72"
                                }}
                                startContent={<VariableIcon size={14} className="text-primary shrink-0" />}
                                onChange={(e) => {
                                    const v = variables.find(x => x.id === e.target.value);
                                    if (v && variableHasFormula(v.id)) {
                                        insertStep({ type: 'variable', value: v });
                                    }
                                }}
                            >
                                {variablesWithFormulas.length > 0 ? (
                                    variablesWithFormulas.map(v => (
                                        <SelectItem
                                            key={v.id}
                                            textValue={v.name}
                                            classNames={{ title: "text-xs", description: "text-[10px]" }}
                                            description={v.code || "Sin código"}
                                        >
                                            {v.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem key="none" textValue="Sin variables" disabled>
                                        No hay variables con fórmula
                                    </SelectItem>
                                )}
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

                            {type === 'indicative' && baseline && (
                                <Tooltip content={`Insertar Línea Base (${baseline})`}>
                                    <Button
                                        size="sm"
                                        variant="bordered"
                                        className="bg-white dark:bg-default-100/20 h-9 min-h-9 px-3"
                                        startContent={<TrendingUp size={14} className="text-blue-500 shrink-0" />}
                                        isDisabled={!validationState.canAddEntity}
                                        onPress={() => insertStep({ type: 'baseline', value: { id: 'LINEA_BASE', label: 'Línea Base' } })}
                                    >
                                        Línea Base
                                    </Button>
                                </Tooltip>
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

            {/* Advances Section */}
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
                                    (
                                        (currentSteps.at(-1)?.type !== 'parenthesis' || currentSteps.at(-1)?.value !== '(') &&
                                        currentSteps.at(-1)?.type !== 'function'
                                    )
                                )
                            )}
                            onPress={() => {
                                const isAll = advanceMonths.has('ALL');
                                const monthsArray = isAll
                                    ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                                    : Array.from(advanceMonths).map(m => Number.parseInt(m)).sort((a, b) => a - b);

                                const firstMonthName = MONTHS.find(x => x.value === monthsArray[0])?.label;

                                const partialLabel = monthsArray.length === 1
                                    ? `Avance ${firstMonthName} ${advanceYear}`
                                    : `Avance ${advanceYear} (${monthsArray.length} meses)`;
                                const label = isAll
                                    ? `Avance ${advanceYear} (Todo el año)`
                                    : partialLabel;

                                insertStep({
                                    type: 'advance',
                                    value: {
                                        id: `adv-${advanceYear}-${isAll ? 'ALL' : monthsArray.join(',')}`,
                                        year: Number.parseInt(advanceYear),
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
