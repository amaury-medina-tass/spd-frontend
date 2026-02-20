import { render, screen } from "@testing-library/react";
import { TrendsChart } from "./TrendsChart";

jest.mock("recharts", () => ({
  Area: () => null,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  CartesianGrid: () => null,
  XAxis: () => null,
}));

jest.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  ChartTooltip: () => null,
  ChartTooltipContent: () => null,
  ChartLegend: () => null,
  ChartLegendContent: () => null,
}));

const twoYearData = [
  { year: 2021, totalProjected: 1_000_000, totalAssigned: 800_000 },
  { year: 2022, totalProjected: 2_000_000, totalAssigned: 1_200_000 },
];

describe("TrendsChart", () => {
  it("renders title", () => {
    render(<TrendsChart data={[]} />);
    expect(screen.getByText("Tendencias Globales")).toBeInTheDocument();
  });

  it("renders subtitle", () => {
    render(<TrendsChart data={[]} />);
    expect(screen.getByText("Consolidado de todos los proyectos")).toBeInTheDocument();
  });

  it("renders chart container with empty data", () => {
    render(<TrendsChart data={[]} />);
    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
  });

  it("renders chart container with data", () => {
    render(<TrendsChart data={twoYearData} />);
    expect(screen.getByTestId("chart-container")).toBeInTheDocument();
  });

  it("renders area chart element", () => {
    render(<TrendsChart data={twoYearData} />);
    expect(screen.getByTestId("area-chart")).toBeInTheDocument();
  });

  it("shows growth indicator when assigned increases", () => {
    render(<TrendsChart data={twoYearData} />);
    expect(screen.getByText(/crecimiento/i)).toBeInTheDocument();
  });

  it("does not show growth indicator with single data point", () => {
    render(<TrendsChart data={[{ year: 2021, totalProjected: 1_000_000, totalAssigned: 800_000 }]} />);
    expect(screen.queryByText(/crecimiento/i)).not.toBeInTheDocument();
  });
});
