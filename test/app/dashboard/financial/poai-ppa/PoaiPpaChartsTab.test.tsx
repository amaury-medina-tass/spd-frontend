import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

jest.mock("@/lib/http", () => ({ get: jest.fn(() => Promise.resolve({ data: [] })) }));
jest.mock("@/lib/endpoints", () => ({
  endpoints: {
    financial: {
      projectsSelect: "/projects",
      poaiPpaTrends: "/trends",
      poaiPpaProjectYears: (id: string) => `/poai-ppa/project/${id}/years`,
      poaiPpaProjectSummary: (id: string) => `/poai-ppa/project/${id}/summary`,
      poaiPpaProjectEvolution: (id: string) => `/poai-ppa/project/${id}/evolution`,
    },
  },
}));
jest.mock("@/components/charts/poai-ppa/YearsComparisonChart", () => ({ YearsComparisonChart: () => <div>YearsChart</div> }));
jest.mock("@/components/charts/poai-ppa/ProjectSummaryKPIs", () => ({ ProjectSummaryKPIs: () => <div>KPIs</div> }));
jest.mock("@/components/charts/poai-ppa/EvolutionChart", () => ({ EvolutionChart: () => <div>Evolution</div> }));
jest.mock("@/components/charts/poai-ppa/TrendsChart", () => ({ TrendsChart: () => <div>Trends</div> }));
jest.mock("@/components/charts/poai-ppa/DashboardCharts", () => ({ DashboardCharts: () => <div>Dashboard</div> }));

import { PoaiPpaChartsTab } from "@/app/dashboard/financial/poai-ppa/PoaiPpaChartsTab";

const { get: mockGet } = require("@/lib/http");

describe("PoaiPpaChartsTab", () => {
  beforeEach(() => {
    mockGet.mockReset();
    // Route by URL to return correctly-shaped responses
    mockGet.mockImplementation((url: string) => {
      if (url.includes("/evolution")) return Promise.resolve({ evolution: [] });
      if (url.includes("/summary")) return Promise.resolve({ summary: null });
      return Promise.resolve({ data: [] }); // /projects, /trends, /years
    });
  });

  it("renders project selection section", () => {
    render(<PoaiPpaChartsTab />);
    expect(screen.getByText("Análisis por Proyecto")).toBeInTheDocument();
  });

  it("renders empty state when no project selected", () => {
    render(<PoaiPpaChartsTab />);
    expect(screen.getByText("Ningún proyecto seleccionado")).toBeInTheDocument();
  });

  it("renders without crashing", () => {
    const { container } = render(<PoaiPpaChartsTab />);
    expect(container).toBeTruthy();
  });

  it("renders project select initially", () => {
    render(<PoaiPpaChartsTab />);
    expect(screen.getByText(/Selecciona un proyecto/)).toBeInTheDocument();
  });

  it("fetches projects on mount", async () => {
    render(<PoaiPpaChartsTab />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("/projects")));
  });

  it("fetches trends on mount", async () => {
    render(<PoaiPpaChartsTab />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith("/trends"));
  });

  it("renders DashboardCharts and TrendsChart when trends data has items", async () => {
    const trendsResult = { data: [{ year: 2024, projected: 1000, assigned: 800 }] };
    mockGet.mockImplementation((url: string) => {
      if (url.includes("/trends")) return Promise.resolve(trendsResult);
      if (url.includes("/evolution")) return Promise.resolve({ evolution: [] });
      if (url.includes("/summary")) return Promise.resolve({ summary: null });
      return Promise.resolve({ data: [] });
    });
    render(<PoaiPpaChartsTab />);
    await waitFor(() => expect(screen.getByText("Dashboard")).toBeInTheDocument());
    expect(screen.getByText("Trends")).toBeInTheDocument();
  });

  it("triggers project-specific fetches when project is selected via select", async () => {
    render(<PoaiPpaChartsTab />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    // Force select value and trigger onChange - bypasses JSDOM option validation
    const select = screen.getByRole("combobox");
    act(() => {
      Object.defineProperty(select, "value", { writable: true, value: "proj1" });
      fireEvent.change(select);
    });
    await waitFor(() =>
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("/proj1/years"))
    );
  });

  it("renders clear button and clears project when clicked", async () => {
    render(<PoaiPpaChartsTab />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    // Force select value and trigger onChange
    const select = screen.getByRole("combobox");
    act(() => {
      Object.defineProperty(select, "value", { writable: true, value: "proj1" });
      fireEvent.change(select);
    });
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("/proj1/years")));
    // Clear button appears after project is selected
    const clearBtn = screen.getByLabelText("Limpiar");
    await act(async () => { clearBtn.click(); });
    expect(screen.getByText("Ningún proyecto seleccionado")).toBeInTheDocument();
  });
});
