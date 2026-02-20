import { render, screen } from "@testing-library/react";
import { CdpDistributionChart } from "./CdpDistributionChart";

jest.mock("recharts", () => ({
  Pie: () => null,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Cell: () => null,
}));
jest.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  ChartTooltip: () => null,
  ChartTooltipContent: () => null,
  ChartLegend: () => null,
  ChartLegendContent: () => null,
}));

const cdpData = [
  { number: "CDP-001", totalValue: 5000000, needId: "n1", contractId: null },
];

describe("CdpDistributionChart", () => {
  it("renders title", () => {
    render(<CdpDistributionChart data={[]} title="CDP Test" />);
    expect(screen.getByText("CDP Test")).toBeInTheDocument();
  });

  it("renders empty state when no data", () => {
    render(<CdpDistributionChart data={[]} title="CDP" />);
    expect(screen.getByText("No hay CDPs asociados")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<CdpDistributionChart data={[]} title="CDP" description="Descripción de prueba" />);
    expect(screen.getByText("Descripción de prueba")).toBeInTheDocument();
  });

  it("renders with data items", () => {
    render(<CdpDistributionChart data={cdpData as any} title="CDPs por Necesidad" />);
    expect(screen.getByText("CDPs por Necesidad")).toBeInTheDocument();
  });

  it("does not show empty state when data present", () => {
    render(<CdpDistributionChart data={cdpData as any} title="CDPs" />);
    expect(screen.queryByText("No hay CDPs asociados")).not.toBeInTheDocument();
  });
});
