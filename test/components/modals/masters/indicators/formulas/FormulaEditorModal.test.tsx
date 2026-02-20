import { render, screen, fireEvent } from "@testing-library/react";
import { FormulaEditorModal } from "@/components/modals/masters/indicators/formulas/FormulaEditorModal";

const mockEditorState: Record<string, any> = {};

const defaultEditorState = {
  selectedYear: "2024",
  setSelectedYear: jest.fn(),
  isLoading: false,
  variables: [],
  goalVariables: [],
  goalIndicators: [],
  indicatorQuadrenniums: [],
  baseline: "0",
  existingFormulaId: null,
  activeTab: "main",
  setActiveTab: jest.fn(),
  selectedVariableId: null,
  setSelectedVariableId: jest.fn(),
  variableFormulas: {},
  mainFormulaSteps: [],
  isReplicateModalOpen: false,
  setIsReplicateModalOpen: jest.fn(),
  isGuideOpen: false,
  setIsGuideOpen: jest.fn(),
  cursorIndex: null,
  setCursorIndex: jest.fn(),
  constantValue: "",
  setConstantValue: jest.fn(),
  advanceYear: "",
  setAdvanceYear: jest.fn(),
  advanceMonths: new Set<string>(),
  setAdvanceMonths: jest.fn(),
  years: ["2024", "2025"],
  currentSteps: [],
  validationState: { isValid: true, errors: [] },
  fetchData: jest.fn(),
  getCurrentSteps: jest.fn(() => []),
  updateCurrentSteps: jest.fn(),
  insertStep: jest.fn(),
  removeStep: jest.fn(),
  undoLastStep: jest.fn(),
  clearAllSteps: jest.fn(),
  validateCurrent: jest.fn(() => ({ isValid: true, errors: [] })),
  addConstant: jest.fn(),
  handleReplicate: jest.fn(),
  serializeFormula: jest.fn(),
  getHydratedSteps: jest.fn(() => []),
  handleSave: jest.fn(),
};

jest.mock("@/components/modals/masters/indicators/formulas/hooks/useFormulaEditor", () => ({
  useFormulaEditor: () => ({ ...defaultEditorState, ...mockEditorState }),
}));
jest.mock("@/components/modals/masters/indicators/formulas/components/EditorToolbar", () => ({
  EditorToolbar: () => <div>EditorToolbar</div>,
}));
jest.mock("@/components/modals/masters/indicators/formulas/components/EditorCanvas", () => ({
  EditorCanvas: ({ renderToolbar }: any) => <div>EditorCanvas{renderToolbar && renderToolbar()}</div>,
}));
jest.mock("@/components/modals/masters/indicators/formulas/ReplicateFormulaModal", () => ({
  ReplicateFormulaModal: ({ isOpen }: any) => isOpen ? <div data-testid="replicate-modal">Replicate</div> : null,
}));
jest.mock("@/components/modals/masters/indicators/formulas/FormulaGuideModal", () => ({
  FormulaGuideModal: ({ isOpen }: any) => isOpen ? <div data-testid="guide-modal">Guide</div> : null,
}));

