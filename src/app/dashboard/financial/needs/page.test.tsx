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
jest.mock("@/components/modals/financial/needs/NeedDetailModal", () => ({ NeedDetailModal: () => null }));
jest.mock("@/components/modals/financial/needs/NeedCdpPositionsModal", () => ({ NeedCdpPositionsModal: () => null }));

import NeedsPage from "./page";

const mockGet = get as jest.Mock;
const mockExport = requestExport as jest.Mock;

const mockNeed = {
  id: "1",
  code: "NEC-001",
  amount: "500000",
  description: "Necesidad de prueba para testing",
  previousStudy: { code: "EST-001", status: "Aprobado" },
  createAt: "2024-01-15T10:00:00.000Z",
  updateAt: "2024-02-01T08:00:00.000Z",
};

describe("FinancialNeedsPage", () => {
  beforeEach(() => {
    mockGet.mockResolvedValue({ data: [mockNeed], meta: { total: 1, page: 1, limit: 5, totalPages: 1 } });
    mockExport.mockResolvedValue({});
  });

  it("renders breadcrumbs", async () => {
    renderWithProviders(<NeedsPage />);
    await waitFor(() => expect(screen.getByText("Necesidades")).toBeInTheDocument());
  });

  it("fetches and renders data table with items", async () => {
    renderWithProviders(<NeedsPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
  });

  it("renders need code cell", async () => {
    renderWithProviders(<NeedsPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-code")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-code")).toHaveTextContent("NEC-001");
  });

  it("renders amount with currency formatting", async () => {
    renderWithProviders(<NeedsPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-amount")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-amount").textContent).toMatch(/\$|COP|500.000/);
  });

  it("renders previousStudy status chip", async () => {
    renderWithProviders(<NeedsPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-previousStudy.status")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-previousStudy.status").textContent).toBe("Aprobado");
  });

  it("top action 0 (refresh) refetches data", async () => {
    renderWithProviders(<NeedsPage />);
    await waitFor(() => expect(screen.getByTestId("top-0")).toBeInTheDocument());
    const callsBefore = mockGet.mock.calls.length;
    fireEvent.click(screen.getByTestId("top-0"));
    await waitFor(() => expect(mockGet.mock.calls.length).toBeGreaterThan(callsBefore));
  });

  it("top action 1 (export) calls requestExport", async () => {
    renderWithProviders(<NeedsPage />);
    await waitFor(() => expect(screen.getByTestId("top-1")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("top-1"));
    await waitFor(() => expect(mockExport).toHaveBeenCalledWith(expect.objectContaining({ type: "NEEDS" })));
  });

  it("row action 0 (view details) fetches fresh need", async () => {
    renderWithProviders(<NeedsPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining(mockNeed.id)));
  });

  it("row action 1 (view positions) opens modal without extra get", async () => {
    renderWithProviders(<NeedsPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-1")).toBeInTheDocument());
    const callsBefore = mockGet.mock.calls.length;
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    expect(mockGet.mock.calls.length).toBe(callsBefore);
  });

  it("shows error message on fetch failure", async () => {
    mockGet.mockRejectedValueOnce({ message: "Error de red" });
    renderWithProviders(<NeedsPage />);
    await waitFor(() => expect(screen.getByText("Error de red")).toBeInTheDocument());
  });
});
