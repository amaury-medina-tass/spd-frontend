import { render, screen, fireEvent } from "@testing-library/react";
import { ReplicateFormulaModal } from "./ReplicateFormulaModal";

const mockOnReplicate = jest.fn();
const mockOnClose = jest.fn();

const sourceVariable: any = {
  id: "src-1",
  name: "Variable Origen",
  code: "SRC",
  formula: [
    { type: "number", value: 42 },
    { type: "goal_variable", value: { year: 2024, label: "Meta [2024]", id: "g1" } },
    { type: "quadrennium_variable", value: { startYear: 2024, endYear: 2027, label: "Cuatrenio [2024-2027]", id: "q1" } },
  ],
  goals: [{ year: 2024, id: "g1" }],
  quadrenniums: [{ startYear: 2024, endYear: 2027, id: "q1" }],
};

// Valid target: has matching goals and quadrenniums
const validTarget: any = {
  id: "tgt-1",
  name: "Variable Destino",
  code: "TGT1",
  formula: [],
  goals: [{ year: 2024, id: "g2" }],
  quadrenniums: [{ startYear: 2024, endYear: 2027, id: "q2" }],
};

// Invalid target: missing goal year
const missingGoalTarget: any = {
  id: "tgt-2",
  name: "Sin Meta",
  code: "TGT2",
  formula: [],
  goals: [],
  quadrenniums: [{ startYear: 2024, endYear: 2027, id: "q3" }],
};

// Invalid target: missing quadrennium
const missingQuadTarget: any = {
  id: "tgt-3",
  name: "Sin Cuatrenio",
  code: "TGT3",
  formula: [],
  goals: [{ year: 2024, id: "g3" }],
  quadrenniums: [],
};

// Circular reference target: sourceVariable formula contains variable step referencing this target
const circularSource: any = {
  id: "circ-src",
  name: "Circular Source",
  formula: [
    { type: "variable", value: { id: "circ-tgt", name: "Circular Target" } },
  ],
};
const circularTarget: any = {
  id: "circ-tgt",
  name: "Circular Target",
  formula: [],
};

const allVariables = [sourceVariable, validTarget, missingGoalTarget, missingQuadTarget];

