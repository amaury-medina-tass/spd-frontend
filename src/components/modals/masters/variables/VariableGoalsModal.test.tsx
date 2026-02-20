import { render, screen } from "@testing-library/react";
import { VariableGoalsModal } from "./VariableGoalsModal";

jest.mock("./goals/AnnualGoalsTab", () => ({
  AnnualGoalsTab: () => <div>AnnualGoalsTab</div>,
}));
jest.mock("./goals/QuadrenniumGoalsTab", () => ({
  QuadrenniumGoalsTab: () => <div>QuadrenniumGoalsTab</div>,
}));

describe("VariableGoalsModal", () => {
  const defaultProps = {
    isOpen: true,
    variableId: "v1",
    variableCode: "VAR-001",
    onClose: jest.fn(),
  };

  it("renders when open", () => {
    render(<VariableGoalsModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<VariableGoalsModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows modal title", () => {
    render(<VariableGoalsModal {...defaultProps} />);
    expect(screen.getByText("Metas de la Variable")).toBeInTheDocument();
  });

  it("shows variable code when provided", () => {
    render(<VariableGoalsModal {...defaultProps} />);
    expect(screen.getByText(/VAR-001/)).toBeInTheDocument();
  });

  it("shows first tab content (AnnualGoalsTab)", () => {
    render(<VariableGoalsModal {...defaultProps} />);
    expect(screen.getByText("AnnualGoalsTab")).toBeInTheDocument();
  });

  it("shows Cerrar button", () => {
    render(<VariableGoalsModal {...defaultProps} />);
    expect(screen.getByText("Cerrar")).toBeInTheDocument();
  });

  it("renders without variableCode", () => {
    render(<VariableGoalsModal {...defaultProps} variableCode={undefined} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
