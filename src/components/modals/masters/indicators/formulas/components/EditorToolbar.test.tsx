import { render, screen, fireEvent } from "@testing-library/react"; // eslint-disable-line
import { EditorToolbar } from "./EditorToolbar";

/** Helper: override select.value getter so JSDOM returns the desired value (mock options lack value attr) */
function changeSelect(el: HTMLElement, value: string) {
  Object.defineProperty(el, "value", { configurable: true, get: () => value, set: () => {} });
  fireEvent.change(el);
}

const baseProps = {
  activeTab: "main",
  selectedVariableId: null,
  variables: [],
  goalIndicators: [],
  indicatorQuadrenniums: [],
  validationState: { isValid: true, errors: [], canAddEntity: true, canAddOperator: false, canAddUnaryOperator: false, canAddCloseParen: false, canAddSeparator: false, isInIfCondition: false, canAddComparisonOperator: false } as any,
  currentSteps: [],
  years: ["2023", "2024", "2025"],
  constantValue: "",
  setConstantValue: jest.fn(),
  advanceYear: "2024",
  setAdvanceYear: jest.fn(),
  advanceMonths: new Set<string>(),
  setAdvanceMonths: jest.fn(),
  insertStep: jest.fn(),
  addConstant: jest.fn(),
  variableFormulas: {},
};

const allEnabledValidation = {
  isValid: true,
  errors: [],
  canAddEntity: true,
  canAddOperator: true,
  canAddUnaryOperator: true,
  canAddCloseParen: true,
  canAddSeparator: true,
  isInIfCondition: true,
  canAddComparisonOperator: true,
  isInsideFunction: true,
  currentContext: { type: "function", name: "SUM" },
} as any;

const sampleVariables = [
  { id: "v1", name: "Inversión Total", code: "VA-001", formula: [], goals: [{ idMeta: "gv1", label: "Meta Var 1", valorMeta: "200", idVariable: "v1" }], quadrenniums: [{ id: "qv1", label: "Cuatrenio Var", startYear: 2020, endYear: 2024, value: "300", idVariable: "v1" }] },
  { id: "v2", name: "Gastos Operativos", code: "VA-002", formula: [], goals: [], quadrenniums: [] },
];

const sampleFormulas = { v1: [{ type: "number" as any, value: 1 }], v2: [{ type: "number" as any, value: 2 }] };

const sampleGoals = [
  { idMeta: "g1", label: "Meta 2024", valorMeta: "100", idIndicador: "i1" },
  { idMeta: "g2", label: "Meta 2025", valorMeta: "200", idIndicador: "i1" },
];

const sampleQuadrenniums = [
  { id: "q1", label: "Cuatrenio 2020-2024", startYear: 2020, endYear: 2024, value: "80", idIndicador: "i1" },
];

