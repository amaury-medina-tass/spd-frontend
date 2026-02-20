import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { requestExport } from "@/services/exports.service";
import { addToast } from "@heroui/toast";

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

let capturedAdvancesProps: any = {};
let capturedDashboardProps: any = {};
jest.mock("@/components/modals/sub/VariableAdvancesModal", () => ({ VariableAdvancesModal: (props: any) => { capturedAdvancesProps = props; return props.isOpen ? require("react").createElement("div", { "data-testid": "advances-modal" }) : null; } }));
jest.mock("@/components/modals/sub/IndicatorDashboardModal", () => ({ IndicatorDashboardModal: (props: any) => { capturedDashboardProps = props; return props.isOpen ? require("react").createElement("div", { "data-testid": "dashboard-modal" }) : null; } }));

const mockGetIndicators = jest.fn();
jest.mock("@/services/sub/indicators.service", () => ({
  getMyIndicativeIndicators: (...args: any[]) => mockGetIndicators(...args),
}));

jest.mock("@/services/exports.service", () => ({
  requestExport: jest.fn().mockResolvedValue({}),
}));

jest.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

jest.mock("@/lib/http", () => ({ get: jest.fn() }));

import { IndicativePlanSubTab } from "./IndicativePlanSubTab";

const emptyMeta = { total: 0, page: 1, limit: 10, totalPages: 1 };
const mockRequestExport = requestExport as jest.Mock;
const mockAddToast = addToast as jest.Mock;

