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

// ---- Token Processing Helpers for parseFormulaString ----

interface TokenProcessingContext {
    variables: Variable[];
    goalsVariables: GoalVariable[];
    goalsIndicators: GoalIndicator[];
    indicatorQuadrenniums: IndicatorQuadrennium[];
}

function isPlainVariableToken(token: string): boolean {
    return token.startsWith('[') && token.endsWith(']')
        && !token.startsWith('[MV:') && !token.startsWith('[MI:')
        && !token.startsWith('[QV:') && !token.startsWith('[QI:');
}

function findGoalInVariables(idMeta: string, variables: Variable[]): GoalVariable | undefined {
    for (const v of variables) {
        const g = v.goals?.find(vg => vg.idMeta === idMeta);
        if (g) return g;
    }
    return undefined;
}

function findQuadInVariables(id: string, variables: Variable[]): VariableQuadrenium | undefined {
    for (const v of variables) {
        const q = v.quadrenniums?.find(vq => vq.id === id);
        if (q) return q;
    }
    return undefined;
}

function pushVariableToken(token: string, steps: FormulaStep[], variables: Variable[]): void {
    const varId = token.slice(1, -1);
    const variable = variables.find(v => v.id === varId);
    if (variable) {
        steps.push({ type: 'variable', value: variable });
    } else {
        steps.push({ type: 'variable', value: { id: varId, name: varId, formula: [] } });
    }
}

function pushGoalVariableToken(token: string, steps: FormulaStep[], ctx: TokenProcessingContext): void {
    const idMeta = token.slice(4, -1);
    const foundGoal = ctx.goalsVariables.find(g => g.idMeta === idMeta)
        ?? findGoalInVariables(idMeta, ctx.variables);
    if (foundGoal) {
        steps.push({ type: 'goal_variable', value: { ...foundGoal, label: `Meta Var [${foundGoal.valorMeta}]` } });
    } else {
        steps.push({ type: 'goal_variable', value: { idMeta, label: `Meta Var [${idMeta}]` } as any });
    }
}

function pushGoalIndicatorToken(token: string, steps: FormulaStep[], goalsIndicators: GoalIndicator[]): void {
    const idMeta = token.slice(4, -1);
    const goal = goalsIndicators.find(g => g.idMeta === idMeta);
    if (goal) {
        steps.push({ type: 'goal_indicator', value: { ...goal, label: `Meta Ind [${goal.valorMeta}]` } });
    } else {
        steps.push({ type: 'goal_indicator', value: { idMeta, label: `Meta Ind [${idMeta}]` } as any });
    }
}

function pushQuadVariableToken(token: string, steps: FormulaStep[], variables: Variable[]): void {
    const id = token.slice(4, -1);
    const foundQuad = findQuadInVariables(id, variables);
    if (foundQuad) {
        steps.push({ type: 'quadrennium_variable', value: { ...foundQuad, label: `Cuatrenio Var [${foundQuad.startYear}-${foundQuad.endYear}]` } });
    } else {
        steps.push({ type: 'quadrennium_variable', value: { id, label: `Cuatrenio Var [${id}]` } as any });
    }
}

function pushQuadIndicatorToken(token: string, steps: FormulaStep[], indicatorQuadrenniums: IndicatorQuadrennium[]): void {
    const id = token.slice(4, -1);
    const quad = indicatorQuadrenniums.find(q => q.id === id);
    if (quad) {
        steps.push({ type: 'quadrennium_indicator', value: { ...quad, label: `Cuatrenio Ind [${quad.startYear}-${quad.endYear}]` } });
    } else {
        steps.push({ type: 'quadrennium_indicator', value: { id, label: `Cuatrenio Ind [${id}]` } as any });
    }
}

function pushFunctionToken(token: string, steps: FormulaStep[]): void {
    const funcId = token.slice(0, -1).toUpperCase();
    const func = FORMULA_FUNCTIONS.find(f => f.id === funcId);
    if (func) {
        steps.push({ type: 'function', value: func });
    }
}