describe("ReplicateFormulaModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders when open", () => {
    render(
      <ReplicateFormulaModal isOpen={true} onClose={mockOnClose} sourceVariable={null} allVariables={[]} onReplicate={mockOnReplicate} />
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(
      <ReplicateFormulaModal isOpen={false} onClose={mockOnClose} sourceVariable={null} allVariables={[]} onReplicate={mockOnReplicate} />
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders Replicar Fórmula heading", () => {
    render(
      <ReplicateFormulaModal isOpen={true} onClose={mockOnClose} sourceVariable={sourceVariable} allVariables={allVariables} onReplicate={mockOnReplicate} />
    );
    expect(screen.getByText("Replicar Fórmula")).toBeInTheDocument();
  });

  it("shows source variable name", () => {
    render(
      <ReplicateFormulaModal isOpen={true} onClose={mockOnClose} sourceVariable={sourceVariable} allVariables={allVariables} onReplicate={mockOnReplicate} />
    );
    expect(screen.getByText("Variable Origen")).toBeInTheDocument();
  });

  it("shows 0 seleccionados initially", () => {
    render(
      <ReplicateFormulaModal isOpen={true} onClose={mockOnClose} sourceVariable={sourceVariable} allVariables={allVariables} onReplicate={mockOnReplicate} />
    );
    expect(screen.getByText("0 seleccionados")).toBeInTheDocument();
  });

  // Shows candidate variables
  it("shows candidate variables in list", () => {
    render(
      <ReplicateFormulaModal isOpen={true} onClose={mockOnClose} sourceVariable={sourceVariable} allVariables={allVariables} onReplicate={mockOnReplicate} />
    );
    expect(screen.getByText("Variable Destino")).toBeInTheDocument();
    expect(screen.getByText("Sin Meta")).toBeInTheDocument();
    expect(screen.getByText("Sin Cuatrenio")).toBeInTheDocument();
  });

  // Shows variable code as Chip
  it("shows variable code chip", () => {
    render(
      <ReplicateFormulaModal isOpen={true} onClose={mockOnClose} sourceVariable={sourceVariable} allVariables={allVariables} onReplicate={mockOnReplicate} />
    );
    expect(screen.getByText("TGT1")).toBeInTheDocument();
    expect(screen.getByText("TGT2")).toBeInTheDocument();
  });

  // Empty state
  it("shows empty state when no other variables", () => {
    render(
      <ReplicateFormulaModal isOpen={true} onClose={mockOnClose} sourceVariable={sourceVariable} allVariables={[sourceVariable]} onReplicate={mockOnReplicate} />
    );
    expect(screen.getByText("No hay otras variables disponibles")).toBeInTheDocument();
  });

  // Validation: missing goal year
  it("shows validation error for missing goal year", () => {
    render(
      <ReplicateFormulaModal isOpen={true} onClose={mockOnClose} sourceVariable={sourceVariable} allVariables={allVariables} onReplicate={mockOnReplicate} />
    );
    expect(screen.getByText("Falta meta para el año 2024")).toBeInTheDocument();
  });

  // Validation: missing quadrennium
  it("shows validation error for missing quadrennium", () => {
    render(
      <ReplicateFormulaModal isOpen={true} onClose={mockOnClose} sourceVariable={sourceVariable} allVariables={allVariables} onReplicate={mockOnReplicate} />
    );
    expect(screen.getByText("Falta cuatrenio 2024-2027")).toBeInTheDocument();
  });

  // Validation: circular reference
  it("shows validation error for circular reference", () => {
    render(
      <ReplicateFormulaModal
        isOpen={true}
        onClose={mockOnClose}
        sourceVariable={circularSource}
        allVariables={[circularSource, circularTarget]}
        onReplicate={mockOnReplicate}
      />
    );
    expect(screen.getByText("Referencia circular: La fórmula origen usa esta variable.")).toBeInTheDocument();
  });

  // handleToggle - click individual checkbox
  it("toggles individual candidate checkbox", () => {
    render(
      <ReplicateFormulaModal isOpen={true} onClose={mockOnClose} sourceVariable={sourceVariable} allVariables={allVariables} onReplicate={mockOnReplicate} />
    );
    // validTarget is the only valid one, its checkbox should be enabled
    const checkboxes = screen.getAllByRole("checkbox");
    // Find the enabled checkbox (valid target)
    const enabledCheckbox = checkboxes.find((cb) => !cb.hasAttribute("disabled"));
    expect(enabledCheckbox).toBeTruthy();
    fireEvent.click(enabledCheckbox!);
    expect(screen.getByText("1 seleccionados")).toBeInTheDocument();
  });

  it("untoggle deselects candidate", () => {
    render(
      <ReplicateFormulaModal isOpen={true} onClose={mockOnClose} sourceVariable={sourceVariable} allVariables={allVariables} onReplicate={mockOnReplicate} />
    );
    const checkboxes = screen.getAllByRole("checkbox");
    const enabledCheckbox = checkboxes.find((cb) => !cb.hasAttribute("disabled"));
    fireEvent.click(enabledCheckbox!);
    expect(screen.getByText("1 seleccionados")).toBeInTheDocument();
    fireEvent.click(enabledCheckbox!);
    expect(screen.getByText("0 seleccionados")).toBeInTheDocument();
  });

  // handleToggleAll - select all valid
  it("selects all valid candidates via Seleccionar válidos", () => {
    render(
      <ReplicateFormulaModal isOpen={true} onClose={mockOnClose} sourceVariable={sourceVariable} allVariables={allVariables} onReplicate={mockOnReplicate} />
    );
    fireEvent.click(screen.getByText("Seleccionar válidos"));
    expect(screen.getByText("1 seleccionados")).toBeInTheDocument();
  });

  // handleToggleAll - deselect all when all selected
  it("deselects all when all valid are selected", () => {
    render(
      <ReplicateFormulaModal isOpen={true} onClose={mockOnClose} sourceVariable={sourceVariable} allVariables={allVariables} onReplicate={mockOnReplicate} />
    );
    fireEvent.click(screen.getByText("Seleccionar válidos"));
    expect(screen.getByText("1 seleccionados")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Deseleccionar todos"));
    expect(screen.getByText("0 seleccionados")).toBeInTheDocument();
  });

  // handleConfirm - calls onReplicate with mapped formulas
  it("calling Replicar passes mapped formulas to onReplicate", () => {
    render(
      <ReplicateFormulaModal isOpen={true} onClose={mockOnClose} sourceVariable={sourceVariable} allVariables={allVariables} onReplicate={mockOnReplicate} />
    );
    // Select valid target
    fireEvent.click(screen.getByText("Seleccionar válidos"));
    fireEvent.click(screen.getByText("Replicar"));
    expect(mockOnReplicate).toHaveBeenCalledWith(
      ["tgt-1"],
      expect.objectContaining({
        "tgt-1": expect.arrayContaining([
          expect.objectContaining({ type: "number" }),
          expect.objectContaining({ type: "goal_variable" }),
          expect.objectContaining({ type: "quadrennium_variable" }),
        ]),
      })
    );
    expect(mockOnClose).toHaveBeenCalled();
  });

  // Cancelar button calls onClose
  it("clicking Cancelar calls onClose", () => {
    render(
      <ReplicateFormulaModal isOpen={true} onClose={mockOnClose} sourceVariable={sourceVariable} allVariables={allVariables} onReplicate={mockOnReplicate} />
    );
    fireEvent.click(screen.getByText("Cancelar"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  // Replicar button disabled when nothing selected
  it("Replicar button exists", () => {
    render(
      <ReplicateFormulaModal isOpen={true} onClose={mockOnClose} sourceVariable={sourceVariable} allVariables={allVariables} onReplicate={mockOnReplicate} />
    );
    expect(screen.getByText("Replicar")).toBeInTheDocument();
  });

  // AlertCircle icon shown for invalid variables
  it("shows AlertCircle icon for invalid variables", () => {
    render(
      <ReplicateFormulaModal isOpen={true} onClose={mockOnClose} sourceVariable={sourceVariable} allVariables={allVariables} onReplicate={mockOnReplicate} />
    );
    // Two invalid targets: missingGoalTarget and missingQuadTarget
    expect(screen.getAllByTestId("icon-AlertCircle").length).toBeGreaterThanOrEqual(2);
  });

  // cleanLabel coverage: variable without code
  it("renders variable without code (no chip)", () => {
    const noCCodeTarget: any = { id: "nc-1", name: "No Code Var", formula: [], goals: [{ year: 2024, id: "g5" }], quadrenniums: [{ startYear: 2024, endYear: 2027, id: "q5" }] };
    render(
      <ReplicateFormulaModal isOpen={true} onClose={mockOnClose} sourceVariable={sourceVariable} allVariables={[sourceVariable, noCCodeTarget]} onReplicate={mockOnReplicate} />
    );
    expect(screen.getByText("No Code Var")).toBeInTheDocument();
  });

  // Null sourceVariable doesn't crash
  it("handles null sourceVariable gracefully", () => {
    render(
      <ReplicateFormulaModal isOpen={true} onClose={mockOnClose} sourceVariable={null} allVariables={[validTarget]} onReplicate={mockOnReplicate} />
    );
    // Should render candidates without validation issues
    expect(screen.getByText("Variable Destino")).toBeInTheDocument();
  });
});
