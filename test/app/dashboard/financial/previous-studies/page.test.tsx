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
          </div>
        ))}
      </div>
    );
  },
}));

import PreviousStudiesPage from "@/app/dashboard/financial/previous-studies/page";

const mockGet = get as jest.Mock;
const mockExport = requestExport as jest.Mock;

const mockStudy = {
  id: "1",
  code: "EST-001",
  status: "Aprobado",
  createAt: "2024-01-15T10:00:00.000Z",
  updateAt: "2024-02-01T08:00:00.000Z",
};

describe("FinancialPreviousStudiesPage", () => {
  beforeEach(() => {
    mockGet.mockResolvedValue({ data: [mockStudy], meta: { total: 1, page: 1, limit: 5, totalPages: 1 } });
    mockExport.mockResolvedValue({});
  });

  it("renders breadcrumbs", async () => {
    renderWithProviders(<PreviousStudiesPage />);
    await waitFor(() => expect(screen.getByText("Estudios Previos")).toBeInTheDocument());
  });

  it("fetches and renders items", async () => {
    renderWithProviders(<PreviousStudiesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
  });

  it("renders code cell", async () => {
    renderWithProviders(<PreviousStudiesPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-code")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-code")).toHaveTextContent("EST-001");
  });

  it("renders status chip with Aprobado", async () => {
    renderWithProviders(<PreviousStudiesPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-status")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-status").textContent).toBe("Aprobado");
  });

  it("renders status chip for Pendiente", async () => {
    mockGet.mockResolvedValueOnce({ data: [{ ...mockStudy, status: "Pendiente" }], meta: { total: 1, page: 1, limit: 5, totalPages: 1 } });
    renderWithProviders(<PreviousStudiesPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-status")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-status").textContent).toBe("Pendiente");
  });

  it("renders status chip for Rechazado", async () => {
    mockGet.mockResolvedValueOnce({ data: [{ ...mockStudy, status: "Rechazado" }], meta: { total: 1, page: 1, limit: 5, totalPages: 1 } });
    renderWithProviders(<PreviousStudiesPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-status")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-status").textContent).toBe("Rechazado");
  });

  it("top action 0 (refresh) refetches data", async () => {
    renderWithProviders(<PreviousStudiesPage />);
    await waitFor(() => expect(screen.getByTestId("top-0")).toBeInTheDocument());
    const callsBefore = mockGet.mock.calls.length;
    fireEvent.click(screen.getByTestId("top-0"));
    await waitFor(() => expect(mockGet.mock.calls.length).toBeGreaterThan(callsBefore));
  });

  it("top action 1 (export) calls requestExport", async () => {
    renderWithProviders(<PreviousStudiesPage />);
    await waitFor(() => expect(screen.getByTestId("top-1")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("top-1"));
    await waitFor(() => expect(mockExport).toHaveBeenCalledWith(expect.objectContaining({ type: "PREVIOUS_STUDIES" })));
  });

  it("shows error on fetch failure", async () => {
    mockGet.mockRejectedValueOnce({ message: "Error al cargar estudios previos" });
    renderWithProviders(<PreviousStudiesPage />);
    await waitFor(() => expect(screen.getByText("Error al cargar estudios previos")).toBeInTheDocument());
  });
});
