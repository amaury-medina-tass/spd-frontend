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

const mockGetIndicatorsByLocation = jest.fn();

jest.mock("@/services/masters/indicators.service", () => ({
  getIndicatorsByLocation: (...args: any[]) => mockGetIndicatorsByLocation(...args),
}));
jest.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

import { DashboardIndicativePlanTab } from "./DashboardIndicativePlanTab";

const sampleItems = [
  { id: "1", code: "IND-001", pillarName: "Pilar 1", programName: "Prog A", name: "Indicador Indicativo", advancePercentage: "75", matchSource: "direct" },
  { id: "2", code: "IND-002", pillarName: "Pilar 2", programName: "Prog B", name: "Otro Indicador", advancePercentage: "105", matchSource: "variable" },
];

describe("DashboardIndicativePlanTab", () => {
  beforeEach(() => {
    mockGetIndicatorsByLocation.mockResolvedValue({ data: sampleItems, meta: { total: 2, page: 1, limit: 10, totalPages: 1 } });
  });

  it("renders data table", async () => {
    render(<DashboardIndicativePlanTab communeId={null} onViewVariables={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId("data-table")).toBeInTheDocument());
  });

  it("calls getIndicatorsByLocation with 'all' when communeId is null", async () => {
    render(<DashboardIndicativePlanTab communeId={null} onViewVariables={jest.fn()} />);
    await waitFor(() => expect(mockGetIndicatorsByLocation).toHaveBeenCalledWith("all", expect.any(String)));
  });

  it("calls with communeId when provided", async () => {
    render(<DashboardIndicativePlanTab communeId="commune-2" onViewVariables={jest.fn()} />);
    await waitFor(() => expect(mockGetIndicatorsByLocation).toHaveBeenCalledWith("commune-2", expect.any(String)));
  });

  it("renders items in table", async () => {
    render(<DashboardIndicativePlanTab communeId={null} onViewVariables={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
  });

  it("renders advancePercentage cell with '%'", async () => {
    render(<DashboardIndicativePlanTab communeId={null} onViewVariables={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId("cell-0-advancePercentage")).toHaveTextContent("75%"));
  });

  it("renders matchSource 'Directo' for direct", async () => {
    render(<DashboardIndicativePlanTab communeId={null} onViewVariables={jest.fn()} />);
    await waitFor(() => expect(screen.getByTestId("cell-0-matchSource")).toHaveTextContent("Directo"));
  });

  it("calls onViewVariables on row action click", async () => {
    const mockOnViewVariables = jest.fn();
    render(<DashboardIndicativePlanTab communeId={null} onViewVariables={mockOnViewVariables} />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    expect(mockOnViewVariables).toHaveBeenCalledWith(sampleItems[0]);
  });

  it("shows error state on fetch failure", async () => {
    mockGetIndicatorsByLocation.mockRejectedValue(new Error("Error de servidor"));
    render(<DashboardIndicativePlanTab communeId={null} onViewVariables={jest.fn()} />);
    await waitFor(() => expect(screen.getByText("Error de servidor")).toBeInTheDocument());
  });
});
