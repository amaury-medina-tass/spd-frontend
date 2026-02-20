import { render, screen } from "@testing-library/react";
import { IndicativePlanIndicatorGoalsModal } from "@/components/modals/masters/indicators/indicative-plan/IndicativePlanIndicatorGoalsModal";

jest.mock("@/components/modals/masters/indicators/indicative-plan/goals/IndicativeAnnualGoalsTab", () => ({
  IndicativeAnnualGoalsTab: () => <div>AnnualGoalsTab</div>,
}));
jest.mock("@/components/modals/masters/indicators/indicative-plan/goals/IndicativeQuadrenniumGoalsTab", () => ({
  IndicativeQuadrenniumGoalsTab: () => <div>QuadrenniumGoalsTab</div>,
}));

describe("IndicativePlanIndicatorGoalsModal", () => {
  const defaultProps = {
    isOpen: true,
    indicatorId: "i1",
    indicatorCode: "IND-001",
    onClose: jest.fn(),
  };

  it("renders when open", () => {
    render(<IndicativePlanIndicatorGoalsModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<IndicativePlanIndicatorGoalsModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows modal title", () => {
    render(<IndicativePlanIndicatorGoalsModal {...defaultProps} />);
    expect(screen.getByText("Metas del Indicador")).toBeInTheDocument();
  });

  it("shows indicator code when provided", () => {
    render(<IndicativePlanIndicatorGoalsModal {...defaultProps} />);
    expect(screen.getByText(/IND-001/)).toBeInTheDocument();
  });

  it("shows first tab content (AnnualGoalsTab)", () => {
    render(<IndicativePlanIndicatorGoalsModal {...defaultProps} />);
    expect(screen.getByText("AnnualGoalsTab")).toBeInTheDocument();
  });

  it("shows Cerrar button", () => {
    render(<IndicativePlanIndicatorGoalsModal {...defaultProps} />);
    expect(screen.getByText("Cerrar")).toBeInTheDocument();
  });

  it("renders without indicatorCode", () => {
    render(<IndicativePlanIndicatorGoalsModal {...defaultProps} indicatorCode={undefined} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
