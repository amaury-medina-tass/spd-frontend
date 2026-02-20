import { render, screen } from "@testing-library/react";
import { ProjectSummaryKPIs } from "@/components/charts/poai-ppa/ProjectSummaryKPIs";

const data = {
  totalProjected: 5000000,
  totalAssigned: 3000000,
  avgProjected: 1250000,
  avgAssigned: 750000,
  minYear: 2021,
  maxYear: 2024,
  yearCount: 4,
  executionRate: 60.0,
};

describe("ProjectSummaryKPIs", () => {
  it("renders labels", () => {
    render(<ProjectSummaryKPIs data={data} />);
    expect(screen.getByText("Total Proyectado")).toBeInTheDocument();
    expect(screen.getByText("Total Asignado")).toBeInTheDocument();
  });

  it("renders Cronograma label", () => {
    render(<ProjectSummaryKPIs data={data} />);
    expect(screen.getByText("Cronograma")).toBeInTheDocument();
  });

  it("renders Ejecución label", () => {
    render(<ProjectSummaryKPIs data={data} />);
    expect(screen.getByText("Ejecución")).toBeInTheDocument();
  });

  it("renders formatted totalProjected value", () => {
    render(<ProjectSummaryKPIs data={data} />);
    expect(screen.getByText("$5.0M")).toBeInTheDocument();
  });

  it("renders formatted totalAssigned value", () => {
    render(<ProjectSummaryKPIs data={data} />);
    expect(screen.getByText("$3.0M")).toBeInTheDocument();
  });

  it("renders year range", () => {
    render(<ProjectSummaryKPIs data={data} />);
    expect(screen.getByText("2021 - 2024")).toBeInTheDocument();
  });

  it("renders yearCount text", () => {
    render(<ProjectSummaryKPIs data={data} />);
    expect(screen.getByText("4 años de proyección")).toBeInTheDocument();
  });

  it("renders avg projected value", () => {
    render(<ProjectSummaryKPIs data={data} />);
    expect(screen.getAllByText(/Promedio anual:/i).length).toBeGreaterThan(0);
  });

  it("renders with billion values", () => {
    render(<ProjectSummaryKPIs data={{ ...data, totalProjected: 2_500_000_000, avgProjected: 500_000_000 }} />);
    expect(screen.getByText("$2.5B")).toBeInTheDocument();
  });

  it("renders with small values", () => {
    render(<ProjectSummaryKPIs data={{ ...data, totalProjected: 500, avgProjected: 125 }} />);
    expect(screen.getByText("$500")).toBeInTheDocument();
  });
});
