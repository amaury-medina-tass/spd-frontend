import {
  FORMULA_FUNCTIONS,
  FORMULA_OPERATORS,
  COMPARISON_OPERATORS,
  parseFormulaString,
  validateFormula,
  getFormulaStatusMessage,
  buildAST,
  convertAstToSteps,
  FormulaStep,
  Variable,
  GoalVariable,
  GoalIndicator,
  VariableQuadrenium,
  IndicatorQuadrennium,
  ValidationResult,
} from "@/utils/formula";

describe("formula constants", () => {
  it("FORMULA_FUNCTIONS should have 5 functions", () => {
    expect(FORMULA_FUNCTIONS).toHaveLength(5);
    expect(FORMULA_FUNCTIONS.map((f) => f.id)).toEqual(["SUM", "AVG", "MAX", "MIN", "IF"]);
  });

  it("FORMULA_OPERATORS should have 4 operators", () => {
    expect(FORMULA_OPERATORS).toHaveLength(4);
    expect(FORMULA_OPERATORS.map((o) => o.symbol)).toEqual(["+", "-", "*", "/"]);
  });

  it("COMPARISON_OPERATORS should have 6 operators", () => {
    expect(COMPARISON_OPERATORS).toHaveLength(6);
    const ids = COMPARISON_OPERATORS.map((c) => c.id);
    expect(ids).toContain("=");
    expect(ids).toContain("!=");
    expect(ids).toContain(">=");
    expect(ids).toContain("<=");
  });
});

