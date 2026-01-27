export interface FormulaStep {
    type: 'variable' | 'goal_variable' | 'goal_indicator' | 'baseline' | 'function' | 'operator' | 'comparison' | 'constant' | 'separator' | 'parenthesis' | 'advance';
    value: any;
}

export interface Variable {
    id: string;
    name: string;
    description?: string;
    formula?: FormulaStep[];
}

export interface GoalVariable {
    idMeta: string;
    valorMeta: string;
    label?: string;
}

export interface GoalIndicator {
    idMeta: string;
    metaIndicador: string;
    label?: string;
}

export interface FormulaFunction {
    id: string;
    name: string;
}

export interface FormulaOperator {
    id: string;
    symbol: string;
    name?: string;
}

export const FORMULA_FUNCTIONS: FormulaFunction[] = [
    { id: 'SUM', name: 'SUMA' },
    { id: 'AVG', name: 'PROMEDIO' },
    { id: 'MAX', name: 'MÁXIMO' },
    { id: 'MIN', name: 'MÍNIMO' },
    { id: 'IF', name: 'SI' },
];

export const FORMULA_OPERATORS: FormulaOperator[] = [
    { id: '+', symbol: '+' },
    { id: '-', symbol: '-' },
    { id: '*', symbol: '*' },
    { id: '/', symbol: '/' },
];

export const COMPARISON_OPERATORS: FormulaOperator[] = [
    { id: '=', symbol: '=', name: 'Igual' },
    { id: '!=', symbol: '≠', name: 'Diferente' },
    { id: '>', symbol: '>', name: 'Mayor que' },
    { id: '<', symbol: '<', name: 'Menor que' },
    { id: '>=', symbol: '≥', name: 'Mayor o igual' },
    { id: '<=', symbol: '≤', name: 'Menor o igual' },
];

export interface ValidationResult {
    isValid: boolean;
    isComplete: boolean;
    errors: string[];
    warnings: string[];
    canSave: boolean;
}

/**
 * Parse a stored formula string back into editor steps
 */
