import { render, screen } from "@testing-library/react";
import { ViewPoaiPpaModal } from "@/components/modals/financial/poai-ppa/ViewPoaiPpaModal";

describe("ViewPoaiPpaModal", () => {
  const record = {
    id: "1",
    projectCode: "P001",
    project: { name: "Test Project" },
    year: 2024,
    projectedPoai: "1000000",
    assignedPoai: "800000",
  };
  const defaultProps = { isOpen: true, record: record as any, onClose: jest.fn() };

  it("renders when open", () => {
    render(<ViewPoaiPpaModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<ViewPoaiPpaModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows modal header", () => {
    render(<ViewPoaiPpaModal {...defaultProps} />);
    expect(screen.getByText("Detalle del Registro POAI PPA")).toBeInTheDocument();
  });

  it("shows project name", () => {
    render(<ViewPoaiPpaModal {...defaultProps} />);
    expect(screen.getByText("Test Project")).toBeInTheDocument();
  });

  it("shows Información del Proyecto section", () => {
    render(<ViewPoaiPpaModal {...defaultProps} />);
    expect(screen.getByText(/Información del Proyecto/)).toBeInTheDocument();
  });
});
