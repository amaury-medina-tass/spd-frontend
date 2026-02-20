import { render, screen, fireEvent, waitFor } from "@testing-library/react";

let capturedIndicativePlanProps: any = {};
let capturedVariablesModalProps: any = {};
let capturedAdvancesSectionProps: any = {};

jest.mock("@/components/dashboard/DashboardIndicativePlanTab", () => ({
  DashboardIndicativePlanTab: (props: any) => {
    capturedIndicativePlanProps = props;
    return (
      <div>
        <div>IndicativePlanTab</div>
        <button
          data-testid="trigger-view-variables"
          onClick={() =>
            props.onViewVariables?.({
              id: "ind1",
              code: "IND-001",
              matchSource: "indicative",
            })
          }
        >
          View Variables
        </button>
      </div>
    );
  },
}));
jest.mock("@/components/dashboard/DashboardActionPlanTab", () => ({
  DashboardActionPlanTab: () => <div data-testid="action-plan-tab">ActionPlanTab</div>,
}));
jest.mock("@/components/dashboard/IndicatorVariablesModal", () => ({
  IndicatorVariablesModal: (props: any) => {
    capturedVariablesModalProps = props;
    return props.isOpen ? (
      <div data-testid="variables-modal">
        <button
          data-testid="trigger-view-advances"
          onClick={() => props.onViewVariableAdvances?.("var1", "VAR-001", "Variable 1")}
        >
          View Advances
        </button>
      </div>
    ) : null;
  },
}));
jest.mock("@/components/dashboard/VariableAdvancesChartsSection", () => ({
  VariableAdvancesChartsSection: (props: any) => {
    capturedAdvancesSectionProps = props;
    return (
      <div data-testid="variable-advances-section">
        <button data-testid="close-advances" onClick={props.onClose}>
          Close
        </button>
      </div>
    );
  },
}));
jest.mock("@/services/sub/variable-advances.service", () => ({
  getIndicatorVariablesLocations: jest.fn().mockResolvedValue([]),
}));

import Home from "@/app/dashboard/page";

describe("DashboardPage", () => {
  beforeEach(() => {
    capturedIndicativePlanProps = {};
    capturedVariablesModalProps = {};
    capturedAdvancesSectionProps = {};
  });

  it("renders map", () => {
    render(<Home />);
    expect(screen.getByTestId("map")).toBeInTheDocument();
  });

  it("renders plan indicativo tab by default", () => {
    render(<Home />);
    expect(screen.getByText("Plan Indicativo")).toBeInTheDocument();
  });

  it("renders plan de acción tab pill", () => {
    render(<Home />);
    expect(screen.getByText("Plan de Acción")).toBeInTheDocument();
  });

  it("renders commune legend", () => {
    render(<Home />);
    expect(screen.getByText("Leyenda de Zonas")).toBeInTheDocument();
  });

  it("renders Todos los Indicadores by default", () => {
    render(<Home />);
    expect(screen.getByText("Todos los Indicadores")).toBeInTheDocument();
  });

  it("switching to Plan de Acción shows action tab", () => {
    render(<Home />);
    fireEvent.click(screen.getByText("Plan de Acción"));
    expect(screen.getByTestId("action-plan-tab")).toBeInTheDocument();
  });

  it("clicking commune chip sets selected commune", () => {
    render(<Home />);
    // click "Popular" (which is commune 1 "Comuna 1 - Popular" with prefix stripped)
    fireEvent.click(screen.getByText("Popular"));
    // selected region name shown in header
    expect(screen.getByText("Comuna 1 - Popular")).toBeInTheDocument();
  });

  it("clicking Ver Todos clears commune selection", () => {
    render(<Home />);
    fireEvent.click(screen.getByText("Popular"));
    expect(screen.getByText("Comuna 1 - Popular")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Ver Todos"));
    expect(screen.getByText("Todos los Indicadores")).toBeInTheDocument();
  });

  it("clicking a corregimiento chip sets selection with Corregimiento prefix", () => {
    render(<Home />);
    // "San Sebastián de Palmitas" has no replacing prefix since it has no "Comuna X - " prefix
    fireEvent.click(screen.getByText("San Sebastián de Palmitas"));
    expect(screen.getByText("Corregimiento San Sebastián de Palmitas")).toBeInTheDocument();
  });

  it("handleViewVariables opens variables modal", async () => {
    render(<Home />);
    fireEvent.click(screen.getByTestId("trigger-view-variables"));
    await waitFor(() => expect(screen.getByTestId("variables-modal")).toBeInTheDocument());
  });

  it("handleViewVariables calls getIndicatorVariablesLocations", async () => {
    const { getIndicatorVariablesLocations } = await import(
      "@/services/sub/variable-advances.service"
    );
    render(<Home />);
    fireEvent.click(screen.getByTestId("trigger-view-variables"));
    await waitFor(() =>
      expect(getIndicatorVariablesLocations).toHaveBeenCalledWith("ind1", "indicative")
    );
  });

  it("handleViewVariableAdvances shows variable advances section", async () => {
    render(<Home />);
    // open variables modal first
    fireEvent.click(screen.getByTestId("trigger-view-variables"));
    await waitFor(() => expect(screen.getByTestId("variables-modal")).toBeInTheDocument());
    // trigger view advances
    fireEvent.click(screen.getByTestId("trigger-view-advances"));
    expect(screen.getByTestId("variable-advances-section")).toBeInTheDocument();
  });

  it("closing variable advances section hides it", async () => {
    render(<Home />);
    fireEvent.click(screen.getByTestId("trigger-view-variables"));
    await waitFor(() => expect(screen.getByTestId("variables-modal")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("trigger-view-advances"));
    expect(screen.getByTestId("variable-advances-section")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("close-advances"));
    expect(screen.queryByTestId("variable-advances-section")).not.toBeInTheDocument();
  });

  it("communeId prop is passed to tab when commune selected", () => {
    render(<Home />);
    fireEvent.click(screen.getByText("Popular"));
    // DashboardIndicativePlanTab receives communeId
    expect(capturedIndicativePlanProps.communeId).toBe("1");
  });

  it("communeId is null by default in tab props", () => {
    render(<Home />);
    expect(capturedIndicativePlanProps.communeId).toBeNull();
  });
});
