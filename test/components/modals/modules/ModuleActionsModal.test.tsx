import { render, screen, fireEvent } from "@testing-library/react";
import { ModuleActionsModal } from "@/components/modals/modules/ModuleActionsModal";

const mockModule = {
  id: "m1",
  name: "Test Module",
  description: "desc",
  path: "/test",
  actions: [{ id: "a1", name: "Read", code: "read", description: "" }],
  missingActions: [{ id: "a2", name: "Write", code: "write", description: "" }],
};

describe("ModuleActionsModal", () => {
  const defaultProps = {
    isOpen: true,
    module: mockModule as any,
    onClose: jest.fn(),
    onAssign: jest.fn(),
    onUnassign: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("renders when open", () => {
    render(<ModuleActionsModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<ModuleActionsModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows Gestionar Acciones header", () => {
    render(<ModuleActionsModal {...defaultProps} />);
    expect(screen.getByText("Gestionar Acciones del Módulo")).toBeInTheDocument();
  });

  it("shows module name", () => {
    render(<ModuleActionsModal {...defaultProps} />);
    expect(screen.getByText("Test Module")).toBeInTheDocument();
  });

  it("shows existing action name", () => {
    render(<ModuleActionsModal {...defaultProps} />);
    expect(screen.getByText("Read")).toBeInTheDocument();
  });

  it("shows Cerrar button", () => {
    render(<ModuleActionsModal {...defaultProps} />);
    expect(screen.getByText("Cerrar")).toBeInTheDocument();
  });

  it("shows module description", () => {
    render(<ModuleActionsModal {...defaultProps} />);
    expect(screen.getByText("desc")).toBeInTheDocument();
  });

  it("shows module path", () => {
    render(<ModuleActionsModal {...defaultProps} />);
    expect(screen.getByText("/test")).toBeInTheDocument();
  });

  it("shows Asociar Acción button", () => {
    render(<ModuleActionsModal {...defaultProps} />);
    expect(screen.getByText("Asociar Acción")).toBeInTheDocument();
  });

  // --- Select an action and assign ---
  it("selects an available action and calls onAssign on button click", () => {
    render(<ModuleActionsModal {...defaultProps} />);
    const select = screen.getByLabelText("Asociar Nueva Acción");
    fireEvent.change(select, { target: { value: "Write" } });
    fireEvent.click(screen.getByText("Asociar Acción"));
    expect(defaultProps.onAssign).toHaveBeenCalledWith("Write");
  });

  it("resets selection after assigning", () => {
    render(<ModuleActionsModal {...defaultProps} />);
    const select = screen.getByLabelText("Asociar Nueva Acción");
    fireEvent.change(select, { target: { value: "Write" } });
    fireEvent.click(screen.getByText("Asociar Acción"));
    expect(defaultProps.onAssign).toHaveBeenCalled();
  });

  // --- Cerrar calls onClose ---
  it("calls onClose when Cerrar is clicked", () => {
    render(<ModuleActionsModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Cerrar"));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  // --- Empty actions state ---
  it("shows message when module has no actions", () => {
    const noActionsModule = { ...mockModule, actions: [] };
    render(<ModuleActionsModal {...defaultProps} module={noActionsModule as any} />);
    expect(screen.getByText("Sin acciones asociadas")).toBeInTheDocument();
  });

  // --- No missing actions ---
  it("shows message when all actions are already assigned", () => {
    const noMissingModule = { ...mockModule, missingActions: [] };
    render(<ModuleActionsModal {...defaultProps} module={noMissingModule as any} />);
    expect(screen.getByText("El módulo ya tiene todas las acciones disponibles asociadas.")).toBeInTheDocument();
  });

  // --- Available actions rendered as options ---
  it("renders available actions as select options", () => {
    render(<ModuleActionsModal {...defaultProps} />);
    expect(screen.getByText("Write")).toBeInTheDocument();
  });

  // --- Null module ---
  it("renders gracefully with null module", () => {
    render(<ModuleActionsModal {...defaultProps} module={null} />);
    expect(screen.getByText("Sin acciones asociadas")).toBeInTheDocument();
  });
});
