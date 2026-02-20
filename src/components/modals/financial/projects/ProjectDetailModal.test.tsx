import { render, screen } from "@testing-library/react";
import { ProjectDetailModal } from "./ProjectDetailModal";

describe("ProjectDetailModal", () => {
  const project = {
    id: "1",
    code: "PROJ-001",
    name: "Test Project",
    initialBudget: "1000000",
    currentBudget: "900000",
    execution: "500000",
    commitment: "300000",
    payments: "200000",
    invoiced: "100000",
    origin: "Nacional",
    state: true,
    createAt: "2025-01-01T00:00:00Z",
    updateAt: "2025-01-02T00:00:00Z",
    dependency: { id: "d1", code: "DEP-01", name: "Dependencia Test" },
    financialExecutionPercentage: 0.55,
  };
  const defaultProps = { isOpen: true, project: project as any, onClose: jest.fn() };

  it("renders when open", () => {
    render(<ProjectDetailModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<ProjectDetailModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows project code in header", () => {
    render(<ProjectDetailModal {...defaultProps} />);
    expect(screen.getByText("Proyecto PROJ-001")).toBeInTheDocument();
  });

  it("shows project name", () => {
    render(<ProjectDetailModal {...defaultProps} />);
    expect(screen.getByText("Test Project")).toBeInTheDocument();
  });

  it("shows header subtitle", () => {
    render(<ProjectDetailModal {...defaultProps} />);
    expect(screen.getByText("Detalle del proyecto")).toBeInTheDocument();
  });
});
