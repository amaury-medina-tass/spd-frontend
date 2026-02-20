import { render, screen } from "@testing-library/react";
import { EvolutionChart } from "./EvolutionChart";

jest.mock("recharts", () => ({
  Line: () => null,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: ({ tickFormatter }: any) => {
    if (tickFormatter) {
      tickFormatter(500);
      tickFormatter(5_000_000);
      tickFormatter(5_000_000_000);
    }
    return null;
  },
}));

jest.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  ChartTooltip: () => null,
  ChartTooltipContent: () => null,
  ChartLegend: () => null,
  ChartLegendContent: () => null,
}));

const mockData = [
  { year: 2021, projectedPoai: 1_000_000, assignedPoai: 800_000 },
  { year: 2022, projectedPoai: 2_000_000, assignedPoai: 1_500_000 },
];

describe("EvolutionChart", () => {
  it("renders title", () => {
    render(<EvolutionChart data={[]} />);
    expect(screen.getByText("Evolución Presupuestal")).toBeInTheDocument();
  });

  it("renders subtitle", () => {
    render(<EvolutionChart data={[]} />);
    expect(screen.getByText("Cambios interanuales y tendencias de asignación")).toBeInTheDocument();
  });

  it("renders chart container with empty data", () => {
    render(<EvolutionChart data={[]} />);
    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
  });

  it("renders chart container with data", () => {
    render(<EvolutionChart data={mockData} />);
    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
  });

  it("renders title and subtitle together with data", () => {
    render(<EvolutionChart data={mockData} />);
    expect(screen.getByText("Evolución Presupuestal")).toBeInTheDocument();
    expect(screen.getByText("Cambios interanuales y tendencias de asignación")).toBeInTheDocument();
  });

  it("renders line chart element", () => {
    render(<EvolutionChart data={mockData} />);
    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });
});