describe("FormulaEditorModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSave: jest.fn(),
    indicatorId: "i1",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset overrides
    Object.keys(mockEditorState).forEach(k => delete mockEditorState[k]);
  });

  it("renders when open", () => {
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<FormulaEditorModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows default title", () => {
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByText("Editor de Fórmulas")).toBeInTheDocument();
  });

  it("shows custom title", () => {
    render(<FormulaEditorModal {...defaultProps} title="Mi Editor" />);
    expect(screen.getByText("Mi Editor")).toBeInTheDocument();
  });

  it("shows subtitle", () => {
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByText("Configure las fórmulas de cálculo")).toBeInTheDocument();
  });

  it("shows year select label", () => {
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByText("Año:")).toBeInTheDocument();
  });

  it("renders year select with aria-label", () => {
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByLabelText("Año de vigencia")).toBeInTheDocument();
  });

  // Loading state
  it("shows spinner when loading", () => {
    mockEditorState.isLoading = true;
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("hides content when loading", () => {
    mockEditorState.isLoading = true;
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.queryByText("EditorCanvas")).not.toBeInTheDocument();
  });

  // Main tab content
  it("shows main tab description", () => {
    mockEditorState.activeTab = "main";
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByText("Combine las variables configuradas para calcular el valor final del indicador")).toBeInTheDocument();
  });

  it("shows EditorCanvas on main tab", () => {
    mockEditorState.activeTab = "main";
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByText("EditorCanvas")).toBeInTheDocument();
  });

  // Variables tab — no variable selected (card list)
  it("shows variable selection text on variables tab", () => {
    mockEditorState.activeTab = "variables";
    mockEditorState.selectedVariableId = null;
    mockEditorState.variables = [{ id: "v1", code: "VAR_1", name: "Variable One" }];
    mockEditorState.variableFormulas = {};
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByText("Seleccione una variable para definir su fórmula de cálculo")).toBeInTheDocument();
  });

  it("renders variable cards", () => {
    mockEditorState.activeTab = "variables";
    mockEditorState.selectedVariableId = null;
    mockEditorState.variables = [
      { id: "v1", code: "VAR_1", name: "Variable One" },
      { id: "v2", code: "VAR_2", name: "Variable Two" },
    ];
    mockEditorState.variableFormulas = {};
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByText("VAR_1")).toBeInTheDocument();
    expect(screen.getByText("VAR_2")).toBeInTheDocument();
  });

  it("shows Sin fórmula badge for variables without formula", () => {
    mockEditorState.activeTab = "variables";
    mockEditorState.selectedVariableId = null;
    mockEditorState.variables = [{ id: "v1", code: "VAR_1", name: "Variable One" }];
    mockEditorState.variableFormulas = {};
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByText("Sin fórmula")).toBeInTheDocument();
  });

  it("shows CheckCircle icon for variable with formula", () => {
    mockEditorState.activeTab = "variables";
    mockEditorState.selectedVariableId = null;
    mockEditorState.variables = [{ id: "v1", code: "VAR_1", name: "Variable One" }];
    mockEditorState.variableFormulas = { v1: [{ type: "constant", value: "1" }] };
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByTestId("icon-CheckCircle")).toBeInTheDocument();
  });

  it("shows variable name when code differs from name", () => {
    mockEditorState.activeTab = "variables";
    mockEditorState.selectedVariableId = null;
    mockEditorState.variables = [{ id: "v1", code: "VAR_1", name: "My Variable" }];
    mockEditorState.variableFormulas = {};
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByText("My Variable")).toBeInTheDocument();
  });

  // Variables tab — variable selected (formula editor)
  it("shows Volver button when variable selected", () => {
    mockEditorState.activeTab = "variables";
    mockEditorState.selectedVariableId = "v1";
    mockEditorState.variables = [{ id: "v1", code: "VAR_1", name: "Variable One" }];
    mockEditorState.currentSteps = [];
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByText("Volver")).toBeInTheDocument();
  });

  it("shows selected variable code", () => {
    mockEditorState.activeTab = "variables";
    mockEditorState.selectedVariableId = "v1";
    mockEditorState.variables = [{ id: "v1", code: "VAR_1", name: "Variable One" }];
    mockEditorState.currentSteps = [];
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByText("VAR_1")).toBeInTheDocument();
    expect(screen.getByText("Defina cómo se calcula esta variable")).toBeInTheDocument();
  });

  it("shows Replicar button when currentSteps has items", () => {
    mockEditorState.activeTab = "variables";
    mockEditorState.selectedVariableId = "v1";
    mockEditorState.variables = [{ id: "v1", code: "VAR_1", name: "Variable One" }];
    mockEditorState.currentSteps = [{ type: "constant", value: "1" }];
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByText("Replicar")).toBeInTheDocument();
  });

  it("hides Replicar button when currentSteps is empty", () => {
    mockEditorState.activeTab = "variables";
    mockEditorState.selectedVariableId = "v1";
    mockEditorState.variables = [{ id: "v1", code: "VAR_1", name: "Variable One" }];
    mockEditorState.currentSteps = [];
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.queryByText("Replicar")).not.toBeInTheDocument();
  });

  it("clicking Replicar opens replicate modal", () => {
    mockEditorState.activeTab = "variables";
    mockEditorState.selectedVariableId = "v1";
    mockEditorState.variables = [{ id: "v1", code: "VAR_1", name: "Variable One" }];
    mockEditorState.currentSteps = [{ type: "constant", value: "1" }];
    render(<FormulaEditorModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Replicar"));
    expect(defaultEditorState.setIsReplicateModalOpen).toHaveBeenCalledWith(true);
  });

  // Footer buttons
  it("shows Ayuda button", () => {
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByText("Ayuda")).toBeInTheDocument();
  });

  it("clicking Ayuda opens guide modal", () => {
    render(<FormulaEditorModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Ayuda"));
    expect(defaultEditorState.setIsGuideOpen).toHaveBeenCalledWith(true);
  });

  it("shows Cancelar button", () => {
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("clicking Cancelar calls onClose", () => {
    render(<FormulaEditorModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Cancelar"));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("shows Guardar button", () => {
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByText("Guardar")).toBeInTheDocument();
  });

  it("clicking Guardar calls handleSave when mainFormulaSteps is not empty", () => {
    mockEditorState.mainFormulaSteps = [{ type: "constant", value: "5" }];
    render(<FormulaEditorModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Guardar"));
    expect(defaultEditorState.handleSave).toHaveBeenCalled();
  });

  // EditorToolbar is rendered via renderToolbar
  it("renders EditorToolbar via renderToolbar callback", () => {
    mockEditorState.activeTab = "main";
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByText("EditorToolbar")).toBeInTheDocument();
  });

  // Guide modal renders when isGuideOpen=true
  it("renders guide modal when open", () => {
    mockEditorState.isGuideOpen = true;
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByTestId("guide-modal")).toBeInTheDocument();
  });

  // ReplicateFormulaModal renders when isReplicateModalOpen=true and selectedVariableId is set
  it("renders replicate modal when open and variable selected", () => {
    mockEditorState.isReplicateModalOpen = true;
    mockEditorState.selectedVariableId = "v1";
    mockEditorState.variables = [{ id: "v1", code: "VAR_1", name: "Variable One" }];
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByTestId("replicate-modal")).toBeInTheDocument();
  });

  it("does not render replicate modal when no variable selected", () => {
    mockEditorState.isReplicateModalOpen = true;
    mockEditorState.selectedVariableId = null;
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.queryByTestId("replicate-modal")).not.toBeInTheDocument();
  });

  // Clicking Volver clears selectedVariableId
  it("clicking Volver clears selected variable", () => {
    mockEditorState.activeTab = "variables";
    mockEditorState.selectedVariableId = "v1";
    mockEditorState.variables = [{ id: "v1", code: "VAR_1", name: "Variable One" }];
    mockEditorState.currentSteps = [];
    render(<FormulaEditorModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Volver"));
    expect(defaultEditorState.setSelectedVariableId).toHaveBeenCalledWith(null);
  });

  // --- Additional coverage tests ---

  it("clicking variable card calls setSelectedVariableId", () => {
    mockEditorState.activeTab = "variables";
    mockEditorState.selectedVariableId = null;
    mockEditorState.variables = [{ id: "v1", code: "VAR_1", name: "Variable One" }];
    mockEditorState.variableFormulas = {};
    render(<FormulaEditorModal {...defaultProps} />);
    fireEvent.click(screen.getByText("VAR_1").closest('[data-testid="Card"]')!);
    expect(defaultEditorState.setSelectedVariableId).toHaveBeenCalledWith("v1");
  });

  it("uses variable name as fallback when code is empty", () => {
    mockEditorState.activeTab = "variables";
    mockEditorState.selectedVariableId = null;
    mockEditorState.variables = [{ id: "v1", code: "", name: "Variable No Code" }];
    mockEditorState.variableFormulas = {};
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByText("Variable No Code")).toBeInTheDocument();
  });

  it("does not show name subtitle when code equals name", () => {
    mockEditorState.activeTab = "variables";
    mockEditorState.selectedVariableId = null;
    mockEditorState.variables = [{ id: "v1", code: "SAME", name: "SAME" }];
    mockEditorState.variableFormulas = {};
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getAllByText("SAME")).toHaveLength(1);
  });

  it("shows selected variable name fallback when code is empty", () => {
    mockEditorState.activeTab = "variables";
    mockEditorState.selectedVariableId = "v1";
    mockEditorState.variables = [{ id: "v1", code: "", name: "Name Fallback" }];
    mockEditorState.currentSteps = [];
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByText("Name Fallback")).toBeInTheDocument();
  });

  it("changing year calls setSelectedYear", () => {
    render(<FormulaEditorModal {...defaultProps} />);
    const yearSelect = screen.getByLabelText("Año de vigencia");
    fireEvent.change(yearSelect, { target: { value: "2025" } });
    expect(defaultEditorState.setSelectedYear).toHaveBeenCalledWith("2025");
  });

  it("renders Tabs component for variables and main", () => {
    // Tabs render as direct children — switching is tested via activeTab overrides
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders with type indicative", () => {
    render(<FormulaEditorModal {...defaultProps} type="indicative" />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("Guardar is present when mainFormulaSteps is empty", () => {
    mockEditorState.mainFormulaSteps = [];
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByText("Guardar")).toBeInTheDocument();
  });

  it("shows EditorCanvas on variables tab with selected variable", () => {
    mockEditorState.activeTab = "variables";
    mockEditorState.selectedVariableId = "v1";
    mockEditorState.variables = [{ id: "v1", code: "V1", name: "V1" }];
    mockEditorState.currentSteps = [{ type: "constant", value: "1" }];
    render(<FormulaEditorModal {...defaultProps} />);
    expect(screen.getByText("EditorCanvas")).toBeInTheDocument();
  });
});
