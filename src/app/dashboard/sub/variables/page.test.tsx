import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
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
jest.mock("@/components/modals/sub/variables/VariableDashboardModal", () => ({ VariableDashboardModal: () => null }));

const mockGetMyVariables = jest.fn();
jest.mock("@/services/sub/variables.service", () => ({
  getMyVariables: (...args: any[]) => mockGetMyVariables(...args),
}));

import VariablesPage from "./page";

const mockExport = requestExport as jest.Mock;

const mockVariable = {
  id: "1",
  code: "VAR-001",
  name: "Variable Sub Test",
  observations: "Observación test",
  createAt: "2024-01-15T10:00:00.000Z",
};

describe("SubVariablesPage", () => {
  beforeEach(() => {
    mockGetMyVariables.mockResolvedValue({ data: [mockVariable], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } });
    mockExport.mockResolvedValue({});
  });

  it("renders breadcrumbs", () => {
    renderWithProviders(<VariablesPage />);
    expect(screen.getByText("Variables")).toBeInTheDocument();
  });

  it("fetches and renders items", async () => {
    renderWithProviders(<VariablesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
  });

  it("renders code cell", async () => {
    renderWithProviders(<VariablesPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-code")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-code")).toHaveTextContent("VAR-001");
  });

  it("renders createAt with date formatting", async () => {
    renderWithProviders(<VariablesPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-createAt")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-createAt").textContent).toMatch(/2024|15\/01|01\/15/);
  });

  it("top action 0 (refresh) refetches data", async () => {
    renderWithProviders(<VariablesPage />);
    await waitFor(() => expect(screen.getByTestId("top-0")).toBeInTheDocument());
    const callsBefore = mockGetMyVariables.mock.calls.length;
    fireEvent.click(screen.getByTestId("top-0"));
    await waitFor(() => expect(mockGetMyVariables.mock.calls.length).toBeGreaterThan(callsBefore));
  });

  it("top action 1 (export) calls requestExport", async () => {
    renderWithProviders(<VariablesPage />);
    await waitFor(() => expect(screen.getByTestId("top-1")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("top-1"));
    await waitFor(() => expect(mockExport).toHaveBeenCalledWith(expect.objectContaining({ type: "VARIABLES" })));
  });

  it("row action 0 (dashboard) opens modal", async () => {
    renderWithProviders(<VariablesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(screen.getByTestId("data-table")).toBeInTheDocument());
  });

  it("shows error on fetch failure", async () => {
    mockGetMyVariables.mockRejectedValueOnce({ message: "Error al cargar variables" });
    renderWithProviders(<VariablesPage />);
    await waitFor(() => expect(screen.getByText("Error al cargar variables")).toBeInTheDocument());
  });
});