describe("parseFormulaString", () => {
  const variables: Variable[] = [
    { id: "v1", name: "Var1" },
    {
      id: "v2", name: "Var2",
      goals: [{ idMeta: "mg1", valorMeta: "100", year: 2024 }],
      quadrenniums: [{ id: "q1", startYear: 2020, endYear: 2023, value: "50" }],
    },
  ];
  const goalsVariables: GoalVariable[] = [{ idMeta: "mg2", valorMeta: "200", year: 2025 }];
  const goalsIndicators: GoalIndicator[] = [{ idMeta: "mi1", valorMeta: "300" }];
  const indicatorQuadrenniums: IndicatorQuadrennium[] = [{ id: "qi1", startYear: 2020, endYear: 2023, value: "400" }];

  it("should return empty array for empty string", () => {
    expect(parseFormulaString("")).toEqual([]);
  });

  it("should return empty for null/undefined", () => {
    expect(parseFormulaString(null as any)).toEqual([]);
    expect(parseFormulaString(undefined as any)).toEqual([]);
  });

  it("should parse a simple variable reference", () => {
    const steps = parseFormulaString("[v1]", variables);
    expect(steps).toHaveLength(1);
    expect(steps[0].type).toBe("variable");
    expect(steps[0].value.id).toBe("v1");
  });

  it("should parse unknown variable reference", () => {
    const steps = parseFormulaString("[unknown]");
    expect(steps).toHaveLength(1);
    expect(steps[0].type).toBe("variable");
    expect(steps[0].value.id).toBe("unknown");
  });

  it("should parse operators", () => {
    const steps = parseFormulaString("[v1]+[v2]", variables);
    expect(steps).toHaveLength(3);
    expect(steps[1].type).toBe("operator");
    expect(steps[1].value.symbol).toBe("+");
  });

  it("should parse constants", () => {
    const steps = parseFormulaString("10.5");
    expect(steps).toHaveLength(1);
    expect(steps[0].type).toBe("constant");
    expect(steps[0].value).toBe("10.5");
  });

  it("should parse LINEA_BASE", () => {
    const steps = parseFormulaString("[LINEA_BASE]");
    expect(steps).toHaveLength(1);
    expect(steps[0].type).toBe("baseline");
  });

  it("should parse functions", () => {
    const steps = parseFormulaString("SUM([v1],[v2])", variables);
    expect(steps[0].type).toBe("function");
    expect(steps[0].value.id).toBe("SUM");
  });

  it("should parse parentheses", () => {
    const steps = parseFormulaString("([v1]+[v2])", variables);
    expect(steps[0].type).toBe("parenthesis");
    expect(steps[0].value).toBe("(");
    expect(steps[steps.length - 1].type).toBe("parenthesis");
    expect(steps[steps.length - 1].value).toBe(")");
  });

  it("should parse separator", () => {
    const steps = parseFormulaString("SUM([v1],[v2])", variables);
    const seps = steps.filter((s) => s.type === "separator");
    expect(seps.length).toBe(1);
    expect(seps[0].value).toBe(",");
  });

  it("should parse goal variable [MV:id]", () => {
    const steps = parseFormulaString("[MV:mg2]", variables, goalsVariables);
    expect(steps).toHaveLength(1);
    expect(steps[0].type).toBe("goal_variable");
  });

  it("should parse goal variable from nested goals", () => {
    const steps = parseFormulaString("[MV:mg1]", variables, []);
    expect(steps).toHaveLength(1);
    expect(steps[0].type).toBe("goal_variable");
    expect(steps[0].value.valorMeta).toBe("100");
  });

  it("should parse unknown goal variable", () => {
    const steps = parseFormulaString("[MV:unknown]");
    expect(steps).toHaveLength(1);
    expect(steps[0].type).toBe("goal_variable");
  });

  it("should parse goal indicator [MI:id]", () => {
    const steps = parseFormulaString("[MI:mi1]", [], [], goalsIndicators);
    expect(steps).toHaveLength(1);
    expect(steps[0].type).toBe("goal_indicator");
  });

  it("should parse unknown goal indicator", () => {
    const steps = parseFormulaString("[MI:unknown]");
    expect(steps).toHaveLength(1);
    expect(steps[0].type).toBe("goal_indicator");
  });

  it("should parse quadrennium variable [QV:id]", () => {
    const steps = parseFormulaString("[QV:q1]", variables);
    expect(steps).toHaveLength(1);
    expect(steps[0].type).toBe("quadrennium_variable");
    expect(steps[0].value.startYear).toBe(2020);
  });

  it("should parse unknown quadrennium variable", () => {
    const steps = parseFormulaString("[QV:unknown]");
    expect(steps).toHaveLength(1);
    expect(steps[0].type).toBe("quadrennium_variable");
  });

  it("should parse quadrennium indicator [QI:id]", () => {
    const steps = parseFormulaString("[QI:qi1]", [], [], [], new Map(), indicatorQuadrenniums);
    expect(steps).toHaveLength(1);
    expect(steps[0].type).toBe("quadrennium_indicator");
    expect(steps[0].value.startYear).toBe(2020);
  });

  it("should parse unknown quadrennium indicator", () => {
    const steps = parseFormulaString("[QI:unknown]");
    expect(steps).toHaveLength(1);
    expect(steps[0].type).toBe("quadrennium_indicator");
  });

  it("should parse comparison operators", () => {
    const steps = parseFormulaString("[v1]>[v2]", variables);
    const comps = steps.filter((s) => s.type === "comparison");
    expect(comps.length).toBe(1);
  });

  it("should parse complex formula", () => {
    const steps = parseFormulaString("SUM([v1],[v2])*10+[LINEA_BASE]", variables);
    expect(steps.length).toBeGreaterThan(5);
  });
});