function pushOperatorOrSimpleToken(token: string, steps: FormulaStep[]): void {
    const op = FORMULA_OPERATORS.find(o => o.symbol === token);
    if (op) { steps.push({ type: 'operator', value: op }); return; }
    const comp = COMPARISON_OPERATORS.find(c => c.symbol === token);
    if (comp) { steps.push({ type: 'comparison', value: comp }); return; }
    if (token === ',') { steps.push({ type: 'separator', value: ',' }); return; }
    if (token === '(' || token === ')') { steps.push({ type: 'parenthesis', value: token }); return; }
    if (/^\d+(?:\.\d+)?$/.test(token)) { steps.push({ type: 'constant', value: token }); }
}

function processFormulaToken(token: string, steps: FormulaStep[], ctx: TokenProcessingContext): void {
    if (token === '[LINEA_BASE]') {
        steps.push({ type: 'baseline', value: { id: 'LINEA_BASE', label: 'Línea Base' } });
        return;
    }
    if (isPlainVariableToken(token)) { pushVariableToken(token, steps, ctx.variables); return; }
    if (token.startsWith('[MV:') && token.endsWith(']')) { pushGoalVariableToken(token, steps, ctx); return; }
    if (token.startsWith('[MI:') && token.endsWith(']')) { pushGoalIndicatorToken(token, steps, ctx.goalsIndicators); return; }
    if (token.startsWith('[QV:') && token.endsWith(']')) { pushQuadVariableToken(token, steps, ctx.variables); return; }
    if (token.startsWith('[QI:') && token.endsWith(']')) { pushQuadIndicatorToken(token, steps, ctx.indicatorQuadrenniums); return; }
    if (/^(SUM|AVG|MAX|MIN|IF)\($/i.test(token)) { pushFunctionToken(token, steps); return; }
    pushOperatorOrSimpleToken(token, steps);
}

/**
 * Parse a stored formula string back into editor steps
 */
export function parseFormulaString(
    formulaString: string,
    variables: Variable[] = [],
    goalsVariables: GoalVariable[] = [],
    goalsIndicators: GoalIndicator[] = [],
    variableQuadrenniums: Map<string, VariableQuadrenium[]> = new Map(),
    indicatorQuadrenniums: IndicatorQuadrennium[] = []
): FormulaStep[] {
    if (!formulaString || typeof formulaString !== 'string') {
        return [];
    }

    const steps: FormulaStep[] = [];
    const bracketBaseline = /\[LINEA_BASE\]/;
    const bracketPrefixed = /\[(?:MV|MI|QV|QI):[^\]]+\]/;
    const bracketGeneral = /\[[^\]]+\]/;
    const funcCall = /(?:SUM|AVG|MAX|MIN|IF)\(/;
    const operators = /[+\-*/(),≠≥≤=><]/;
    const numbers = /\d+(?:\.\d+)?/;
    const tokenRegex = new RegExp(
        `(${[bracketBaseline, bracketPrefixed, bracketGeneral, funcCall, operators, numbers].map(r => r.source).join('|')})`, 'g'
    );
    const ctx: TokenProcessingContext = { variables, goalsVariables, goalsIndicators, indicatorQuadrenniums };

    let match;
    while ((match = tokenRegex.exec(formulaString)) !== null) {
        const token = match[0].trim();
        if (token) processFormulaToken(token, steps, ctx);
    }

    return steps;
}

// ---- Validation Helpers ----

interface FunctionStackItem {
    index: number;
    hasArgs: boolean;
    name?: string;
    isParenOnly?: boolean;
}

interface FormulaValidationContext {
    parenBalance: number;
    functionStack: FunctionStackItem[];
}

function validateFnStep(step: FormulaStep, index: number, ctx: FormulaValidationContext): void {
    ctx.parenBalance++;
    ctx.functionStack.push({ index, hasArgs: false, name: step.value?.name || step.value?.id });
}

