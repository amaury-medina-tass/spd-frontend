import { render, screen } from "@testing-library/react";
import { ActionPlanIndicatorDetailModal } from "./ActionPlanIndicatorDetailModal";

describe("ActionPlanIndicatorDetailModal", () => {
  const indicator = {
    id: "i1",
    code: "IND-001",
    statisticalCode: "EST-001",
    name: "Test Indicator",
    description: "Descripción del indicador",
    baseline: "100",
    plannedQuantity: 200,
    executionCut: 150,
    compliancePercentage: 75,
    unitMeasure: { name: "Unidades" },
    indicatorType: { name: "Resultado" },
    createAt: "2024-01-01",
    updateAt: "2024-01-02",
  };

  it("renders when open", () => {
    render(<ActionPlanIndicatorDetailModal isOpen={true} onClose={jest.fn()} indicator={indicator as any} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<ActionPlanIndicatorDetailModal isOpen={false} onClose={jest.fn()} indicator={indicator as any} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows indicator code in header", () => {
    render(<ActionPlanIndicatorDetailModal isOpen={true} onClose={jest.fn()} indicator={indicator as any} />);
    expect(screen.getByText(/IND-001/)).toBeInTheDocument();
  });

  it("shows Nombre section", () => {
    render(<ActionPlanIndicatorDetailModal isOpen={true} onClose={jest.fn()} indicator={indicator as any} />);
    expect(screen.getByText("Nombre")).toBeInTheDocument();
  });

  it("shows Descripción section", () => {
    render(<ActionPlanIndicatorDetailModal isOpen={true} onClose={jest.fn()} indicator={indicator as any} />);
    expect(screen.getByText("Descripción")).toBeInTheDocument();
  });

  it("shows Metas y Ejecución section", () => {
    render(<ActionPlanIndicatorDetailModal isOpen={true} onClose={jest.fn()} indicator={indicator as any} />);
    expect(screen.getByText("Metas y Ejecución")).toBeInTheDocument();
  });

  it("shows Cerrar button", () => {
    render(<ActionPlanIndicatorDetailModal isOpen={true} onClose={jest.fn()} indicator={indicator as any} />);
    expect(screen.getByText("Cerrar")).toBeInTheDocument();
  });

  it("renders nothing when indicator is null", () => {
    render(<ActionPlanIndicatorDetailModal isOpen={true} onClose={jest.fn()} indicator={null} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
