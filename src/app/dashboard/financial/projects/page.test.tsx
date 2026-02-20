import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
import { get } from "@/lib/http";
import { requestExport } from "@/services/exports.service";

jest.mock("@/components/tables/DataTable", () => ({
  DataTable: (props: any) => {
    const { items = [], columns = [], topActions = [], rowActions = [], ariaLabel } = props;
    return (
      <div data-testid="data-table" aria-label={ariaLabel}>
        {topActions.map((a: any, i: number) => (
          <button key={i} data-testid={`top-${i}`} onClick={a.onClick}>{a.label}</button>
        ))}
        {items.map((item: any, idx: number) => (
          <div key={idx} data-testid={`row-${idx}`}>
            {columns.map((col: any) => (
              <span key={col.key} data-testid={`cell-${idx}-${col.key}`}>
                {col.render ? col.render(item) : String(item[col.key] ?? "")}
              </span>
            ))}
            {rowActions?.map((a: any, j: number) => (
              <button key={j} data-testid={`row-${idx}-action-${j}`} onClick={() => a.onClick?.(item)}>{a.label}</button>
            ))}
          </div>
        ))}
      </div>
    );
  },
}));
jest.mock("@/components/modals/financial/projects/ProjectDetailModal", () => ({ ProjectDetailModal: () => null }));

import ProjectsPage from "./page";

const mockGet = get as jest.Mock;
const mockExport = requestExport as jest.Mock;

const mockProject = {
  id: "1",
  code: "PROJ-001",
  name: "Proyecto de Prueba",
  currentBudget: "2000000",
  execution: "500000",
  financialExecutionPercentage: 0.25,
  origin: "Nacional",
  state: true,
  dependency: { name: "Área de Sistemas" },
};

describe("FinancialProjectsPage", () => {
  beforeEach(() => {
    mockGet.mockResolvedValue({ data: [mockProject], meta: { total: 1, page: 1, limit: 5, totalPages: 1 } });
    mockExport.mockResolvedValue({});
  });

  it("renders breadcrumbs", async () => {
    renderWithProviders(<ProjectsPage />);
    await waitFor(() => expect(screen.getByText("Proyectos")).toBeInTheDocument());
  });

  it("fetches and renders items in table", async () => {
    renderWithProviders(<ProjectsPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
  });

  it("renders project code cell", async () => {
    renderWithProviders(<ProjectsPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-code")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-code")).toHaveTextContent("PROJ-001");
  });

  it("renders currentBudget with currency", async () => {
    renderWithProviders(<ProjectsPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-currentBudget")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-currentBudget").textContent).toMatch(/\$|COP|2.000.000/);
  });

  it("renders state chip for active project", async () => {
    renderWithProviders(<ProjectsPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-state")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-state").textContent).toBe("Activo");
  });

  it("renders inactive state chip", async () => {
    mockGet.mockResolvedValueOnce({ data: [{ ...mockProject, id: "2", state: false }], meta: { total: 1, page: 1, limit: 5, totalPages: 1 } });
    renderWithProviders(<ProjectsPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-state")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-state").textContent).toBe("Inactivo");
  });

  it("top action 0 (refresh) refetches data", async () => {
    renderWithProviders(<ProjectsPage />);
    await waitFor(() => expect(screen.getByTestId("top-0")).toBeInTheDocument());
    const callsBefore = mockGet.mock.calls.length;
    fireEvent.click(screen.getByTestId("top-0"));
    await waitFor(() => expect(mockGet.mock.calls.length).toBeGreaterThan(callsBefore));
  });

  it("top action 1 (export) calls requestExport", async () => {
    renderWithProviders(<ProjectsPage />);
    await waitFor(() => expect(screen.getByTestId("top-1")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("top-1"));
    await waitFor(() => expect(mockExport).toHaveBeenCalled());
  });

  it("row action 0 (view) fetches project details", async () => {
    renderWithProviders(<ProjectsPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining(mockProject.id)));
  });

  it("shows error message on fetch failure", async () => {
    mockGet.mockRejectedValueOnce({ message: "Error de conexión" });
    renderWithProviders(<ProjectsPage />);
    await waitFor(() => expect(screen.getByText("Error de conexión")).toBeInTheDocument());
  });
});
