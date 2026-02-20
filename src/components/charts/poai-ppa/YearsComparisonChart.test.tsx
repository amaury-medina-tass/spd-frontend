import { render, screen } from "@testing-library/react";
import { YearsComparisonChart } from "./YearsComparisonChart";

jest.mock("recharts", () => ({
  Bar: () => null,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
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
  Tooltip: () => null,
  Legend: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  ChartTooltip: () => null,
  ChartTooltipContent: () => null,
  ChartLegend: () => null,
  ChartLegendContent: () => null,
}));

const sampleData = [
  { id: "1", year: 2022, projectedPoai: "1000000", assignedPoai: "800000" },
  { id: "2", year: 2023, projectedPoai: "2000000", assignedPoai: "1500000" },
  { id: "3", year: 2024, projectedPoai: "1500000000", assignedPoai: "1000000000" },
];

describe("YearsComparisonChart", () => {
  it("renders title", () => {
    render(<YearsComparisonChart data={[]} />);
    expect(screen.getByText("Comparativa Anual")).toBeInTheDocument();
  });

  it("renders subtitle", () => {
    render(<YearsComparisonChart data={[]} />);
    expect(screen.getByText(/proyectado vs asignado/i)).toBeInTheDocument();
  });

  it("renders with data without crashing", () => {
    const { container } = render(<YearsComparisonChart data={sampleData as any} />);
    expect(container).toBeTruthy();
  });

  it("renders with empty data", () => {
    render(<YearsComparisonChart data={[]} />);
    expect(screen.getByText("Comparativa Anual")).toBeInTheDocument();
  });

  it("renders with single data point", () => {
    render(<YearsComparisonChart data={[sampleData[0]] as any} />);
    expect(screen.getByText("Comparativa Anual")).toBeInTheDocument();
  });
});
