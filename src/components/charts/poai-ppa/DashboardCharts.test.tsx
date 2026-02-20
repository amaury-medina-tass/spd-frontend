import { render, screen } from "@testing-library/react";
import { DashboardCharts } from "./DashboardCharts";

const sampleData = [
  { year: 2022, projectCount: 5, executionRate: 75.5, totalBudget: 1000000, executedBudget: 755000 },
  { year: 2023, projectCount: 8, executionRate: 82.3, totalBudget: 2000000, executedBudget: 1646000 },
  { year: 2024, projectCount: 12, executionRate: 60.1, totalBudget: 3000000, executedBudget: 1803000 },
];

describe("DashboardCharts", () => {
  it("renders title", () => {
    render(<DashboardCharts data={[]} />);
    expect(screen.getByText("Resumen Ejecutivo")).toBeInTheDocument();
  });

  it("renders subtitle", () => {
    render(<DashboardCharts data={[]} />);
    expect(screen.getByText(/proyectos activos vs tasa de ejecución/i)).toBeInTheDocument();
  });

  it("renders with data without crashing", () => {
    const { container } = render(<DashboardCharts data={sampleData} />);
    expect(container).toBeTruthy();
  });

  it("renders chart container", () => {
    render(<DashboardCharts data={sampleData} />);
    expect(screen.getByText("Resumen Ejecutivo")).toBeInTheDocument();
  });

  it("renders with empty data array", () => {
    render(<DashboardCharts data={[]} />);
    expect(screen.getByText("Resumen Ejecutivo")).toBeInTheDocument();
  });

  it("renders with single data point", () => {
    render(<DashboardCharts data={[sampleData[0]]} />);
    expect(screen.getByText("Resumen Ejecutivo")).toBeInTheDocument();
  });
});
