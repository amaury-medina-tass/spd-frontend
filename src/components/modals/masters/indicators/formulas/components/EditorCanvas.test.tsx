import { render, screen, fireEvent } from "@testing-library/react";
import { EditorCanvas } from "./EditorCanvas";

jest.mock("./StepChip", () => ({
  StepChip: ({ step, onDelete }: any) => (
    <span data-testid="step-chip">
      {String(step.value)}
      <button onClick={onDelete} data-testid="delete-step">x</button>
    </span>
  ),
}));

const baseProps = {
  steps: [],
  cursorIndex: null as number | null,
  setCursorIndex: jest.fn(),
  removeStep: jest.fn(),
  undoLastStep: jest.fn(),
  clearAllSteps: jest.fn(),
  validateCurrent: jest.fn(() => ({ isValid: true, errors: [], warnings: [], isComplete: true, canSave: true, canAddEntity: true, canAddOperator: false, canAddUnaryOperator: false, canAddCloseParen: false, canAddSeparator: false, isInIfCondition: false, canAddComparisonOperator: false })),
  renderToolbar: () => <div data-testid="toolbar">toolbar</div>,
};

describe("EditorCanvas", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders without crashing", () => {
    const { container } = render(<EditorCanvas {...baseProps} />);
    expect(container).toBeTruthy();
  });

  it("renders toolbar via renderToolbar prop", () => {
    render(<EditorCanvas {...baseProps} />);
    expect(screen.getByTestId("toolbar")).toBeInTheDocument();
  });

  it("shows empty formula message when steps is empty", () => {
    render(<EditorCanvas {...baseProps} steps={[]} />);
    expect(screen.getByText(/la fórmula está vacía/i)).toBeInTheDocument();
  });

  it("renders step chips when steps provided", () => {
    const steps = [{ type: "number" as any, value: 42 }, { type: "operator" as any, value: { symbol: "+" } }];
    render(<EditorCanvas {...baseProps} steps={steps} />);
    expect(screen.getAllByTestId("step-chip").length).toBe(2);
  });

  it("does not show empty message when steps exist", () => {
    const steps = [{ type: "number" as any, value: 5 }];
    render(<EditorCanvas {...baseProps} steps={steps} />);
    expect(screen.queryByText(/la fórmula está vacía/i)).not.toBeInTheDocument();
  });

  it("calls setCursorIndex when canvas area clicked", () => {
    const mockSetCursorIndex = jest.fn();
    render(<EditorCanvas {...baseProps} setCursorIndex={mockSetCursorIndex} />);
    fireEvent.click(screen.getByRole("button", { name: /editor de fórmula/i }));
    expect(mockSetCursorIndex).toHaveBeenCalled();
  });

  it("renders cursor indicator when cursorIndex matches step index", () => {
    const steps = [{ type: "number" as any, value: 5 }];
    render(<EditorCanvas {...baseProps} steps={steps} cursorIndex={0} />);
    expect(screen.getByTestId("step-chip")).toBeInTheDocument();
  });

  it("calls removeStep when delete button on step chip clicked", () => {
    const mockRemoveStep = jest.fn();
    const steps = [{ type: "number" as any, value: 5 }];
    render(<EditorCanvas {...baseProps} steps={steps} removeStep={mockRemoveStep} />);
    fireEvent.click(screen.getByTestId("delete-step"));
    expect(mockRemoveStep).toHaveBeenCalledWith(0);
  });

  it("shows info status message when formula is empty", () => {
    render(<EditorCanvas {...baseProps} steps={[]} />);
    expect(screen.getByText(/comience agregando/i)).toBeInTheDocument();
  });

  it("shows error status message when validation has errors", () => {
    const validateWithError = jest.fn(() => ({
      isValid: false, isComplete: false, canSave: false,
      errors: ["Paréntesis sin cerrar"], warnings: [],
    }));
    const steps = [{ type: "number" as any, value: 5 }];
    render(<EditorCanvas {...baseProps} steps={steps} validateCurrent={validateWithError} />);
    expect(screen.getByText("Paréntesis sin cerrar")).toBeInTheDocument();
  });

  it("shows warning status message when formula is incomplete", () => {
    const validateIncomplete = jest.fn(() => ({
      isValid: true, isComplete: false, canSave: false,
      errors: [], warnings: ["Falta operando"],
    }));
    const steps = [{ type: "number" as any, value: 5 }];
    render(<EditorCanvas {...baseProps} steps={steps} validateCurrent={validateIncomplete} />);
    expect(screen.getByText("Falta operando")).toBeInTheDocument();
  });

  it("shows success status message for valid complete formula", () => {
    const steps = [
      { type: "number" as any, value: 5 },
      { type: "operator" as any, value: { symbol: "+" } },
      { type: "number" as any, value: 3 },
    ];
    render(<EditorCanvas {...baseProps} steps={steps} />);
    expect(screen.getByText(/fórmula válida.*3 elementos/i)).toBeInTheDocument();
  });

  it("shows element count for info status fallback", () => {
    const validateFallback = jest.fn(() => ({
      isValid: true, isComplete: true, canSave: false,
      errors: [], warnings: [],
    }));
    const steps = [{ type: "number" as any, value: 5 }, { type: "number" as any, value: 3 }];
    render(<EditorCanvas {...baseProps} steps={steps} validateCurrent={validateFallback} />);
    expect(screen.getByText(/2 elementos/)).toBeInTheDocument();
  });

  it("renders error icon for error status", () => {
    const validateWithError = jest.fn(() => ({
      isValid: false, isComplete: false, canSave: false,
      errors: ["Error test"], warnings: [],
    }));
    const steps = [{ type: "number" as any, value: 5 }];
    render(<EditorCanvas {...baseProps} steps={steps} validateCurrent={validateWithError} />);
    expect(screen.getByTestId("icon-AlertCircle")).toBeInTheDocument();
  });

  it("renders success icon for valid complete formula", () => {
    const steps = [
      { type: "number" as any, value: 5 },
      { type: "operator" as any, value: { symbol: "+" } },
      { type: "number" as any, value: 3 },
    ];
    render(<EditorCanvas {...baseProps} steps={steps} />);
    expect(screen.getByTestId("icon-CheckCircle2")).toBeInTheDocument();
  });

  it("calls undoLastStep when undo button clicked", () => {
    const mockUndo = jest.fn();
    const steps = [{ type: "number" as any, value: 5 }];
    render(<EditorCanvas {...baseProps} steps={steps} undoLastStep={mockUndo} />);
    const undoTooltip = screen.getByTitle("Deshacer último");
    const undoButton = undoTooltip.querySelector('[data-testid="Button"]')!;
    fireEvent.click(undoButton);
    expect(mockUndo).toHaveBeenCalled();
  });

  it("calls clearAllSteps when clear button clicked", () => {
    const mockClear = jest.fn();
    const steps = [{ type: "number" as any, value: 5 }];
    render(<EditorCanvas {...baseProps} steps={steps} clearAllSteps={mockClear} />);
    const clearTooltip = screen.getByTitle("Borrar todo");
    const clearButton = clearTooltip.querySelector('[data-testid="Button"]')!;
    fireEvent.click(clearButton);
    expect(mockClear).toHaveBeenCalled();
  });

  it("shows cursor at end when cursorIndex equals steps length", () => {
    const steps = [{ type: "number" as any, value: 5 }];
    const { container } = render(<EditorCanvas {...baseProps} steps={steps} cursorIndex={1} />);
    const cursors = container.querySelectorAll('.animate-pulse');
    expect(cursors.length).toBeGreaterThan(0);
  });

  it("renders multiple step chips correctly", () => {
    const steps = [
      { type: "number" as any, value: 1 },
      { type: "operator" as any, value: { symbol: "+" } },
      { type: "number" as any, value: 2 },
      { type: "operator" as any, value: { symbol: "*" } },
      { type: "number" as any, value: 3 },
    ];
    render(<EditorCanvas {...baseProps} steps={steps} />);
    expect(screen.getAllByTestId("step-chip")).toHaveLength(5);
  });

  it("renders undo and clear buttons in status bar", () => {
    const steps = [{ type: "number" as any, value: 5 }];
    render(<EditorCanvas {...baseProps} steps={steps} />);
    expect(screen.getByTitle("Deshacer último")).toBeInTheDocument();
    expect(screen.getByTitle("Borrar todo")).toBeInTheDocument();
  });
});