function validateCloseParenthesis(ctx: FormulaValidationContext, result: ValidationResult): void {
    ctx.parenBalance--;
    if (ctx.parenBalance < 0) {
        result.isValid = false;
        result.errors.push('Paréntesis de cierre sin abrir');
    }
    if (ctx.functionStack.length === 0) return;
    const context = ctx.functionStack.pop();
    if (context && !context.isParenOnly && !context.hasArgs) {
        result.isValid = false;
        result.errors.push(`Función ${context.name || ''} sin argumentos`);
    }
}

function validateParenStep(step: FormulaStep, index: number, ctx: FormulaValidationContext, result: ValidationResult): void {
    if (step.value === '(') {
        ctx.parenBalance++;
        ctx.functionStack.push({ index, hasArgs: false, isParenOnly: true });
    } else {
        validateCloseParenthesis(ctx, result);
    }
}

function validateOpStep(step: FormulaStep, prevStep: FormulaStep | null, result: ValidationResult): void {
    if (prevStep && (prevStep.type === 'operator' || prevStep.type === 'comparison')) {
        result.isValid = false;
        result.errors.push('Operadores consecutivos no permitidos');
    }
    const isUnary = step.value.symbol === '-' || step.value.symbol === '+';
    if (!prevStep && !isUnary) {
        result.isValid = false;
        result.errors.push('La fórmula no puede iniciar con un operador (salvo signo + o -)');
    }
    const isPrevOpening = prevStep && (prevStep.type === 'function' || (prevStep.type === 'parenthesis' && prevStep.value === '('));
    if (isPrevOpening && !isUnary) {
        result.isValid = false;
        result.errors.push('Operador no puede seguir a paréntesis de apertura (salvo signo + o -)');
    }
}

function validateSepStep(prevStep: FormulaStep | null, functionStack: FunctionStackItem[], result: ValidationResult): void {
    if (functionStack.every(f => f.isParenOnly)) {
        result.warnings.push('Separador "," fuera de contexto de función');
    }
    if (prevStep?.type === 'separator') {
        result.isValid = false;
        result.errors.push('Separadores consecutivos no permitidos');
    }
}

const VALUE_STEP_TYPES = new Set(['variable', 'advance', 'constant', 'goal_variable', 'goal_indicator', 'quadrennium_variable', 'quadrennium_indicator', 'baseline']);

function assignEndingWarning(lastStep: FormulaStep, result: ValidationResult): void {
    if (lastStep.type === 'operator') {
        result.warnings.push('Fórmula incompleta: falta operando después del operador');
    } else if (lastStep.type === 'function' || (lastStep.type === 'parenthesis' && lastStep.value === '(')) {
        result.warnings.push('Fórmula incompleta: paréntesis/función sin contenido');
    } else if (lastStep.type === 'separator') {
        result.warnings.push('Fórmula incompleta: falta argumento después del separador');
    }
}

function validateFormulaEnding(steps: FormulaStep[], parenBalance: number, result: ValidationResult): void {
    if (parenBalance > 0) {
        result.isValid = false;
        result.errors.push(`${parenBalance} paréntesis sin cerrar`);
    }
    const lastStep = steps.at(-1)!;
    const VALID_ENDINGS = ['variable', 'advance', 'constant', 'goal_variable', 'goal_indicator', 'quadrennium_variable', 'quadrennium_indicator', 'baseline'];
    const isValidEnding = VALID_ENDINGS.includes(lastStep.type) ||
        (lastStep.type === 'parenthesis' && lastStep.value === ')');
    if (isValidEnding) {
        result.isComplete = true;
        return;
    }
    result.isComplete = false;
    assignEndingWarning(lastStep, result);
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

    const ctx: FormulaValidationContext = { parenBalance: 0, functionStack: [] };

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const prevStep = steps[i - 1] ?? null;

        if (step.type === 'function') {
            validateFnStep(step, i, ctx);
        } else if (step.type === 'parenthesis') {
            validateParenStep(step, i, ctx, result);
        } else if (VALUE_STEP_TYPES.has(step.type) && ctx.functionStack.length > 0) {
            ctx.functionStack.at(-1)!.hasArgs = true;
        } else if (step.type === 'operator' || step.type === 'comparison') {
            validateOpStep(step, prevStep, result);
        } else if (step.type === 'separator') {
            validateSepStep(prevStep, ctx.functionStack, result);
        }
    }

    validateFormulaEnding(steps, ctx.parenBalance, result);
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


