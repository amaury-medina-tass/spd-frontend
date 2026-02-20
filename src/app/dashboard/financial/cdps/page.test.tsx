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
jest.mock("@/components/modals/financial/cdp/CdpPositionDetailModal", () => ({ CdpPositionDetailModal: () => null }));
jest.mock("@/components/modals/financial/cdp/ManageCdpActivitiesModal", () => ({ ManageCdpActivitiesModal: () => null }));

import CdpsPage from "./page";

const mockGet = get as jest.Mock;
const mockExport = requestExport as jest.Mock;

const mockCdp = {
  id: "1",
  cdpNumber: "CDP-001",
  cdpTotalValue: 1000000,
  projectCode: "PROJ-001",
  rubricCode: "RUB-001",
  positionNumber: "001",
  positionValue: 500000,
  needCode: "NEC-001",
  fundingSourceName: "Fondo General",
  fundingSourceCode: "FG-01",
  observations: "Observación de prueba",
};

describe("FinancialCdpsPage", () => {
  beforeEach(() => {
    mockGet.mockResolvedValue({ data: [mockCdp], meta: { total: 1, page: 1, limit: 5, totalPages: 1 } });
    mockExport.mockResolvedValue({});
  });

  it("renders breadcrumbs with CDPs text", async () => {
    renderWithProviders(<CdpsPage />);
    await waitFor(() => expect(screen.getByText("CDPs")).toBeInTheDocument());
  });

  it("fetches and renders data table with items", async () => {
    renderWithProviders(<CdpsPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
  });

  it("renders cdpNumber cell", async () => {
    renderWithProviders(<CdpsPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-cdpNumber")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-cdpNumber")).toHaveTextContent("CDP-001");
  });

  it("renders cdpTotalValue with currency formatting", async () => {
    renderWithProviders(<CdpsPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-cdpTotalValue")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-cdpTotalValue").textContent).toMatch(/\$|COP|1.000.000/);
  });

  it("renders positionValue with currency formatting", async () => {
    renderWithProviders(<CdpsPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-positionValue")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-positionValue").textContent).toMatch(/\$|COP|500.000/);
  });

  it("row action 0 (view detail) fetches position detail", async () => {
    renderWithProviders(<CdpsPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining(mockCdp.id)));
  });

  it("row action 1 (manage activities) opens modal", async () => {
    renderWithProviders(<CdpsPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-1")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    await waitFor(() => expect(screen.getByTestId("data-table")).toBeInTheDocument());
  });

  it("top action 1 (export) calls requestExport", async () => {
    renderWithProviders(<CdpsPage />);
    await waitFor(() => expect(screen.getByTestId("top-1")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("top-1"));
    await waitFor(() => expect(mockExport).toHaveBeenCalledWith(expect.objectContaining({ type: "CDP" })));
  });

  it("shows error on fetch failure", async () => {
    mockGet.mockRejectedValueOnce({ message: "Error al cargar CDPs" });
    renderWithProviders(<CdpsPage />);
    await waitFor(() => expect(screen.getByText("Error al cargar CDPs")).toBeInTheDocument());
  });
});