describe("EditorToolbar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { container } = render(<EditorToolbar {...baseProps} />);
    expect(container).toBeTruthy();
  });

  it("renders Variables select on main tab", () => {
    render(<EditorToolbar {...baseProps} activeTab="main" />);
    expect(screen.getByLabelText("Insertar Variable")).toBeInTheDocument();
  });

  it("renders Funciones select", () => {
    render(<EditorToolbar {...baseProps} />);
    expect(screen.getByLabelText("Insertar Función")).toBeInTheDocument();
  });

  it("renders constant input with placeholder 'Constante'", () => {
    render(<EditorToolbar {...baseProps} />);
    expect(screen.getByPlaceholderText("Constante")).toBeInTheDocument();
  });

  it("calls addConstant when OK button pressed", () => {
    const mockAddConstant = jest.fn();
    render(<EditorToolbar {...baseProps} constantValue="42" addConstant={mockAddConstant} />);
    fireEvent.click(screen.getByText("OK"));
    expect(mockAddConstant).toHaveBeenCalled();
  });

  it("renders constant input with default value", () => {
    render(<EditorToolbar {...baseProps} constantValue="42" />);
    const input = screen.getByPlaceholderText("Constante") as HTMLInputElement;
    expect(input.value).toBe("42");
  });

  // --- Operator buttons ---

  it.each([
    ["+", "+"],
    ["-", "-"],
    ["*", "*"],
    ["/", "/"],
  ])("calls insertStep with operator '%s' when button clicked", (symbol) => {
    const mockInsert = jest.fn();
    render(<EditorToolbar {...baseProps} validationState={allEnabledValidation} insertStep={mockInsert} />);
    fireEvent.click(screen.getByText(symbol));
    expect(mockInsert).toHaveBeenCalledWith({ type: "operator", value: expect.objectContaining({ symbol }) });
  });

  // --- Comparison operator buttons ---

  it.each([
    ["="], ["≠"], [">"], ["<"], ["≥"], ["≤"],
  ])("calls insertStep with comparison '%s' when button clicked", (symbol) => {
    const mockInsert = jest.fn();
    render(<EditorToolbar {...baseProps} validationState={allEnabledValidation} insertStep={mockInsert} />);
    fireEvent.click(screen.getByText(symbol));
    expect(mockInsert).toHaveBeenCalledWith({ type: "comparison", value: expect.objectContaining({ symbol }) });
  });

  // --- Parenthesis & separator buttons ---

  it("calls insertStep with open parenthesis when ( clicked", () => {
    const mockInsert = jest.fn();
    render(<EditorToolbar {...baseProps} validationState={allEnabledValidation} insertStep={mockInsert} />);
    fireEvent.click(screen.getByText("("));
    expect(mockInsert).toHaveBeenCalledWith({ type: "parenthesis", value: "(" });
  });

  it("calls insertStep with close parenthesis when ) clicked", () => {
    const mockInsert = jest.fn();
    render(<EditorToolbar {...baseProps} validationState={allEnabledValidation} insertStep={mockInsert} />);
    fireEvent.click(screen.getByText(")"));
    expect(mockInsert).toHaveBeenCalledWith({ type: "parenthesis", value: ")" });
  });

  it("calls insertStep with separator when , clicked", () => {
    const mockInsert = jest.fn();
    render(<EditorToolbar {...baseProps} validationState={allEnabledValidation} insertStep={mockInsert} />);
    fireEvent.click(screen.getByText(","));
    expect(mockInsert).toHaveBeenCalledWith({ type: "separator", value: "," });
  });

  // --- Function select ---

  it("calls insertStep with function when function selected", () => {
    const mockInsert = jest.fn();
    render(<EditorToolbar {...baseProps} validationState={allEnabledValidation} insertStep={mockInsert} />);
    const funcSelect = screen.getByLabelText("Insertar Función");
    changeSelect(funcSelect, "SUM");
    expect(mockInsert).toHaveBeenCalledWith({ type: "function", value: { id: "SUM", name: "SUMA" } });
  });

  it("calls insertStep with IF function when IF selected", () => {
    const mockInsert = jest.fn();
    render(<EditorToolbar {...baseProps} validationState={allEnabledValidation} insertStep={mockInsert} />);
    changeSelect(screen.getByLabelText("Insertar Función"), "IF");
    expect(mockInsert).toHaveBeenCalledWith({ type: "function", value: { id: "IF", name: "SI" } });
  });

  // --- Variable select (main tab) ---

  it("calls insertStep with variable when variable selected on main tab", () => {
    const mockInsert = jest.fn();
    render(
      <EditorToolbar
        {...baseProps}
        activeTab="main"
        validationState={allEnabledValidation}
        variables={sampleVariables}
        variableFormulas={sampleFormulas}
        insertStep={mockInsert}
      />
    );
    const varSelect = screen.getByLabelText("Insertar Variable");
    changeSelect(varSelect, "v1");
    expect(mockInsert).toHaveBeenCalledWith({ type: "variable", value: expect.objectContaining({ id: "v1", name: "Inversión Total" }) });
  });

  it("does not insert variable without formula", () => {
    const mockInsert = jest.fn();
    const noFormulaVars = [{ id: "v3", name: "Sin Formula", code: "VA-003", formula: [], goals: [], quadrenniums: [] }];
    render(
      <EditorToolbar
        {...baseProps}
        variables={noFormulaVars}
        variableFormulas={{}}
        insertStep={mockInsert}
      />
    );
    const varSelect = screen.getByLabelText("Insertar Variable");
    changeSelect(varSelect, "v3");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  // --- Goal indicator select (main tab) ---

  it("calls insertStep with goal_indicator when goal selected", () => {
    const mockInsert = jest.fn();
    render(
      <EditorToolbar
        {...baseProps}
        validationState={allEnabledValidation}
        goalIndicators={sampleGoals}
        insertStep={mockInsert}
      />
    );
    const goalSelect = screen.getByLabelText("Insertar Meta Indicador");
    changeSelect(goalSelect, "g1");
    expect(mockInsert).toHaveBeenCalledWith({
      type: "goal_indicator",
      value: expect.objectContaining({ idMeta: "g1", label: "Meta 2024" }),
    });
  });

  it("does not render Metas Indicador when goalIndicators is empty", () => {
    render(<EditorToolbar {...baseProps} goalIndicators={[]} />);
    expect(screen.queryByLabelText("Insertar Meta Indicador")).not.toBeInTheDocument();
  });

  // --- Quadrennium indicator select (main tab) ---

  it("calls insertStep with quadrennium_indicator when quadrennium selected", () => {
    const mockInsert = jest.fn();
    render(
      <EditorToolbar
        {...baseProps}
        validationState={allEnabledValidation}
        indicatorQuadrenniums={sampleQuadrenniums}
        insertStep={mockInsert}
      />
    );
    const qSelect = screen.getByLabelText("Insertar Cuatrenio Indicador");
    changeSelect(qSelect, "q1");
    expect(mockInsert).toHaveBeenCalledWith({
      type: "quadrennium_indicator",
      value: expect.objectContaining({ id: "q1" }),
    });
  });

  it("does not render quadrennium select when indicatorQuadrenniums is empty", () => {
    render(<EditorToolbar {...baseProps} indicatorQuadrenniums={[]} />);
    expect(screen.queryByLabelText("Insertar Cuatrenio Indicador")).not.toBeInTheDocument();
  });

  // --- Línea Base ---

  it("renders Línea Base button when type=indicative and baseline provided", () => {
    render(<EditorToolbar {...baseProps} type="indicative" baseline="50" />);
    expect(screen.getByText("Línea Base")).toBeInTheDocument();
  });

  it("does not render Línea Base button when baseline is undefined", () => {
    render(<EditorToolbar {...baseProps} type="indicative" />);
    expect(screen.queryByText("Línea Base")).not.toBeInTheDocument();
  });

  it("calls insertStep with baseline when Línea Base clicked", () => {
    const mockInsert = jest.fn();
    render(<EditorToolbar {...baseProps} type="indicative" baseline="50" validationState={allEnabledValidation} insertStep={mockInsert} />);
    fireEvent.click(screen.getByText("Línea Base"));
    expect(mockInsert).toHaveBeenCalledWith({
      type: "baseline",
      value: { id: "LINEA_BASE", label: "Línea Base" },
    });
  });

  // --- Variables tab: goals & quadrenniums ---

  it("renders variable goals select on variables tab when selected variable has goals", () => {
    render(
      <EditorToolbar
        {...baseProps}
        activeTab="variables"
        selectedVariableId="v1"
        variables={sampleVariables}
        variableFormulas={sampleFormulas}
      />
    );
    expect(screen.getByLabelText("Insertar Meta")).toBeInTheDocument();
  });

  it("calls insertStep with goal_variable when variable goal selected", () => {
    const mockInsert = jest.fn();
    render(
      <EditorToolbar
        {...baseProps}
        activeTab="variables"
        selectedVariableId="v1"
        variables={sampleVariables}
        variableFormulas={sampleFormulas}
        validationState={allEnabledValidation}
        insertStep={mockInsert}
      />
    );
    changeSelect(screen.getByLabelText("Insertar Meta"), "gv1");
    expect(mockInsert).toHaveBeenCalledWith({
      type: "goal_variable",
      value: expect.objectContaining({ idMeta: "gv1" }),
    });
  });

  it("renders variable quadrenniums select on variables tab when selected variable has quadrenniums", () => {
    render(
      <EditorToolbar
        {...baseProps}
        activeTab="variables"
        selectedVariableId="v1"
        variables={sampleVariables}
        variableFormulas={sampleFormulas}
      />
    );
    expect(screen.getByLabelText("Insertar Cuatrenio")).toBeInTheDocument();
  });

  it("calls insertStep with quadrennium_variable when variable quadrennium selected", () => {
    const mockInsert = jest.fn();
    render(
      <EditorToolbar
        {...baseProps}
        activeTab="variables"
        selectedVariableId="v1"
        variables={sampleVariables}
        variableFormulas={sampleFormulas}
        validationState={allEnabledValidation}
        insertStep={mockInsert}
      />
    );
    changeSelect(screen.getByLabelText("Insertar Cuatrenio"), "qv1");
    expect(mockInsert).toHaveBeenCalledWith({
      type: "quadrennium_variable",
      value: expect.objectContaining({ id: "qv1" }),
    });
  });

  it("does not render variable goals/quadrenniums when no variable selected", () => {
    render(<EditorToolbar {...baseProps} activeTab="variables" selectedVariableId={null} variables={sampleVariables} />);
    expect(screen.queryByLabelText("Insertar Meta")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Insertar Cuatrenio")).not.toBeInTheDocument();
  });

  // --- Constant Enter key ---

  it("calls addConstant when Enter pressed in constant input", () => {
    const mockAddConstant = jest.fn();
    render(<EditorToolbar {...baseProps} constantValue="99" addConstant={mockAddConstant} />);
    const input = screen.getByPlaceholderText("Constante");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockAddConstant).toHaveBeenCalled();
  });

  it("does not call addConstant for non-Enter key", () => {
    const mockAddConstant = jest.fn();
    render(<EditorToolbar {...baseProps} constantValue="99" addConstant={mockAddConstant} />);
    const input = screen.getByPlaceholderText("Constante");
    fireEvent.keyDown(input, { key: "Tab" });
    expect(mockAddConstant).not.toHaveBeenCalled();
  });

  // --- Advance year select ---

  it("renders advances section on variables tab", () => {
    render(<EditorToolbar {...baseProps} activeTab="variables" />);
    expect(screen.getByLabelText("Año del avance")).toBeInTheDocument();
    expect(screen.getByLabelText("Meses del avance")).toBeInTheDocument();
  });

  it("calls setAdvanceYear when year changed", () => {
    const mockSetYear = jest.fn();
    render(<EditorToolbar {...baseProps} activeTab="variables" setAdvanceYear={mockSetYear} />);
    changeSelect(screen.getByLabelText("Año del avance"), "2025");
    expect(mockSetYear).toHaveBeenCalledWith("2025");
  });

  // --- Insertar advance button ---

  it("calls insertStep with advance for single month", () => {
    const mockInsert = jest.fn();
    const mockSetMonths = jest.fn();
    render(
      <EditorToolbar
        {...baseProps}
        activeTab="variables"
        advanceYear="2024"
        advanceMonths={new Set(["3"])}
        validationState={allEnabledValidation}
        currentSteps={[{ type: "function" as any, value: "SUM" }]}
        insertStep={mockInsert}
        setAdvanceMonths={mockSetMonths}
      />
    );
    fireEvent.click(screen.getByText("Insertar"));
    expect(mockInsert).toHaveBeenCalledWith({
      type: "advance",
      value: expect.objectContaining({
        year: 2024,
        months: [3],
        label: "Avance Marzo 2024",
      }),
    });
    expect(mockSetMonths).toHaveBeenCalledWith(new Set());
  });

  it("calls insertStep with advance for ALL months", () => {
    const mockInsert = jest.fn();
    const mockSetMonths = jest.fn();
    render(
      <EditorToolbar
        {...baseProps}
        activeTab="variables"
        advanceYear="2024"
        advanceMonths={new Set(["ALL"])}
        validationState={allEnabledValidation}
        currentSteps={[{ type: "function" as any, value: "SUM" }]}
        insertStep={mockInsert}
        setAdvanceMonths={mockSetMonths}
      />
    );
    fireEvent.click(screen.getByText("Insertar"));
    expect(mockInsert).toHaveBeenCalledWith({
      type: "advance",
      value: expect.objectContaining({
        year: 2024,
        months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        label: "Avance 2024 (Todo el año)",
      }),
    });
    expect(mockSetMonths).toHaveBeenCalledWith(new Set());
  });

  it("calls insertStep with advance for multiple months", () => {
    const mockInsert = jest.fn();
    render(
      <EditorToolbar
        {...baseProps}
        activeTab="variables"
        advanceYear="2023"
        advanceMonths={new Set(["1", "6"])}
        validationState={allEnabledValidation}
        currentSteps={[{ type: "function" as any, value: "SUM" }]}
        insertStep={mockInsert}
      />
    );
    fireEvent.click(screen.getByText("Insertar"));
    expect(mockInsert).toHaveBeenCalledWith({
      type: "advance",
      value: expect.objectContaining({
        year: 2023,
        months: [1, 6],
        label: "Avance 2023 (2 meses)",
      }),
    });
  });

  // --- Variables filter ---

  it("renders with variables that have formulas", () => {
    const variables = [{ id: "v1", name: "Var Alpha", code: "VA-001", formula: [], goals: [], quadrenniums: [] }];
    const variableFormulas = { v1: [{ type: "number" as any, value: 1 }] };
    render(<EditorToolbar {...baseProps} variables={variables} variableFormulas={variableFormulas} />);
    expect(screen.getByLabelText("Insertar Variable")).toBeInTheDocument();
  });

  it("does not render Línea Base when type is action", () => {
    render(<EditorToolbar {...baseProps} type="action" baseline="50" />);
    expect(screen.queryByText("Línea Base")).not.toBeInTheDocument();
  });

  it("does not show variable select on variables tab", () => {
    render(<EditorToolbar {...baseProps} activeTab="variables" />);
    expect(screen.queryByLabelText("Insertar Variable")).not.toBeInTheDocument();
  });

  it("does not show advances section on main tab", () => {
    render(<EditorToolbar {...baseProps} activeTab="main" />);
    expect(screen.queryByLabelText("Año del avance")).not.toBeInTheDocument();
  });

  it("ignores non-existent variable id on select change", () => {
    const mockInsert = jest.fn();
    render(
      <EditorToolbar
        {...baseProps}
        variables={sampleVariables}
        variableFormulas={sampleFormulas}
        insertStep={mockInsert}
      />
    );
    changeSelect(screen.getByLabelText("Insertar Variable"), "nonexistent");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("ignores non-existent goal id on select change", () => {
    const mockInsert = jest.fn();
    render(<EditorToolbar {...baseProps} goalIndicators={sampleGoals} insertStep={mockInsert} />);
    changeSelect(screen.getByLabelText("Insertar Meta Indicador"), "bad");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("ignores non-existent quadrennium id on select change", () => {
    const mockInsert = jest.fn();
    render(<EditorToolbar {...baseProps} indicatorQuadrenniums={sampleQuadrenniums} insertStep={mockInsert} />);
    changeSelect(screen.getByLabelText("Insertar Cuatrenio Indicador"), "bad");
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it("ignores non-existent function id on select change", () => {
    const mockInsert = jest.fn();
    render(<EditorToolbar {...baseProps} insertStep={mockInsert} />);
    changeSelect(screen.getByLabelText("Insertar Función"), "INVALID");
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
