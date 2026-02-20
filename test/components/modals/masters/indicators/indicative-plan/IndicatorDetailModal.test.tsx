import { render, screen } from "@testing-library/react";
import { IndicatorDetailModal } from "@/components/modals/masters/indicators/indicative-plan/IndicatorDetailModal";

const mockIndicator = {
  id: "i1",
  code: "IND-001",
  name: "Test Indicator",
  description: "Test Description",
  observations: "Test Observations",
  baseline: "50",
  advancePercentage: 75,
  pillarCode: "P1",
  pillarName: "Pilar Uno",
  componentCode: "C1",
  componentName: "Componente Uno",
  programCode: "PR1",
  programName: "Programa Uno",
  unitMeasure: { name: "Porcentaje" },
  direction: { name: "Ascendente" },
  indicatorType: { name: "Resultado" },
};

describe("IndicatorDetailModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    indicator: mockIndicator as any,
  };

  it("renders when open", () => {
    render(<IndicatorDetailModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when indicator is null", () => {
    render(<IndicatorDetailModal {...defaultProps} indicator={null} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<IndicatorDetailModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows indicator code in header", () => {
    render(<IndicatorDetailModal {...defaultProps} />);
    expect(screen.getByText(/IND-001/)).toBeInTheDocument();
  });

  it("shows section labels Nombre and Descripción", () => {
    render(<IndicatorDetailModal {...defaultProps} />);
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("Descripción")).toBeInTheDocument();
  });

  it("shows section headers Medición and Alineación Estratégica", () => {
    render(<IndicatorDetailModal {...defaultProps} />);
    expect(screen.getByText("Medición")).toBeInTheDocument();
    expect(screen.getByText("Alineación Estratégica")).toBeInTheDocument();
  });

  it("shows advance percentage value", () => {
    render(<IndicatorDetailModal {...defaultProps} />);
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("shows Cerrar button", () => {
    render(<IndicatorDetailModal {...defaultProps} />);
    expect(screen.getByText("Cerrar")).toBeInTheDocument();
  });
});