describe("validateFormula", () => {
  const mkVar = (id = "v1"): FormulaStep => ({
    type: "variable",
    value: { id, name: "Test" },
  });
  const mkOp = (s = "+"): FormulaStep => ({
    type: "operator",
    value: FORMULA_OPERATORS.find((o) => o.symbol === s)!,
  });
  const mkConst = (v = "10"): FormulaStep => ({
    type: "constant",
    value: v,
  });
  const mkFunc = (id = "SUM"): FormulaStep => ({
    type: "function",
    value: FORMULA_FUNCTIONS.find((f) => f.id === id)!,
  });
  const mkParen = (v: "(" | ")"): FormulaStep => ({
    type: "parenthesis",
    value: v,
  });
  const mkSep = (): FormulaStep => ({
    type: "separator",
    value: ",",
  });
  const mkComp = (id = ">"): FormulaStep => ({
    type: "comparison",
    value: COMPARISON_OPERATORS.find((c) => c.id === id)!,
  });

  it("should return not complete for empty steps", () => {
    const result = validateFormula([]);
    expect(result.isComplete).toBe(false);
    expect(result.canSave).toBe(false);
  });

  it("should validate a simple expression: var + var", () => {
    const result = validateFormula([mkVar(), mkOp("+"), mkVar("v2")]);
    expect(result.isValid).toBe(true);
    expect(result.isComplete).toBe(true);
    expect(result.canSave).toBe(true);
  });

  it("should detect unbalanced open parens", () => {
    const result = validateFormula([mkParen("("), mkVar()]);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("1 paréntesis sin cerrar");
  });

  it("should detect closing paren without opening", () => {
    const result = validateFormula([mkVar(), mkParen(")")]);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Paréntesis de cierre sin abrir");
  });

  it("should detect consecutive operators", () => {
    const result = validateFormula([mkVar(), mkOp("+"), mkOp("*")]);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Operadores consecutivos no permitidos");
  });

  it("should allow unary minus at start", () => {
    const result = validateFormula([mkOp("-"), mkVar()]);
    expect(result.isValid).toBe(true);
  });

  it("should reject non-unary operator at start", () => {
    const result = validateFormula([mkOp("*"), mkVar()]);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("La fórmula no puede iniciar con un operador (salvo signo + o -)");
  });

  it("should detect function without arguments", () => {
    const result = validateFormula([mkFunc("SUM"), mkParen(")")]);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("sin argumentos"))).toBe(true);
  });

  it("should validate function with arguments", () => {
    const result = validateFormula([mkFunc("SUM"), mkVar(), mkSep(), mkVar("v2"), mkParen(")")]);
    expect(result.isValid).toBe(true);
    expect(result.isComplete).toBe(true);
  });

  it("should detect consecutive separators", () => {
    const result = validateFormula([mkFunc("SUM"), mkVar(), mkSep(), mkSep(), mkVar("v2"), mkParen(")")]);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Separadores consecutivos no permitidos");
  });

  it("should warn separator outside function context", () => {
    const result = validateFormula([mkVar(), mkSep(), mkVar("v2")]);
    expect(result.warnings.some((w) => w.includes("fuera de contexto"))).toBe(true);
  });

  it("should mark formula ending with operator as incomplete", () => {
    const result = validateFormula([mkVar(), mkOp("+")]);
    expect(result.isComplete).toBe(false);
    expect(result.warnings.some((w) => w.includes("incompleta"))).toBe(true);
  });

  it("should mark formula ending with separator as incomplete", () => {
    const result = validateFormula([mkFunc("SUM"), mkVar(), mkSep()]);
    expect(result.isComplete).toBe(false);
  });

  it("should accept baseline as valid ending", () => {
    const result = validateFormula([{ type: "baseline", value: { id: "LINEA_BASE" } }]);
    expect(result.isValid).toBe(true);
    expect(result.isComplete).toBe(true);
    expect(result.canSave).toBe(true);
  });

  it("should accept goal_variable as valid ending", () => {
    const result = validateFormula([{ type: "goal_variable", value: { idMeta: "g1" } }]);
    expect(result.isComplete).toBe(true);
  });

  it("should accept quadrennium_variable as valid ending", () => {
    const result = validateFormula([{ type: "quadrennium_variable", value: { id: "q1" } }]);
    expect(result.isComplete).toBe(true);
  });

  it("should reject operator after opening paren (non-unary)", () => {
    const result = validateFormula([mkParen("("), mkOp("*"), mkVar(), mkParen(")")]);
    expect(result.isValid).toBe(false);
  });

  it("should allow unary minus after opening paren", () => {
    const result = validateFormula([mkParen("("), mkOp("-"), mkVar(), mkParen(")")]);
    expect(result.isValid).toBe(true);
  });
});