export function parseFormulaString(
    formulaString: string,
    variables: Variable[] = [],
    goalsVariables: GoalVariable[] = [],
    goalsIndicators: GoalIndicator[] = []
): FormulaStep[] {
    if (!formulaString || typeof formulaString !== 'string') {
        return [];
    }

    const steps: FormulaStep[] = [];
    const tokenRegex = /(\[LINEA_BASE\]|\[MV:[^\]]+\]|\[MI:[^\]]+\]|\[[^\]]+\]|SUM\(|AVG\(|MAX\(|MIN\(|IF\(|[+\-*/(),]|≠|≥|≤|[=><]|\d+\.?\d*)/g;

    let match;
    while ((match = tokenRegex.exec(formulaString)) !== null) {
        const token = match[0].trim();
        if (!token) continue;

        if (token === '[LINEA_BASE]') {
            steps.push({ type: 'baseline', value: { id: 'LINEA_BASE', label: 'Línea Base' } });
        }
        else if (token.startsWith('[') && token.endsWith(']') && !token.startsWith('[MV:') && !token.startsWith('[MI:')) {
            const varId = token.slice(1, -1);
            const variable = variables.find(v => v.id === varId);
            if (variable) {
                steps.push({ type: 'variable', value: variable });
            } else {
                steps.push({ type: 'variable', value: { id: varId, name: varId, formula: [] } });
            }
        }
        else if (token.startsWith('[MV:') && token.endsWith(']')) {
            const idMeta = token.slice(4, -1);
            const goal = goalsVariables.find(g => g.idMeta === idMeta);
            if (goal) {
                const label = `Meta Variable [${goal.valorMeta}]`;
                steps.push({ type: 'goal_variable', value: { ...goal, label } });
            } else {
                steps.push({ type: 'goal_variable', value: { idMeta, label: `Meta Variable [${idMeta}]` } as any });
            }
        }
        else if (token.startsWith('[MI:') && token.endsWith(']')) {
            const idMeta = token.slice(4, -1);
            const goal = goalsIndicators.find(g => g.idMeta === idMeta);
            if (goal) {
                const label = `Meta Indicador [${goal.metaIndicador}]`;
                steps.push({ type: 'goal_indicator', value: { ...goal, label } });
            } else {
                steps.push({ type: 'goal_indicator', value: { idMeta, label: `Meta Indicador [${idMeta}]` } as any });
            }
        }
        else if (/^(SUM|AVG|MAX|MIN|IF)\($/i.test(token)) {
            const funcId = token.slice(0, -1).toUpperCase();
            const func = FORMULA_FUNCTIONS.find(f => f.id === funcId);
            if (func) {
                steps.push({ type: 'function', value: func });
            }
        }
        else if (['+', '-', '*', '/'].includes(token)) {
            const op = FORMULA_OPERATORS.find(o => o.symbol === token);
            if (op) {
                steps.push({ type: 'operator', value: op });
            }
        }
        else if (['=', '≠', '>', '<', '≥', '≤'].includes(token)) {
            const comp = COMPARISON_OPERATORS.find(c => c.symbol === token);
            if (comp) {
                steps.push({ type: 'comparison', value: comp });
            }
        }
        else if (token === ',') {
            steps.push({ type: 'separator', value: ',' });
        }
        else if (token === '(') {
            steps.push({ type: 'parenthesis', value: '(' });
        }
        else if (token === ')') {
            steps.push({ type: 'parenthesis', value: ')' });
        }
        else if (/^\d+\.?\d*$/.test(token)) {
            steps.push({ type: 'constant', value: token });
        }
    }

    return steps;
}

export function validateFormula(steps: FormulaStep[]): ValidationResult {
    const result: ValidationResult = {
        isValid: true,
        isComplete: false,
        errors: [],
        warnings: [],
        canSave: false
    };

    if (!steps || steps.length === 0) {
        result.isComplete = false;
        result.canSave = false;
        return result;
    }

    let parenBalance = 0;
    const functionStack: { index: number, hasArgs: boolean, name?: string, isParenOnly?: boolean }[] = [];

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const prevStep = i > 0 ? steps[i - 1] : null;

        switch (step.type) {
            case 'function':
                parenBalance++;
                functionStack.push({ index: i, hasArgs: false, name: step.value?.name || step.value?.id });
                break;

            case 'parenthesis':
                if (step.value === '(') {
                    parenBalance++;
                    functionStack.push({ index: i, hasArgs: false, isParenOnly: true });
                } else if (step.value === ')') {
                    parenBalance--;

                    if (parenBalance < 0) {
                        result.isValid = false;
                        result.errors.push('Paréntesis de cierre sin abrir');
                    }

                    if (functionStack.length > 0) {
                        const context = functionStack.pop();
                        if (context && !context.isParenOnly && !context.hasArgs) {
                            result.isValid = false;
                            result.errors.push(`Función ${context.name || ''} sin argumentos`);
                        }
                    }
                }
                break;

            case 'variable':
            case 'advance':
            case 'constant':
            case 'goal_variable':
            case 'goal_indicator':
            case 'baseline':
                if (functionStack.length > 0) {
                    functionStack[functionStack.length - 1].hasArgs = true;
                }
                break;

            case 'operator':
            case 'comparison':
                if (prevStep && (prevStep.type === 'operator' || prevStep.type === 'comparison')) {
                    result.isValid = false;
                    result.errors.push('Operadores consecutivos no permitidos');
                }
                if (!prevStep) {
                    result.isValid = false;
                    result.errors.push('La fórmula no puede iniciar con un operador');
                }
                if (prevStep && (prevStep.type === 'function' || (prevStep.type === 'parenthesis' && prevStep.value === '('))) {
                    result.isValid = false;
                    result.errors.push('Operador no puede seguir a paréntesis de apertura');
                }
                break;

            case 'separator':
                if (functionStack.length === 0 || functionStack.every(f => f.isParenOnly)) {
                    result.warnings.push('Separador "," fuera de contexto de función');
                }
                if (prevStep && prevStep.type === 'separator') {
                    result.isValid = false;
                    result.errors.push('Separadores consecutivos no permitidos');
                }
                break;
        }
    }

    if (parenBalance > 0) {
        result.isValid = false;
        result.errors.push(`${parenBalance} paréntesis sin cerrar`);
    }

    const lastStep = steps[steps.length - 1];
    const validEndings = ['variable', 'advance', 'constant', 'goal_variable', 'goal_indicator', 'baseline'];
    const isValidEnding = validEndings.includes(lastStep.type) ||
        (lastStep.type === 'parenthesis' && lastStep.value === ')');

    if (!isValidEnding) {
        result.isComplete = false;
        if (lastStep.type === 'operator') {
            result.warnings.push('Fórmula incompleta: falta operando después del operador');
        } else if (lastStep.type === 'function' || (lastStep.type === 'parenthesis' && lastStep.value === '(')) {
            result.warnings.push('Fórmula incompleta: paréntesis/función sin contenido');
        } else if (lastStep.type === 'separator') {
            result.warnings.push('Fórmula incompleta: falta argumento después del separador');
        }
    } else {
        result.isComplete = true;
    }

    result.canSave = result.isValid && result.isComplete;
    return result;
}

export function getFormulaStatusMessage(validation: ValidationResult, stepCount: number) {
    if (stepCount === 0) {
        return { message: 'Comience agregando una variable o función', type: 'info' as const };
    }
    if (!validation.isValid && validation.errors.length > 0) {
        return { message: validation.errors[0], type: 'error' as const };
    }
    if (!validation.isComplete && validation.warnings.length > 0) {
        return { message: validation.warnings[0], type: 'warning' as const };
    }
    if (validation.canSave) {
        return { message: `Fórmula válida (${stepCount} elementos)`, type: 'success' as const };
    }
    return { message: `${stepCount} elementos`, type: 'info' as const };
}


/**
 * Build AST from formula steps, including sub-formulas for variables
 */
export function buildAST(steps: FormulaStep[], expandVariables = false) {
    // 1. Tokenize - keep original variable data for sub-formula extraction
    const tokens = steps.map(step => {
        switch (step.type) {
            case 'variable':
                // Include the full variable data so we can extract sub-formula
                return {
                    type: 'ref',
                    value: step.value.id,
                    variableData: step.value // Keep full variable data with formula
                };
            case 'advance':
                return { type: 'ref_advance', value: step.value };
            case 'constant':
                return { type: 'const', value: parseFloat(step.value) };
            case 'goal_variable':
                return { type: 'goal_var', value: step.value.idMeta };
            case 'goal_indicator':
                return { type: 'goal_ind', value: step.value.idMeta };
            case 'baseline':
                return { type: 'baseline', value: 'LINEA_BASE' };
            case 'operator':
                return { type: 'op', value: step.value.symbol };
            case 'comparison':
                return { type: 'comp', value: step.value.id };
            case 'function':
                return { type: 'func', value: step.value.id };
            case 'parenthesis':
                return { type: 'paren', value: step.value };
            case 'separator':
                return { type: 'sep', value: ',' };
            default:
                return null;
        }
    }).filter(t => t !== null);

    // 2. Recursive Descent Parser
    let pos = 0;

    function peek() {
        return tokens[pos];
    }

    function consume() {
        return tokens[pos++];
    }

    // Expression -> Comparison
    function parseExpression(): any {
        return parseComparison();
    }

    // Comparison -> Additive { (==|!=|>|<|>=|<=) Additive }
    function parseComparison() {
        let left: any = parseAdditive();

        while (peek() && peek()!.type === 'comp') {
            const op = consume()!.value;
            const right = parseAdditive();
            left = { kind: 'binary', op, left, right };
        }

        return left;
    }

    // Additive -> Multiplicative { (+|-) Multiplicative }
    function parseAdditive() {
        let left: any = parseMultiplicative();

        while (peek() && peek()!.type === 'op' && (peek()!.value === '+' || peek()!.value === '-')) {
            const op = consume()!.value;
            const right = parseMultiplicative();
            left = { kind: 'binary', op, left, right };
        }

        return left;
    }

    // Multiplicative -> Primary { (*|/) Primary }
    function parseMultiplicative() {
        let left: any = parsePrimary();

        while (peek() && peek()!.type === 'op' && (peek()!.value === '*' || peek()!.value === '/')) {
            const op = consume()!.value;
            const right = parsePrimary();
            left = { kind: 'binary', op, left, right };
        }

        return left;
    }

    // Primary -> Literal | Variable | FunctionCall | ( Expression )
    function parsePrimary(): any {
        const token = peek();

        if (!token) {
            return { kind: 'error', message: 'Unexpected end of formula' };
        }

        // Handle constants, goal references, and baseline
        if (token.type === 'const' || token.type === 'goal_var' || token.type === 'goal_ind' || token.type === 'baseline') {
            consume();
            return { kind: token.type, value: token.value };
        }

        // Handle advance references
        if (token.type === 'ref_advance') {
            consume();
            return { kind: 'ref_advance', value: token.value };
        }

        // Handle variable references - include sub-formula AST if available
        if (token.type === 'ref') {
            consume();
            const node: any = { kind: 'ref', value: token.value };

            // If the variable has a formula, recursively build its AST
            if (token.variableData && token.variableData.formula && token.variableData.formula.length > 0) {
                node.subFormula = buildAST(token.variableData.formula, expandVariables);
            }

            return node;
        }

        // Handle parentheses
        if (token.type === 'paren' && token.value === '(') {
            consume();
            const expr = parseExpression();
            if (peek() && peek()!.type === 'paren' && peek()!.value === ')') {
                consume();
            }
            return expr;
        }

        // Handle function calls
        if (token.type === 'func') {
            const funcName = token.value;
            consume(); // eat function name

            // Function must be followed by opening parenthesis
            const args = [];

            // Parse arguments until we hit closing paren or end
            while (peek() && !(peek()!.type === 'paren' && peek()!.value === ')')) {
                // Skip separators between arguments
                if (peek()!.type === 'sep') {
                    consume();
                    continue;
                }

                const arg = parseExpression();
                if (arg && arg.kind !== 'error') {
                    args.push(arg);
                } else {
                    break;
                }

                if (peek() && peek()!.type === 'sep') {
                    consume();
                } else {
                    break;
                }
            }

            // Consume closing parenthesis if present
            if (peek() && peek()!.type === 'paren' && peek()!.value === ')') {
                consume();
            }

            return { kind: 'call', func: funcName, args };
        }

        // Error handling - skip unknown token
        consume();
        return { kind: 'error', value: token };
    }

    try {
        if (tokens.length === 0) return null;
        return parseExpression();
    } catch (e: any) {
        console.error("AST Parse Error", e);
        return { kind: 'error', message: e.message };
    }
}