// ---- AST Parser ----

function tokenizeStep(step: FormulaStep): any {
    switch (step.type) {
        case 'variable':
            return { type: 'ref', value: step.value.id, variableData: step.value };
        case 'advance':
            return { type: 'ref_advance', value: step.value };
        case 'constant':
            return { type: 'const', value: Number.parseFloat(step.value) };
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
}

const LITERAL_TOKEN_TYPES = new Set(['const', 'goal_var', 'goal_ind', 'quad_var', 'quad_ind', 'baseline']);

class FormulaASTParser {
    private readonly tokens: any[];
    private pos = 0;
    private readonly expandVariables: boolean;

    constructor(tokens: any[], expandVariables: boolean) {
        this.tokens = tokens;
        this.expandVariables = expandVariables;
    }

    private peek() { return this.tokens[this.pos]; }
    private consume() { return this.tokens[this.pos++]; }
    private peekType(): string | undefined { return this.peek()?.type; }

    private isCloseParen(): boolean {
        return this.peekType() === 'paren' && this.peek()?.value === ')';
    }

    parse(): any {
        if (this.tokens.length === 0) return null;
        return this.parseExpression();
    }

    private parseExpression(): any {
        return this.parseComparison();
    }

    private parseComparison(): any {
        let left: any = this.parseAdditive();
        while (this.peekType() === 'comp') {
            const op = this.consume().value;
            const right = this.parseAdditive();
            left = { kind: 'binary', op, left, right };
        }
        return left;
    }

    private parseAdditive(): any {
        let left: any = this.parseMultiplicative();
        while (this.peekType() === 'op' && (this.peek().value === '+' || this.peek().value === '-')) {
            const op = this.consume().value;
            const right = this.parseMultiplicative();
            left = { kind: 'binary', op, left, right };
        }
        return left;
    }

    private parseMultiplicative(): any {
        let left: any = this.parsePrimary();
        while (this.peekType() === 'op' && (this.peek().value === '*' || this.peek().value === '/')) {
            const op = this.consume().value;
            const right = this.parsePrimary();
            left = { kind: 'binary', op, left, right };
        }
        return left;
    }

    private parsePrimary(): any {
        const token = this.peek();
        if (!token) return { kind: 'error', message: 'Unexpected end of formula' };

        if (LITERAL_TOKEN_TYPES.has(token.type)) {
            this.consume();
            return { kind: token.type, value: token.value };
        }
        if (token.type === 'ref_advance') {
            this.consume();
            return { kind: 'ref_advance', value: token.value };
        }
        if (token.type === 'ref') return this.parseVariableRef(token);
        if (token.type === 'paren' && token.value === '(') return this.parseParenExpr();
        if (token.type === 'func') return this.parseFunctionCall();

        this.consume();
        return { kind: 'error', value: token };
    }

    private parseVariableRef(token: any): any {
        this.consume();
        const node: any = { kind: 'ref', value: token.value };
        if (token.variableData?.formula && token.variableData.formula.length > 0) {
            node.subFormula = buildAST(token.variableData.formula, this.expandVariables);
        }
        return node;
    }

    private parseParenExpr(): any {
        this.consume();
        const expr = this.parseExpression();
        if (this.isCloseParen()) this.consume();
        return expr;
    }

    private parseFunctionCall(): any {
        const funcName = this.peek().value;
        this.consume();
        const args = this.parseFunctionArgs();
        if (this.isCloseParen()) this.consume();
        return { kind: 'call', func: funcName, args };
    }

    private parseFunctionArgs(): any[] {
        const args: any[] = [];
        while (this.peekType() != null && !this.isCloseParen()) {
            if (this.peekType() === 'sep') { this.consume(); continue; }
            const arg = this.parseExpression();
            const isValidArg = arg && arg.kind !== 'error';
            if (!isValidArg) break;
            args.push(arg);
            if (this.peekType() !== 'sep') break;
            this.consume();
        }
        return args;
    }
}

/**
 * Build AST from formula steps, including sub-formulas for variables
 */
export function buildAST(steps: FormulaStep[], expandVariables = false) {
    const tokens = steps.map(tokenizeStep).filter(t => t !== null);
    try {
        return new FormulaASTParser(tokens, expandVariables).parse();
    } catch (e: any) {
        console.error("AST Parse Error", e);
        return { kind: 'error', message: e.message };
    }
}

// ---- convertAstToSteps Helpers ----

interface AstConvertContext {
    variables: Variable[];
    goalsVariables: GoalVariable[];
    goalsIndicators: GoalIndicator[];
    variableQuadrenniums: VariableQuadrenium[];
    indicatorQuadrenniums: IndicatorQuadrennium[];
}

function getOpPrecedence(op: string): number {
    if (['*', '/'].includes(op)) return 2;
    if (['+', '-'].includes(op)) return 1;
    return 0;
}

function pushOperatorOrComparisonStep(opSymbol: string, steps: FormulaStep[]): void {
    const COMP_OPS = ['=', '!=', '>', '<', '>=', '<='];
    const isComp = COMP_OPS.includes(opSymbol);
    const op = isComp
        ? COMPARISON_OPERATORS.find(o => o.symbol === opSymbol)
        : FORMULA_OPERATORS.find(o => o.symbol === opSymbol);
    if (op) {
        steps.push({ type: isComp ? 'comparison' : 'operator', value: op });
    }
}

function convertBinaryNode(node: any, ctx: AstConvertContext): FormulaStep[] {
    const steps: FormulaStep[] = [];
    const currentPrec = getOpPrecedence(node.op);

    const needLeftWrap = node.left.kind === 'binary' && getOpPrecedence(node.left.op) < currentPrec;
    if (needLeftWrap) steps.push({ type: 'parenthesis', value: '(' });
    steps.push(...convertAstToSteps(node.left, ctx.variables, ctx.goalsVariables, ctx.goalsIndicators, ctx.variableQuadrenniums, ctx.indicatorQuadrenniums));
    if (needLeftWrap) steps.push({ type: 'parenthesis', value: ')' });

    pushOperatorOrComparisonStep(node.op, steps);

    const needRightWrap = node.right.kind === 'binary' && getOpPrecedence(node.right.op) < currentPrec;
    if (needRightWrap) steps.push({ type: 'parenthesis', value: '(' });
    steps.push(...convertAstToSteps(node.right, ctx.variables, ctx.goalsVariables, ctx.goalsIndicators, ctx.variableQuadrenniums, ctx.indicatorQuadrenniums));
    if (needRightWrap) steps.push({ type: 'parenthesis', value: ')' });

    return steps;
}

function convertCallNode(node: any, ctx: AstConvertContext): FormulaStep[] {
    const steps: FormulaStep[] = [];
    const func = FORMULA_FUNCTIONS.find(f => f.id === node.func);
    if (!func) return steps;

    steps.push({ type: 'function', value: func });
    node.args.forEach((arg: any, idx: number) => {
        if (idx > 0) steps.push({ type: 'separator', value: ',' });
        steps.push(...convertAstToSteps(arg, ctx.variables, ctx.goalsVariables, ctx.goalsIndicators, ctx.variableQuadrenniums, ctx.indicatorQuadrenniums));
    });
    steps.push({ type: 'parenthesis', value: ')' });
    return steps;
}

function convertRefNode(node: any, variables: Variable[]): FormulaStep {
    const v = variables.find(x => x.id === node.value);
    return v
        ? { type: 'variable', value: v }
        : { type: 'variable', value: { id: node.value, name: 'Desconocido', formula: [] } as any };
}

function convertGoalVarNode(node: any, goalsVariables: GoalVariable[], variables: Variable[]): FormulaStep {
    let gVar = goalsVariables.find(x => x.idMeta === node.value);
    if (!gVar) {
        for (const variable of variables) {
            const found = variable.goals?.find(g => g.idMeta === node.value);
            if (found) { gVar = found; break; }
        }
    }
    if (gVar) {
        return { type: 'goal_variable', value: { ...gVar, label: `Meta Var [${gVar.valorMeta}]` } };
    }
    return { type: 'goal_variable', value: { idMeta: node.value, valorMeta: '?', label: `Meta [${node.value}]` } };
}

function convertGoalIndNode(node: any, goalsIndicators: GoalIndicator[]): FormulaStep {
    const gInd = goalsIndicators.find(x => x.idMeta === node.value);
    if (gInd) {
        return { type: 'goal_indicator', value: { ...gInd, label: `Meta Ind [${gInd.valorMeta}]` } };
    }
    return { type: 'goal_indicator', value: { idMeta: node.value, valorMeta: '?', label: `Meta Ind [${node.value}]` } };
}

function convertQuadVarNode(node: any, variableQuadrenniums: VariableQuadrenium[], variables: Variable[]): FormulaStep {
    let foundQ = variableQuadrenniums.find(x => x.id === node.value);
    if (!foundQ) {
        for (const variable of variables) {
            const found = variable.quadrenniums?.find(q => q.id === node.value);
            if (found) { foundQ = found; break; }
        }
    }
    if (foundQ) {
        return { type: 'quadrennium_variable', value: { ...foundQ, label: `Cuatrenio Var [${foundQ.startYear}-${foundQ.endYear}]` } };
    }
    return { type: 'quadrennium_variable', value: { id: node.value, startYear: 0, endYear: 0, value: '?', label: `Cuatrenio Var [${node.value}]` } };
}

function convertQuadIndNode(node: any, indicatorQuadrenniums: IndicatorQuadrennium[]): FormulaStep {
    const qInd = indicatorQuadrenniums.find(x => x.id === node.value);
    if (qInd) {
        return { type: 'quadrennium_indicator', value: { ...qInd, label: `Cuatrenio Ind [${qInd.startYear}-${qInd.endYear}]` } };
    }
    return { type: 'quadrennium_indicator', value: { id: node.value, startYear: 0, endYear: 0, value: '?', label: `Cuatrenio Ind [${node.value}]` } };
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
    if (!node) return [];

    const ctx: AstConvertContext = { variables, goalsVariables, goalsIndicators, variableQuadrenniums, indicatorQuadrenniums };

    switch (node.kind) {
        case 'binary': return convertBinaryNode(node, ctx);
        case 'call': return convertCallNode(node, ctx);
        case 'ref': return [convertRefNode(node, variables)];
        case 'const': return [{ type: 'constant', value: node.value.toString() }];
        case 'goal_var': return [convertGoalVarNode(node, goalsVariables, variables)];
        case 'goal_ind': return [convertGoalIndNode(node, goalsIndicators)];
        case 'quad_var': return [convertQuadVarNode(node, variableQuadrenniums, variables)];
        case 'quad_ind': return [convertQuadIndNode(node, indicatorQuadrenniums)];
        case 'baseline': return [{ type: 'baseline', value: { id: 'LINEA_BASE', label: 'Línea Base' } }];
        case 'ref_advance': return [{ type: 'advance', value: node.value }];
        default: return [];
    }
}

export interface FormulaValidationResponse {
    variables: any[];
    indicator: {
        baseline?: string;
        goals: any[];
        quadrenniums: any[];
        formulas: any[];
    };
}