describe("getFormulaStatusMessage", () => {
  it("should return info message for empty formula", () => {
    const r = getFormulaStatusMessage({ isValid: true, isComplete: false, errors: [], warnings: [], canSave: false }, 0);
    expect(r.type).toBe("info");
    expect(r.message).toContain("Comience");
  });

  it("should return error message on validation error", () => {
    const r = getFormulaStatusMessage({
      isValid: false, isComplete: false,
      errors: ["Paréntesis sin cerrar"], warnings: [], canSave: false,
    }, 3);
    expect(r.type).toBe("error");
    expect(r.message).toBe("Paréntesis sin cerrar");
  });

  it("should return warning for incomplete formula", () => {
    const r = getFormulaStatusMessage({
      isValid: true, isComplete: false,
      errors: [], warnings: ["Falta operando"], canSave: false,
    }, 2);
    expect(r.type).toBe("warning");
  });

  it("should return success for valid complete formula", () => {
    const r = getFormulaStatusMessage({
      isValid: true, isComplete: true,
      errors: [], warnings: [], canSave: true,
    }, 5);
    expect(r.type).toBe("success");
    expect(r.message).toContain("5 elementos");
  });

  it("should return info with count as fallback", () => {
    const r = getFormulaStatusMessage({
      isValid: true, isComplete: true,
      errors: [], warnings: [], canSave: false,
    }, 3);
    expect(r.type).toBe("info");
    expect(r.message).toContain("3 elementos");
  });
});

describe("buildAST", () => {
  it("should return null for empty steps", () => {
    expect(buildAST([])).toBeNull();
  });

  it("should build AST for a single constant", () => {
    const ast = buildAST([{ type: "constant", value: "10" }]);
    expect(ast).toEqual({ kind: "const", value: 10 });
  });

  it("should build binary expression", () => {
    const steps: FormulaStep[] = [
      { type: "variable", value: { id: "v1", name: "V1" } },
      { type: "operator", value: { id: "+", symbol: "+" } },
      { type: "constant", value: "5" },
    ];
    const ast = buildAST(steps);
    expect(ast.kind).toBe("binary");
    expect(ast.op).toBe("+");
    expect(ast.left.kind).toBe("ref");
    expect(ast.right.kind).toBe("const");
  });

  it("should respect operator precedence (* before +)", () => {
    const steps: FormulaStep[] = [
      { type: "constant", value: "1" },
      { type: "operator", value: { id: "+", symbol: "+" } },
      { type: "constant", value: "2" },
      { type: "operator", value: { id: "*", symbol: "*" } },
      { type: "constant", value: "3" },
    ];
    const ast = buildAST(steps);
    // Should be 1 + (2 * 3)
    expect(ast.kind).toBe("binary");
    expect(ast.op).toBe("+");
    expect(ast.right.kind).toBe("binary");
    expect(ast.right.op).toBe("*");
  });

  it("should handle parentheses", () => {
    const steps: FormulaStep[] = [
      { type: "parenthesis", value: "(" },
      { type: "constant", value: "1" },
      { type: "operator", value: { id: "+", symbol: "+" } },
      { type: "constant", value: "2" },
      { type: "parenthesis", value: ")" },
      { type: "operator", value: { id: "*", symbol: "*" } },
      { type: "constant", value: "3" },
    ];
    const ast = buildAST(steps);
    // Should be (1 + 2) * 3
    expect(ast.kind).toBe("binary");
    expect(ast.op).toBe("*");
    expect(ast.left.kind).toBe("binary");
    expect(ast.left.op).toBe("+");
  });

  it("should handle function calls", () => {
    const sumFunc = FORMULA_FUNCTIONS[0]; // SUM
    const steps: FormulaStep[] = [
      { type: "function", value: sumFunc },
      { type: "constant", value: "1" },
      { type: "separator", value: "," },
      { type: "constant", value: "2" },
      { type: "parenthesis", value: ")" },
    ];
    const ast = buildAST(steps);
    expect(ast.kind).toBe("call");
    expect(ast.func).toBe("SUM");
    expect(ast.args).toHaveLength(2);
  });

  it("should handle comparison operators", () => {
    const steps: FormulaStep[] = [
      { type: "constant", value: "1" },
      { type: "comparison", value: { id: ">", symbol: ">" } },
      { type: "constant", value: "2" },
    ];
    const ast = buildAST(steps);
    expect(ast.kind).toBe("binary");
    expect(ast.op).toBe(">");
  });

  it("should handle baseline", () => {
    const ast = buildAST([{ type: "baseline", value: { id: "LINEA_BASE" } }]);
    expect(ast.kind).toBe("baseline");
  });

  it("should handle goal_variable", () => {
    const ast = buildAST([{ type: "goal_variable", value: { idMeta: "g1" } }]);
    expect(ast.kind).toBe("goal_var");
  });

  it("should handle goal_indicator", () => {
    const ast = buildAST([{ type: "goal_indicator", value: { idMeta: "gi1" } }]);
    expect(ast.kind).toBe("goal_ind");
  });

  it("should handle quadrennium_variable", () => {
    const ast = buildAST([{ type: "quadrennium_variable", value: { id: "q1" } }]);
    expect(ast.kind).toBe("quad_var");
  });

  it("should handle quadrennium_indicator", () => {
    const ast = buildAST([{ type: "quadrennium_indicator", value: { id: "qi1" } }]);
    expect(ast.kind).toBe("quad_ind");
  });

  it("should handle advance type", () => {
    const ast = buildAST([{ type: "advance", value: { id: "a1", year: 2024 } }]);
    expect(ast.kind).toBe("ref_advance");
  });

  it("should include sub-formula for variables with formulas", () => {
    const steps: FormulaStep[] = [
      {
        type: "variable",
        value: {
          id: "v1",
          name: "V1",
          formula: [{ type: "constant", value: "42" }],
        },
      },
    ];
    const ast = buildAST(steps);
    expect(ast.kind).toBe("ref");
    expect(ast.subFormula).toBeDefined();
  });
});

