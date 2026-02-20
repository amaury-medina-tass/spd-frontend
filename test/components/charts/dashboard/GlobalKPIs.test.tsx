import { render, screen } from "@testing-library/react";
import { GlobalKPIs } from "@/components/charts/dashboard/GlobalKPIs";

describe("GlobalKPIs", () => {
  const data = {
    totalInitialBudget: 1000000,
    totalCurrentBudget: 1200000,
    totalExecution: 800000,
    totalAdditions: 300000,
    totalReductions: 100000,
    totalTransfers: 50,
    totalProjects: 10,
    totalNeeds: 20,
    totalCdps: 15,
    totalContracts: 5,
  };

  it("renders budget labels", () => {
    render(<GlobalKPIs data={data as any} />);
    expect(screen.getByText("Presupuesto Inicial")).toBeInTheDocument();
  });

  it("renders count labels", () => {
    render(<GlobalKPIs data={data as any} />);
    expect(screen.getByText("Proyectos")).toBeInTheDocument();
    expect(screen.getByText("Necesidades")).toBeInTheDocument();
  });

  it("shows Presupuesto Actual label", () => {
    render(<GlobalKPIs data={data as any} />);
    expect(screen.getByText("Presupuesto Actual")).toBeInTheDocument();
  });

  it("shows Ejecución Total label", () => {
    render(<GlobalKPIs data={data as any} />);
    expect(screen.getByText("Ejecución Total")).toBeInTheDocument();
  });

  it("shows CDPs label", () => {
    render(<GlobalKPIs data={data as any} />);
    expect(screen.getByText("CDPs")).toBeInTheDocument();
  });

  it("shows Contratos Marco label", () => {
    render(<GlobalKPIs data={data as any} />);
    expect(screen.getByText("Contratos Marco")).toBeInTheDocument();
  });
});
