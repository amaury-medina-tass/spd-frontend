import { render, screen, waitFor, fireEvent } from "@testing-library/react";

jest.mock("@/components/tables/DataTable", () => ({
  DataTable: (props: any) => {
    const { items = [], columns = [], topActions = [], rowActions = [], ariaLabel } = props;
    return (
      <div data-testid="data-table" aria-label={ariaLabel}>
        {topActions.map((a: any, i: number) => (
          <button key={i} data-testid={`top-${i}`} onClick={a.onClick}>{a.label}</button>
        ))}
        {items.map((item: any, idx: number) => (
          <div key={idx} data-testid={`row-${idx}`}>
            {columns.map((col: any) => (
              <span key={col.key} data-testid={`cell-${idx}-${col.key}`}>
                {col.render ? col.render(item) : String(item[col.key] ?? "")}
              </span>
            ))}
            {rowActions?.map((a: any, j: number) => (
              <button key={j} data-testid={`row-${idx}-action-${j}`} onClick={() => a.onClick?.(item)}>{a.label}</button>
            ))}
          </div>
        ))}
      </div>
    );
  },
}));

const mockGetActionPlanIndicatorsByLocation = jest.fn();

jest.mock("@/services/masters/indicators.service", () => ({
  getActionPlanIndicatorsByLocation: (...args: any[]) => mockGetActionPlanIndicatorsByLocation(...args),
}));
jest.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

import { DashboardActionPlanTab } from "@/components/dashboard/DashboardActionPlanTab";

const sampleItems = [
  { id: "1", code: "ACT-001", statisticalCode: "S001", name: "Indicador Acción", unitMeasure: { name: "Unidad" }, plannedQuantity: 100, compliancePercentage: "85", matchSource: "direct" },
  { id: "2", code: "ACT-002", statisticalCode: "S002", name: "Otro Indicador", unitMeasure: null, plannedQuantity: 50, compliancePercentage: "110", matchSource: "variable" },
];

describe("DashboardActionPlanTab", () => {
  beforeEach(() => {
    mockGetActionPlanIndicatorsByLocation.mockResolvedValue({ data: sampleItems, meta: { total: 2, page: 1, limit: 10, totalPages: 1 } });
  });

  it("renders data table", async () => {
    render(<DashboardActionPlanTab communeId={null} onViewVariables={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId("data-table")).toBeInTheDocument());
  });

  it("calls getActionPlanIndicatorsByLocation on mount with 'all' when communeId is null", async () => {
    render(<DashboardActionPlanTab communeId={null} onViewVariables={jest.fn()} />);
    await waitFor(() => expect(mockGetActionPlanIndicatorsByLocation).toHaveBeenCalledWith("all", expect.any(String)));
  });

  it("calls with communeId when provided", async () => {
    render(<DashboardActionPlanTab communeId="commune-1" onViewVariables={jest.fn()} />);
    await waitFor(() => expect(mockGetActionPlanIndicatorsByLocation).toHaveBeenCalledWith("commune-1", expect.any(String)));
  });

  it("renders items in table", async () => {
    render(<DashboardActionPlanTab communeId={null} onViewVariables={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    expect(screen.getByTestId("row-1")).toBeInTheDocument();
  });

  it("renders unitMeasure.name in cell", async () => {
    render(<DashboardActionPlanTab communeId={null} onViewVariables={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId("cell-0-unitMeasure")).toHaveTextContent("Unidad"));
  });

  it("renders N/A when unitMeasure is null", async () => {
    render(<DashboardActionPlanTab communeId={null} onViewVariables={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId("cell-1-unitMeasure")).toHaveTextContent("N/A"));
  });

  it("renders matchSource 'Directo' chip for direct", async () => {
    render(<DashboardActionPlanTab communeId={null} onViewVariables={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId("cell-0-matchSource")).toHaveTextContent("Directo"));
  });

  it("renders matchSource 'Variable' chip for variable", async () => {
    render(<DashboardActionPlanTab communeId={null} onViewVariables={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId("cell-1-matchSource")).toHaveTextContent("Variable"));
  });

  it("calls onViewVariables when row action clicked", async () => {
    const mockOnViewVariables = jest.fn();
    render(<DashboardActionPlanTab communeId={null} onViewVariables={mockOnViewVariables} />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    expect(mockOnViewVariables).toHaveBeenCalledWith(sampleItems[0]);
  });

  it("refresh button triggers refetch", async () => {
    mockGetActionPlanIndicatorsByLocation.mockClear();
    render(<DashboardActionPlanTab communeId={null} onViewVariables={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId("top-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("top-0"));
    await waitFor(() => expect(mockGetActionPlanIndicatorsByLocation).toHaveBeenCalledTimes(2));
  });

  it("shows error state when fetch fails", async () => {
    mockGetActionPlanIndicatorsByLocation.mockRejectedValue(new Error("Error de red"));
    render(<DashboardActionPlanTab communeId={null} onViewVariables={jest.fn()} />);
    await waitFor(() => expect(screen.getByText("Error de red")).toBeInTheDocument());
  });
});
