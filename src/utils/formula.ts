export interface FormulaStep {
    type: 'variable' | 'goal_variable' | 'goal_indicator' | 'quadrennium_variable' | 'quadrennium_indicator' | 'baseline' | 'function' | 'operator' | 'comparison' | 'constant' | 'separator' | 'parenthesis' | 'advance';
    value: any;
}

export interface Variable {
    id: string;
    code?: string;
    name: string;
    description?: string;
    formula?: FormulaStep[];
    goals?: GoalVariable[];
    quadrenniums?: VariableQuadrenium[];
}

export interface GoalVariable {
    idMeta: string;
    valorMeta: string;
    year?: number;
    label?: string;
}

export interface VariableQuadrenium {
    id: string;
    startYear: number;
    endYear: number;
    value: string;
    label?: string;
}

export interface GoalIndicator {
    idMeta: string;
    valorMeta: string;
    year?: number;
    label?: string;
}

export interface IndicatorQuadrennium {
    id: string;
    startYear: number;
    endYear: number;
    value: string;
    label?: string;
}

export interface VariableAdvance {
    id: string;
    year: number;
    months: number[]; // Array of month numbers (1-12)
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
    goalsIndicators: GoalIndicator[] = [],
    variableQuadrenniums: Map<string, VariableQuadrenium[]> = new Map(), // Not strictly used for lookup here unless flat list passed
    indicatorQuadrenniums: IndicatorQuadrennium[] = []
): FormulaStep[] {
    if (!formulaString || typeof formulaString !== 'string') {
        return [];
    }

    const steps: FormulaStep[] = [];
    const tokenRegex = /(\[LINEA_BASE\]|\[MV:[^\]]+\]|\[MI:[^\]]+\]|\[QV:[^\]]+\]|\[QI:[^\]]+\]|\[[^\]]+\]|SUM\(|AVG\(|MAX\(|MIN\(|IF\(|[+\-*/(),]|≠|≥|≤|[=><]|\d+\.?\d*)/g;

    let match;
    while ((match = tokenRegex.exec(formulaString)) !== null) {
        const token = match[0].trim();
        if (!token) continue;

        if (token === '[LINEA_BASE]') {
            steps.push({ type: 'baseline', value: { id: 'LINEA_BASE', label: 'Línea Base' } });
        }
        else if (token.startsWith('[') && token.endsWith(']') && !token.startsWith('[MV:') && !token.startsWith('[MI:') && !token.startsWith('[QV:') && !token.startsWith('[QI:')) {
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
            // Also check inside variables if goalsVariables param is empty/flat
            let foundGoal = goal;
            if (!foundGoal) {
                for (const v of variables) {
                    const g = v.goals?.find(vg => vg.idMeta === idMeta);
                    if (g) { foundGoal = g; break; }
                }
            }

            if (foundGoal) {
                const label = `Meta Var [${foundGoal.valorMeta}]`;
                steps.push({ type: 'goal_variable', value: { ...foundGoal, label } });
            } else {
                steps.push({ type: 'goal_variable', value: { idMeta, label: `Meta Var [${idMeta}]` } as any });
            }
        }
        else if (token.startsWith('[MI:') && token.endsWith(']')) {
            const idMeta = token.slice(4, -1);
            const goal = goalsIndicators.find(g => g.idMeta === idMeta);
            if (goal) {
                const label = `Meta Ind [${goal.valorMeta}]`;
                steps.push({ type: 'goal_indicator', value: { ...goal, label } });
            } else {
                steps.push({ type: 'goal_indicator', value: { idMeta, label: `Meta Ind [${idMeta}]` } as any });
            }
        }
        else if (token.startsWith('[QV:') && token.endsWith(']')) {
            const id = token.slice(4, -1);
            // Search in variables
            let foundQuad: VariableQuadrenium | undefined;
            for (const v of variables) {
                const q = v.quadrenniums?.find(vq => vq.id === id);
                if (q) { foundQuad = q; break; }
            }

            if (foundQuad) {
                const label = `Cuatrenio Var [${foundQuad.startYear}-${foundQuad.endYear}]`;
                steps.push({ type: 'quadrennium_variable', value: { ...foundQuad, label } });
            } else {
                steps.push({ type: 'quadrennium_variable', value: { id, label: `Cuatrenio Var [${id}]` } as any });
            }
        }
        else if (token.startsWith('[QI:') && token.endsWith(']')) {
            const id = token.slice(4, -1);
            const quad = indicatorQuadrenniums.find(q => q.id === id);

            if (quad) {
                const label = `Cuatrenio Ind [${quad.startYear}-${quad.endYear}]`;
                steps.push({ type: 'quadrennium_indicator', value: { ...quad, label } });
            } else {
                steps.push({ type: 'quadrennium_indicator', value: { id, label: `Cuatrenio Ind [${id}]` } as any });
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
            case 'quadrennium_variable':
            case 'quadrennium_indicator':
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

                const isUnary = step.value.symbol === '-' || step.value.symbol === '+';

                if (!prevStep) {
                    if (!isUnary) {
                        result.isValid = false;
                        result.errors.push('La fórmula no puede iniciar con un operador (salvo signo + o -)');
                    }
                }
                if (prevStep && (prevStep.type === 'function' || (prevStep.type === 'parenthesis' && prevStep.value === '('))) {
                    if (!isUnary) {
                        result.isValid = false;
                        result.errors.push('Operador no puede seguir a paréntesis de apertura (salvo signo + o -)');
                    }
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
    const validEndings = ['variable', 'advance', 'constant', 'goal_variable', 'goal_indicator', 'quadrennium_variable', 'quadrennium_indicator', 'baseline'];
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
            case 'quadrennium_variable':
                return { type: 'quad_var', value: step.value.id };
            case 'quadrennium_indicator':
                return { type: 'quad_ind', value: step.value.id };
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

        // Handle constants, goal/quad references, and baseline
        if (token.type === 'const' || token.type === 'goal_var' || token.type === 'goal_ind' || token.type === 'quad_var' || token.type === 'quad_ind' || token.type === 'baseline') {
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

/**
 * Convert an AST structure back to Formula Steps (for editor loading)
 */
export function convertAstToSteps(
    node: any,
    variables: Variable[],
    goalsVariables: GoalVariable[],
    goalsIndicators: GoalIndicator[],
    variableQuadrenniums: VariableQuadrenium[],
    indicatorQuadrenniums: IndicatorQuadrennium[]
): FormulaStep[] {
    const steps: FormulaStep[] = [];
    if (!node) return steps;

    const getPrecedence = (op: string) => {
        if (['*', '/'].includes(op)) return 2;
        if (['+', '-'].includes(op)) return 1;
        return 0;
    };

    switch (node.kind) {
        case 'binary':
            const currentPrec = getPrecedence(node.op);

            // Left Child
            let leftWrapped = false;
            if (node.left.kind === 'binary' && getPrecedence(node.left.op) < currentPrec) {
                steps.push({ type: 'parenthesis', value: '(' });
                leftWrapped = true;
            }
            steps.push(...convertAstToSteps(node.left, variables, goalsVariables, goalsIndicators, variableQuadrenniums, indicatorQuadrenniums));
            if (leftWrapped) steps.push({ type: 'parenthesis', value: ')' });

            // Operator
            const op = FORMULA_OPERATORS.find(o => o.symbol === node.op) || COMPARISON_OPERATORS.find(o => o.symbol === node.op);
            if (op) {
                steps.push({ type: 'operator', value: op }); // Or comparison, but type check is loose here. If separate type needed:
                // Actually operator step type covers both usually in simple logic or split. Editor uses 'operator' and 'comparison'
                // Let's distinguish
                const isComp = ['=', '!=', '>', '<', '>=', '<='].includes(node.op);
                if (isComp) {
                    steps[steps.length - 1].type = 'comparison';
                }
            }

            // Right Child
            let rightWrapped = false;
            // For right child, if same precedence (e.g. -), we might need parens if non-associative?
            // A - (B - C). right is binary(-). prec is same. 
            // Simple rule: wrap right binary if precedence <= current (for non-associative like - /).
            // For + *, it doesn't matter. But safe to wrap if < current.
            // Let's implement strict wrapping if lower precedence. 
            if (node.right.kind === 'binary' && getPrecedence(node.right.op) < currentPrec) {
                steps.push({ type: 'parenthesis', value: '(' });
                rightWrapped = true;
            }
            steps.push(...convertAstToSteps(node.right, variables, goalsVariables, goalsIndicators, variableQuadrenniums, indicatorQuadrenniums));
            if (rightWrapped) steps.push({ type: 'parenthesis', value: ')' });

            break;

        case 'call':
            const func = FORMULA_FUNCTIONS.find(f => f.id === node.func);
            if (func) {
                steps.push({ type: 'function', value: func });
                node.args.forEach((arg: any, idx: number) => {
                    if (idx > 0) steps.push({ type: 'separator', value: ',' });
                    steps.push(...convertAstToSteps(arg, variables, goalsVariables, goalsIndicators, variableQuadrenniums, indicatorQuadrenniums));
                });
                steps.push({ type: 'parenthesis', value: ')' });
            }
            break;

        case 'ref':
            const v = variables.find(x => x.id === node.value);
            if (v) steps.push({ type: 'variable', value: v });
            else steps.push({ type: 'variable', value: { id: node.value, name: 'Desconocido', formula: [] } as any });
            break;

        case 'const':
            steps.push({ type: 'constant', value: node.value.toString() });
            break;

        case 'goal_var':
            let gVar = goalsVariables.find(x => x.idMeta === node.value);
            // Search inside variables if not found flat
            if (!gVar) {
                for (const variable of variables) {
                    const found = variable.goals?.find(g => g.idMeta === node.value);
                    if (found) { gVar = found; break; }
                }
            }
            if (gVar) {
                const label = `Meta Var [${gVar.valorMeta}]`;
                steps.push({ type: 'goal_variable', value: { ...gVar, label } });
            } else {
                steps.push({ type: 'goal_variable', value: { idMeta: node.value, valorMeta: '?', label: `Meta [${node.value}]` } });
            }
            break;

        case 'goal_ind':
            const gInd = goalsIndicators.find(x => x.idMeta === node.value);
            if (gInd) {
                const label = `Meta Ind [${gInd.valorMeta}]`;
                steps.push({ type: 'goal_indicator', value: { ...gInd, label } });
            } else {
                steps.push({ type: 'goal_indicator', value: { idMeta: node.value, valorMeta: '?', label: `Meta Ind [${node.value}]` } });
            }
            break;

        case 'quad_var':
            const qVar = variableQuadrenniums.find(x => x.id === node.value);
            // Search inside variables if not found flat
            let foundQ = qVar;
            if (!foundQ) {
                for (const variable of variables) {
                    const found = variable.quadrenniums?.find(q => q.id === node.value);
                    if (found) { foundQ = found; break; }
                }
            }

            if (foundQ) {
                const label = `Cuatrenio Var [${foundQ.startYear}-${foundQ.endYear}]`;
                steps.push({ type: 'quadrennium_variable', value: { ...foundQ, label } });
            } else {
                steps.push({ type: 'quadrennium_variable', value: { id: node.value, startYear: 0, endYear: 0, value: '?', label: `Cuatrenio Var [${node.value}]` } });
            }
            break;

        case 'quad_ind':
            const qInd = indicatorQuadrenniums.find(x => x.id === node.value);
            if (qInd) {
                const label = `Cuatrenio Ind [${qInd.startYear}-${qInd.endYear}]`;
                steps.push({ type: 'quadrennium_indicator', value: { ...qInd, label } });
            } else {
                steps.push({ type: 'quadrennium_indicator', value: { id: node.value, startYear: 0, endYear: 0, value: '?', label: `Cuatrenio Ind [${node.value}]` } });
            }
            break;

        case 'baseline':
            steps.push({ type: 'baseline', value: { id: 'LINEA_BASE', label: 'Línea Base' } });
            break;

        case 'ref_advance':
            steps.push({ type: 'advance', value: node.value });
            break;
    }

    return steps;
}

export interface FormulaValidationResponse {
    variables: any[];
    indicator: {
        goals: any[];
        quadrenniums: any[];
        formulas: any[];
    };
}
