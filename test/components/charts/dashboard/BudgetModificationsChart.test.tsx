import { render, screen } from "@testing-library/react";
import { BudgetModificationsChart } from "@/components/charts/dashboard/BudgetModificationsChart";

jest.mock("recharts", () => ({
  Bar: () => null,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));
jest.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  ChartTooltip: () => null,
  ChartTooltipContent: () => null,
  ChartLegend: () => null,
  ChartLegendContent: () => null,
}));

const emptyData = { modifications: [], totalAdditions: 0, totalReductions: 0, totalTransfers: 0 };
const withData = { modifications: [{ id: "1", type: "addition" }], totalAdditions: 100000, totalReductions: 0, totalTransfers: 0 };

describe("BudgetModificationsChart", () => {
  it("renders title", () => {
    render(<BudgetModificationsChart data={emptyData as any} activityBudgetCeiling={1000} activityBalance={500} />);
    expect(screen.getByText("Ajustes Presupuestales")).toBeInTheDocument();
  });

  it("renders empty state when no modifications", () => {
    render(<BudgetModificationsChart data={emptyData as any} activityBudgetCeiling={1000} activityBalance={500} />);
    expect(screen.getByText("No hay ajustes registrados")).toBeInTheDocument();
  });

  it("renders with modification data", () => {
    render(<BudgetModificationsChart data={withData as any} activityBudgetCeiling={1000} activityBalance={500} />);
    expect(screen.getByText("Ajustes Presupuestales")).toBeInTheDocument();
  });

  it("does not show empty state when modifications present", () => {
    render(<BudgetModificationsChart data={withData as any} activityBudgetCeiling={1000} activityBalance={500} />);
    expect(screen.queryByText("No hay ajustes registrados")).not.toBeInTheDocument();
  });

  it("shows Adiciones subtitle text when totalAdditions present", () => {
    render(<BudgetModificationsChart data={withData as any} activityBudgetCeiling={1000} activityBalance={500} />);
    expect(screen.getByText(/Adiciones/)).toBeInTheDocument();
  });
});
