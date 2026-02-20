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
jest.mock("@/components/modals/financial/contracts/MasterContractDetailModal", () => ({ MasterContractDetailModal: () => null }));
jest.mock("@/components/modals/financial/contracts/MasterContractCdpsModal", () => ({ MasterContractCdpsModal: () => null }));

import MasterContractsPage from "@/app/dashboard/financial/master-contracts/page";

const mockGet = get as jest.Mock;
const mockExport = requestExport as jest.Mock;

const mockContract = {
  id: "1",
  number: "CT-001",
  object: "Contrato de prueba para testing",
  totalValue: "1000000",
  state: "Legalizado",
  contractor: { name: "Empresa SA" },
  startDate: "2024-01-01T00:00:00.000Z",
  createAt: "2024-01-15T10:00:00.000Z",
  updateAt: "2024-02-01T08:00:00.000Z",
};

describe("FinancialMasterContractsPage", () => {
  beforeEach(() => {
    mockGet.mockResolvedValue({ data: [mockContract], meta: { total: 1, page: 1, limit: 5, totalPages: 1 } });
    mockExport.mockResolvedValue({});
  });

  it("renders breadcrumbs", async () => {
    renderWithProviders(<MasterContractsPage />);
    await waitFor(() => expect(screen.getByText("Contratos Marco")).toBeInTheDocument());
  });

  it("fetches and renders data table with items", async () => {
    renderWithProviders(<MasterContractsPage />);
    await waitFor(() => expect(screen.getByTestId("data-table")).toBeInTheDocument());
    expect(screen.getByTestId("row-0")).toBeInTheDocument();
  });

  it("renders contract number cell", async () => {
    renderWithProviders(<MasterContractsPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-number")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-number")).toHaveTextContent("CT-001");
  });

  it("renders totalValue with currency formatting", async () => {
    renderWithProviders(<MasterContractsPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-totalValue")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-totalValue").textContent).toMatch(/\$|COP|1.000.000/);
  });

  it("renders state chip", async () => {
    renderWithProviders(<MasterContractsPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-state")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-state").textContent).toBe("Legalizado");
  });

  it("top action 0 (refresh) refetches data", async () => {
    renderWithProviders(<MasterContractsPage />);
    await waitFor(() => expect(screen.getByTestId("top-0")).toBeInTheDocument());
    const callsBefore = mockGet.mock.calls.length;
    fireEvent.click(screen.getByTestId("top-0"));
    await waitFor(() => expect(mockGet.mock.calls.length).toBeGreaterThan(callsBefore));
  });

  it("top action 1 (export) calls requestExport", async () => {
    renderWithProviders(<MasterContractsPage />);
    await waitFor(() => expect(screen.getByTestId("top-1")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("top-1"));
    await waitFor(() => expect(mockExport).toHaveBeenCalledWith(expect.objectContaining({ type: "CONTRACTS" })));
  });

  it("row action 0 (view details) fetches contract details", async () => {
    renderWithProviders(<MasterContractsPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining(mockContract.id)));
  });

  it("row action 1 (view CDPs) does not throw", async () => {
    renderWithProviders(<MasterContractsPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-1")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    await waitFor(() => expect(screen.getByTestId("data-table")).toBeInTheDocument());
  });

  it("shows error message on fetch failure", async () => {
    mockGet.mockRejectedValueOnce({ message: "Network error" });
    renderWithProviders(<MasterContractsPage />);
    await waitFor(() => expect(screen.getByText("Network error")).toBeInTheDocument());
  });
});