describe("convertAstToSteps", () => {
  const variables: Variable[] = [{ id: "v1", name: "Var1" }];
  const goalsVariables: GoalVariable[] = [{ idMeta: "g1", valorMeta: "100" }];
  const goalsIndicators: GoalIndicator[] = [{ idMeta: "gi1", valorMeta: "200" }];
  const variableQuadrenniums: VariableQuadrenium[] = [
    { id: "q1", startYear: 2020, endYear: 2023, value: "300" },
  ];
  const indicatorQuadrenniums: IndicatorQuadrennium[] = [
    { id: "qi1", startYear: 2020, endYear: 2023, value: "400" },
  ];

  it("should return empty for null node", () => {
    expect(convertAstToSteps(null, [], [], [], [], [])).toEqual([]);
  });

  it("should convert const node", () => {
    const steps = convertAstToSteps({ kind: "const", value: 10 }, [], [], [], [], []);
    expect(steps).toHaveLength(1);
    expect(steps[0].type).toBe("constant");
    expect(steps[0].value).toBe("10");
  });

  it("should convert ref node with known variable", () => {
    const steps = convertAstToSteps({ kind: "ref", value: "v1" }, variables, [], [], [], []);
    expect(steps).toHaveLength(1);
    expect(steps[0].type).toBe("variable");
    expect(steps[0].value.id).toBe("v1");
  });

  it("should convert ref node with unknown variable", () => {
    const steps = convertAstToSteps({ kind: "ref", value: "unknown" }, variables, [], [], [], []);
    expect(steps[0].value.name).toBe("Desconocido");
  });

  it("should convert binary node", () => {
    const ast = { kind: "binary", op: "+", left: { kind: "const", value: 1 }, right: { kind: "const", value: 2 } };
    const steps = convertAstToSteps(ast, [], [], [], [], []);
    expect(steps.length).toBe(3);
    expect(steps[0].type).toBe("constant");
    expect(steps[1].type).toBe("operator");
    expect(steps[2].type).toBe("constant");
  });

  it("should wrap lower-precedence children in parens", () => {
    const ast = {
      kind: "binary",
      op: "*",
      left: { kind: "binary", op: "+", left: { kind: "const", value: 1 }, right: { kind: "const", value: 2 } },
      right: { kind: "const", value: 3 },
    };
    const steps = convertAstToSteps(ast, [], [], [], [], []);
    expect(steps[0].type).toBe("parenthesis");
    expect(steps[0].value).toBe("(");
  });

  it("should convert function call node", () => {
    const ast = { kind: "call", func: "SUM", args: [{ kind: "const", value: 1 }, { kind: "const", value: 2 }] };
    const steps = convertAstToSteps(ast, [], [], [], [], []);
    expect(steps[0].type).toBe("function");
    expect(steps[0].value.id).toBe("SUM");
    expect(steps.filter((s) => s.type === "separator")).toHaveLength(1);
    expect(steps[steps.length - 1].type).toBe("parenthesis");
    expect(steps[steps.length - 1].value).toBe(")");
  });

  it("should convert goal_var node (known)", () => {
    const steps = convertAstToSteps({ kind: "goal_var", value: "g1" }, variables, goalsVariables, [], [], []);
    expect(steps[0].type).toBe("goal_variable");
    expect(steps[0].value.valorMeta).toBe("100");
  });

  it("should convert goal_var node (unknown)", () => {
    const steps = convertAstToSteps({ kind: "goal_var", value: "x" }, [], [], [], [], []);
    expect(steps[0].type).toBe("goal_variable");
    expect(steps[0].value.valorMeta).toBe("?");
  });

  it("should convert goal_ind node (known)", () => {
    const steps = convertAstToSteps({ kind: "goal_ind", value: "gi1" }, [], [], goalsIndicators, [], []);
    expect(steps[0].type).toBe("goal_indicator");
  });

  it("should convert goal_ind node (unknown)", () => {
    const steps = convertAstToSteps({ kind: "goal_ind", value: "x" }, [], [], [], [], []);
    expect(steps[0].type).toBe("goal_indicator");
    expect(steps[0].value.valorMeta).toBe("?");
  });

  it("should convert quad_var node (known)", () => {
    const steps = convertAstToSteps({ kind: "quad_var", value: "q1" }, [], [], [], variableQuadrenniums, []);
    expect(steps[0].type).toBe("quadrennium_variable");
    expect(steps[0].value.startYear).toBe(2020);
  });

  it("should convert quad_var node (unknown)", () => {
    const steps = convertAstToSteps({ kind: "quad_var", value: "x" }, [], [], [], [], []);
    expect(steps[0].type).toBe("quadrennium_variable");
    expect(steps[0].value.value).toBe("?");
  });

  it("should convert quad_var from nested variable quadrenniums", () => {
    const vars: Variable[] = [
      { id: "v1", name: "V1", quadrenniums: [{ id: "nq1", startYear: 2024, endYear: 2027, value: "500" }] },
    ];
    const steps = convertAstToSteps({ kind: "quad_var", value: "nq1" }, vars, [], [], [], []);
    expect(steps[0].value.startYear).toBe(2024);
  });

  it("should convert quad_ind node (known)", () => {
    const steps = convertAstToSteps({ kind: "quad_ind", value: "qi1" }, [], [], [], [], indicatorQuadrenniums);
    expect(steps[0].type).toBe("quadrennium_indicator");
    expect(steps[0].value.startYear).toBe(2020);
  });

  it("should convert quad_ind node (unknown)", () => {
    const steps = convertAstToSteps({ kind: "quad_ind", value: "x" }, [], [], [], [], []);
    expect(steps[0].type).toBe("quadrennium_indicator");
    expect(steps[0].value.value).toBe("?");
  });

  it("should convert baseline node", () => {
    const steps = convertAstToSteps({ kind: "baseline", value: "LINEA_BASE" }, [], [], [], [], []);
    expect(steps[0].type).toBe("baseline");
  });

  it("should convert ref_advance node", () => {
    const steps = convertAstToSteps({ kind: "ref_advance", value: { id: "a1" } }, [], [], [], [], []);
    expect(steps[0].type).toBe("advance");
  });

  it("should handle comparison in binary node", () => {
    const ast = { kind: "binary", op: ">", left: { kind: "const", value: 5 }, right: { kind: "const", value: 3 } };
    const steps = convertAstToSteps(ast, [], [], [], [], []);
    expect(steps[1].type).toBe("comparison");
  });

  it("should convert goal_var from nested variable goals", () => {
    const vars: Variable[] = [
      { id: "v1", name: "V1", goals: [{ idMeta: "ng1", valorMeta: "999" }] },
    ];
    const steps = convertAstToSteps({ kind: "goal_var", value: "ng1" }, vars, [], [], [], []);
    expect(steps[0].value.valorMeta).toBe("999");
  });
});