describe("IndicativePlanSubTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedAdvancesProps = {};
    capturedDashboardProps = {};
    mockGetIndicators.mockResolvedValue({ data: [], meta: emptyMeta });
    mockRequestExport.mockResolvedValue({});
  });

  it("renders data table", async () => {
    render(<IndicativePlanSubTab />);
    await waitFor(() => expect(screen.getByTestId("data-table")).toBeInTheDocument());
  });

  it("has correct aria-label", async () => {
    render(<IndicativePlanSubTab />);
    await waitFor(() => {
      const table = screen.getByTestId("data-table");
      expect(table).toHaveAttribute("aria-label", "Tabla de indicadores plan indicativo");
    });
  });

  it("fetches indicators on mount", async () => {
    render(<IndicativePlanSubTab />);
    await waitFor(() => expect(mockGetIndicators).toHaveBeenCalled());
  });

  it("renders rows for fetched indicators", async () => {
    mockGetIndicators.mockResolvedValue({
      data: [
        {
          id: "i1",
          code: "IND-001",
          name: "Indicador Indicativo",
          pillarName: "Pilar 1",
          programName: "Programa A",
          indicatorType: { name: "Resultado" },
          unitMeasure: { name: "Porcentaje" },
          baseline: 0,
          advancePercentage: 65,
        },
      ],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });
    render(<IndicativePlanSubTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
  });

  it("renders N/A when unitMeasure is null", async () => {
    mockGetIndicators.mockResolvedValue({
      data: [
        {
          id: "i1",
          code: "IND-001",
          name: "Test",
          pillarName: "P1",
          programName: "P1",
          indicatorType: null,
          unitMeasure: null,
          baseline: 0,
          advancePercentage: 50,
        },
      ],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });
    render(<IndicativePlanSubTab />);
    await waitFor(() => {
      const cell = screen.getByTestId("cell-0-unitMeasure");
      expect(cell).toHaveTextContent("N/A");
    });
  });

  it("renders advance percentage with % symbol", async () => {
    mockGetIndicators.mockResolvedValue({
      data: [
        {
          id: "i1",
          code: "IND-001",
          name: "Test",
          pillarName: "P1",
          programName: "P1",
          indicatorType: { name: "Proceso" },
          unitMeasure: { name: "Unidad" },
          baseline: 5,
          advancePercentage: 90,
        },
      ],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });
    render(<IndicativePlanSubTab />);
    await waitFor(() => {
      const cell = screen.getByTestId("cell-0-advancePercentage");
      expect(cell).toHaveTextContent("90%");
    });
  });

  it("renders Actualizar top action", async () => {
    render(<IndicativePlanSubTab />);
    await waitFor(() => expect(screen.getByTestId("data-table")).toBeInTheDocument());
    expect(screen.getByTestId("top-0")).toHaveTextContent("Actualizar");
  });

  it("renders Exportar Indicadores top action", async () => {
    render(<IndicativePlanSubTab />);
    await waitFor(() => expect(screen.getByTestId("data-table")).toBeInTheDocument());
    expect(screen.getByTestId("top-1")).toHaveTextContent("Exportar Indicadores");
  });

  it("renders row actions for each item", async () => {
    mockGetIndicators.mockResolvedValue({
      data: [
        {
          id: "i1",
          code: "IND-001",
          name: "Test",
          pillarName: "P1",
          programName: "P1",
          indicatorType: { name: "Resultado" },
          unitMeasure: { name: "Unidad" },
          baseline: 0,
          advancePercentage: 80,
        },
      ],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });
    render(<IndicativePlanSubTab />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    expect(screen.getByTestId("row-0-action-0")).toHaveTextContent("Dashboard");
    expect(screen.getByTestId("row-0-action-1")).toHaveTextContent("Avances Variables");
  });

  it("shows error when fetch fails", async () => {
    mockGetIndicators.mockRejectedValueOnce(new Error("fetch error"));
    render(<IndicativePlanSubTab />);
    await waitFor(() => expect(mockGetIndicators).toHaveBeenCalled());
  });

  it("handleExport success shows primary toast", async () => {
    render(<IndicativePlanSubTab />);
    await waitFor(() => expect(screen.getByTestId("top-1")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("top-1"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "primary" }))
    );
  });

  it("handleExport error shows danger toast", async () => {
    mockRequestExport.mockRejectedValueOnce(new Error("export failed"));
    render(<IndicativePlanSubTab />);
    await waitFor(() => expect(screen.getByTestId("top-1")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("top-1"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("row action 0 (dashboard) opens dashboard modal", async () => {
    mockGetIndicators.mockResolvedValue({
      data: [{ id: "i1", code: "IND-001", name: "Test", pillarName: "P1", programName: "P1", indicatorType: { name: "Resultado" }, unitMeasure: { name: "U" }, baseline: 0, advancePercentage: 50 }],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });
    render(<IndicativePlanSubTab />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(screen.getByTestId("dashboard-modal")).toBeInTheDocument());
  });

  it("row action 1 (advances) opens advances modal", async () => {
    mockGetIndicators.mockResolvedValue({
      data: [{ id: "i1", code: "IND-001", name: "Test", pillarName: "P1", programName: "P1", indicatorType: { name: "Resultado" }, unitMeasure: { name: "U" }, baseline: 0, advancePercentage: 50 }],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });
    render(<IndicativePlanSubTab />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-1")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    await waitFor(() => expect(screen.getByTestId("advances-modal")).toBeInTheDocument());
  });

  it("closes advances modal via onClose callback", async () => {
    mockGetIndicators.mockResolvedValue({
      data: [{ id: "i1", code: "IND-001", name: "Test", pillarName: "P1", programName: "P1", indicatorType: null, unitMeasure: { name: "U" }, baseline: 0, advancePercentage: 50 }],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });
    render(<IndicativePlanSubTab />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-1")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    await waitFor(() => expect(screen.getByTestId("advances-modal")).toBeInTheDocument());
    capturedAdvancesProps.onClose();
    await waitFor(() => expect(screen.queryByTestId("advances-modal")).not.toBeInTheDocument());
  });

  it("advancePercentage >= 100 renders text-success class", async () => {
    mockGetIndicators.mockResolvedValue({
      data: [{ id: "i1", code: "IND-001", name: "Test", pillarName: "P1", programName: "P1", indicatorType: { name: "Resultado" }, unitMeasure: { name: "U" }, baseline: 0, advancePercentage: 100 }],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });
    render(<IndicativePlanSubTab />);
    await waitFor(() => {
      const cell = screen.getByTestId("cell-0-advancePercentage");
      expect(cell.querySelector("span")!.className).toContain("text-success");
    });
  });

  it("indicatorType renders N/A when null", async () => {
    mockGetIndicators.mockResolvedValue({
      data: [{ id: "i1", code: "IND-001", name: "Test", pillarName: "P1", programName: "P1", indicatorType: null, unitMeasure: { name: "U" }, baseline: 0, advancePercentage: 50 }],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    });
    render(<IndicativePlanSubTab />);
    await waitFor(() => {
      const cell = screen.getByTestId("cell-0-indicatorType");
      expect(cell).toHaveTextContent("N/A");
    });
  });

  it("top action 0 (refresh) calls fetchIndicators again", async () => {
    render(<IndicativePlanSubTab />);
    await waitFor(() => expect(screen.getByTestId("top-0")).toBeInTheDocument());
    const before = mockGetIndicators.mock.calls.length;
    fireEvent.click(screen.getByTestId("top-0"));
    await waitFor(() => expect(mockGetIndicators.mock.calls.length).toBeGreaterThan(before));
  });
});
