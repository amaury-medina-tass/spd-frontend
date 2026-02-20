import { render, screen } from "@testing-library/react";
import { ActionPlanIndicatorGoalsModal } from "@/components/modals/masters/indicators/action-plan/ActionPlanIndicatorGoalsModal";

jest.mock("@/components/modals/masters/indicators/action-plan/goals/ActionPlanAnnualGoalsTab", () => ({
  ActionPlanAnnualGoalsTab: () => <div>AnnualGoalsTab</div>,
}));
jest.mock("@/components/modals/masters/indicators/action-plan/goals/ActionPlanQuadrenniumGoalsTab", () => ({
  ActionPlanQuadrenniumGoalsTab: () => <div>QuadrenniumGoalsTab</div>,
}));

const defaultProps = {
  isOpen: true,
  indicatorId: "i1",
  indicatorCode: "IND-001",
  onClose: jest.fn(),
};

describe("ActionPlanIndicatorGoalsModal", () => {
  it("renders when open", () => {
    render(<ActionPlanIndicatorGoalsModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<ActionPlanIndicatorGoalsModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders modal title", () => {
    render(<ActionPlanIndicatorGoalsModal {...defaultProps} />);
    expect(screen.getByText("Metas del Indicador (Plan de Acción)")).toBeInTheDocument();
  });

  it("shows indicator code when provided", () => {
    render(<ActionPlanIndicatorGoalsModal {...defaultProps} />);
    expect(screen.getByText(/IND-001/)).toBeInTheDocument();
  });

  it("renders AnnualGoalsTab as default tab content", () => {
    render(<ActionPlanIndicatorGoalsModal {...defaultProps} />);
    expect(screen.getByText("AnnualGoalsTab")).toBeInTheDocument();
  });

  it("renders AnnualGoalsTab content", () => {
    render(<ActionPlanIndicatorGoalsModal {...defaultProps} />);
    expect(screen.getByText("AnnualGoalsTab")).toBeInTheDocument();
  });

  it("renders without indicatorCode", () => {
    render(<ActionPlanIndicatorGoalsModal isOpen={true} indicatorId="i1" onClose={jest.fn()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
