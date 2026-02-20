import { render, screen } from "@testing-library/react";
import { VariableDetailModal } from "./VariableDetailModal";

const mockVariable = {
  id: "v1",
  code: "VAR-001",
  name: "Test Variable",
  observations: "Some observations",
  createAt: "2024-01-01T00:00:00Z",
  updateAt: "2024-01-02T00:00:00Z",
};

describe("VariableDetailModal", () => {
  const defaultProps = {
    isOpen: true,
    variable: mockVariable as any,
    onClose: jest.fn(),
  };

  it("renders when open", () => {
    render(<VariableDetailModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when variable is null", () => {
    render(<VariableDetailModal {...defaultProps} variable={null} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<VariableDetailModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows modal title", () => {
    render(<VariableDetailModal {...defaultProps} />);
    expect(screen.getByText("Detalle de Variable")).toBeInTheDocument();
  });

  it("shows label headings", () => {
    render(<VariableDetailModal {...defaultProps} />);
    expect(screen.getByText("Código")).toBeInTheDocument();
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("Observaciones")).toBeInTheDocument();
  });

  it("shows variable code and name", () => {
    render(<VariableDetailModal {...defaultProps} />);
    expect(screen.getByText("VAR-001")).toBeInTheDocument();
    expect(screen.getByText("Test Variable")).toBeInTheDocument();
  });

  it("shows observations text", () => {
    render(<VariableDetailModal {...defaultProps} />);
    expect(screen.getByText("Some observations")).toBeInTheDocument();
  });

  it("shows date section labels", () => {
    render(<VariableDetailModal {...defaultProps} />);
    expect(screen.getByText("Fecha de Creación")).toBeInTheDocument();
    expect(screen.getByText("Última Actualización")).toBeInTheDocument();
  });
});
