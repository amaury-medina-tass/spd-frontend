import { render, screen } from "@testing-library/react";
import { ProjectBudgetChart } from "./ProjectBudgetChart";

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

const projectData = [
  { code: "P001", currentBudget: 1000000, execution: 500000, available: 500000 },
];

describe("ProjectBudgetChart", () => {
  it("renders title", () => {
    render(<ProjectBudgetChart data={[]} />);
    expect(screen.getByText("Presupuesto por Proyecto")).toBeInTheDocument();
  });

  it("renders empty state when no data", () => {
    render(<ProjectBudgetChart data={[]} />);
    expect(screen.getByText("No hay datos de proyectos")).toBeInTheDocument();
  });

  it("renders subtitle when data present", () => {
    render(<ProjectBudgetChart data={projectData} />);
    expect(screen.getByText(/Comparación de presupuesto actual/)).toBeInTheDocument();
  });

  it("renders chart container when data present", () => {
    render(<ProjectBudgetChart data={projectData} />);
    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
  });

  it("does not show empty state when data present", () => {
    render(<ProjectBudgetChart data={projectData} />);
    expect(screen.queryByText("No hay datos de proyectos")).not.toBeInTheDocument();
  });
});
