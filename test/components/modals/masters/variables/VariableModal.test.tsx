import { render, screen } from "@testing-library/react";
import { VariableModal } from "@/components/modals/masters/variables/VariableModal";

describe("VariableModal", () => {
  const baseProps = {
    isOpen: true,
    title: "Crear Variable",
    initial: null,
    onClose: jest.fn(),
    onSave: jest.fn(),
  };

  it("renders title when open", () => {
    render(<VariableModal {...baseProps} />);
    expect(screen.getByText("Crear Variable")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<VariableModal {...baseProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows Código Input label", () => {
    render(<VariableModal {...baseProps} />);
    expect(screen.getByText("Código")).toBeInTheDocument();
  });

  it("shows Nombre Input label", () => {
    render(<VariableModal {...baseProps} />);
    expect(screen.getByText("Nombre")).toBeInTheDocument();
  });

  it("shows Cancelar button", () => {
    render(<VariableModal {...baseProps} />);
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("shows Guardar button", () => {
    render(<VariableModal {...baseProps} />);
    expect(screen.getByText("Guardar")).toBeInTheDocument();
  });
});
