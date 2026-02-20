import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { addToast } from "@heroui/toast";
import { requestExport } from "@/services/exports.service";

const mockAddToast = addToast as jest.Mock;
const mockRequestExport = requestExport as jest.Mock;
const mockGetIndicators = jest.fn();
const mockDeleteIndicator = jest.fn();

let capturedFormulaModalProps: any = {};

jest.mock("@/components/tables/DataTable", () => ({
  DataTable: (props: any) => {
    const { items = [], columns = [], topActions = [], rowActions = [], ariaLabel } = props;
    return (
      <div data-testid="data-table" aria-label={ariaLabel}>
        {topActions.map((a: any, i: number) => (
          <button key={i} data-testid={`top-${i}`} onClick={a.onClick}>{a.label}</button>
        ))}
        {items.map((item: any, i: number) => (
          <div key={i} data-testid={`row-${i}`}>
            {columns.map((col: any) => (
              <span key={col.key} data-testid={`cell-${i}-${col.key}`}>
                {col.render ? col.render(item) : String(item[col.key] ?? "")}
              </span>
            ))}
            {rowActions?.map((a: any, j: number) => (
              <button key={j} data-testid={`row-${i}-action-${j}`} onClick={() => a.onClick?.(item)}>{a.label}</button>
            ))}
          </div>
        ))}
      </div>
    );
  },
}));
jest.mock("@/components/modals/masters/indicators/indicative-plan/IndicatorDetailModal", () => ({ IndicatorDetailModal: () => null }));
jest.mock("@/components/modals/masters/indicators/indicative-plan/CreateIndicatorModal", () => ({ CreateIndicatorModal: () => null }));
jest.mock("@/components/modals/masters/indicators/indicative-plan/EditIndicatorModal", () => ({ EditIndicatorModal: () => null }));
jest.mock("@/components/modals/masters/indicators/indicative-plan/IndicativePlanIndicatorGoalsModal", () => ({ IndicativePlanIndicatorGoalsModal: () => null }));
jest.mock("@/components/modals/masters/indicators/ManageIndicatorVariablesModal", () => ({ ManageIndicatorVariablesModal: () => null }));
jest.mock("@/components/modals/masters/indicators/IndicatorLocationModal", () => ({ IndicatorLocationModal: () => null }));
jest.mock("@/components/modals/masters/indicators/formulas", () => ({
  FormulaEditorModal: (props: any) => { capturedFormulaModalProps = props; return null; },
}));
jest.mock("@/components/modals/masters/AssignUserModal", () => ({ AssignUserModal: () => null }));
jest.mock("@/components/modals/ConfirmationModal", () => ({
  ConfirmationModal: ({ isOpen, onConfirm }: any) =>
    isOpen ? <div data-testid="confirm-modal"><button onClick={onConfirm}>Confirm</button></div> : null,
}));
jest.mock("@/services/masters/indicators.service", () => ({
  getIndicators: (...args: any[]) => mockGetIndicators(...args),
  deleteIndicator: (...args: any[]) => mockDeleteIndicator(...args),
  getIndicatorUsers: jest.fn().mockResolvedValue([]),
  assignIndicatorUser: jest.fn().mockResolvedValue({}),
  unassignIndicatorUser: jest.fn().mockResolvedValue({}),
}));
jest.mock("@/services/masters/formulas.service", () => ({
  createFormula: jest.fn().mockResolvedValue({}),
  updateFormula: jest.fn().mockResolvedValue({}),
}));

import { IndicativePlanIndicatorsTab } from "./IndicativePlanIndicatorsTab";

const mockData = {
  data: [
    { id: "i1", code: "IND-001", name: "Indicator 1", pillarName: "Pilar 1", programName: "Program A", indicatorType: { name: "Type A" }, unitMeasure: { name: "%" }, baseline: "50", advancePercentage: 75 },
  ],
  meta: { total: 1, page: 1, limit: 5, totalPages: 1 },
};

describe("IndicativePlanIndicatorsTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedFormulaModalProps = {};
    mockGetIndicators.mockResolvedValue(mockData);
    mockDeleteIndicator.mockResolvedValue({});
  });

  it("renders data table with fetched indicators", async () => {
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
  });

  it("renders all columns via renderCell", async () => {
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-code")).toBeInTheDocument();
    expect(screen.getByTestId("cell-0-advancePercentage")).toBeInTheDocument();
  });

  it("clicks view detail action", async () => {
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
  });

  it("clicks edit action", async () => {
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
  });

  it("clicks delete and confirms", async () => {
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-2"));
    await waitFor(() => expect(screen.getByTestId("confirm-modal")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() => expect(mockDeleteIndicator).toHaveBeenCalled());
  });

  it("clicks goals action", async () => {
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-3"));
  });

  it("clicks variables action", async () => {
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-4"));
  });

  it("clicks formula action", async () => {
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-5"));
  });

  it("clicks location action", async () => {
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-6"));
  });

  it("clicks users action", async () => {
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-7"));
  });

  it("clicks refresh top action", async () => {
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(mockGetIndicators).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByText("Actualizar"));
    await waitFor(() => expect(mockGetIndicators).toHaveBeenCalledTimes(2));
  });

  it("clicks create top action", async () => {
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Crear"));
  });

  it("handles fetch error shows error state with Reintentar", async () => {
    mockGetIndicators.mockRejectedValueOnce(new Error("Error al cargar indicadores"));
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByText("Error al cargar indicadores")).toBeInTheDocument());
    expect(screen.getByText("Reintentar")).toBeInTheDocument();
  });

  it("Reintentar button re-fetches data", async () => {
    mockGetIndicators.mockRejectedValueOnce(new Error("Error al cargar indicadores"));
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByText("Reintentar")).toBeInTheDocument());
    mockGetIndicators.mockResolvedValueOnce(mockData);
    fireEvent.click(screen.getByText("Reintentar"));
    await waitFor(() => expect(mockGetIndicators).toHaveBeenCalledTimes(2));
  });

  it("handles delete error shows danger toast", async () => {
    mockDeleteIndicator.mockRejectedValueOnce(new Error("delete failed"));
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-2"));
    await waitFor(() => expect(screen.getByTestId("confirm-modal")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("delete success shows success toast", async () => {
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-2"));
    await waitFor(() => expect(screen.getByTestId("confirm-modal")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }))
    );
  });

  it("renders advancePercentage < 100 with text-warning class", async () => {
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    const cell = screen.getByTestId("cell-0-advancePercentage");
    expect(cell.querySelector("span")).toHaveClass("text-warning");
    expect(cell).toHaveTextContent("75%");
  });

  it("renders advancePercentage >= 100 with text-success class", async () => {
    mockGetIndicators.mockResolvedValue({
      data: [{ ...mockData.data[0], advancePercentage: 100 }],
      meta: mockData.meta,
    });
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    const cell = screen.getByTestId("cell-0-advancePercentage");
    expect(cell.querySelector("span")).toHaveClass("text-success");
  });

  it("renders indicatorType via col.render", async () => {
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-indicatorType")).toHaveTextContent("Type A");
  });

  it("renders unitMeasure via col.render", async () => {
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-unitMeasure")).toHaveTextContent("%");
  });

  it("export success calls requestExport and shows primary toast", async () => {
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Exportar Indicadores"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "primary" }))
    );
    expect(mockRequestExport).toHaveBeenCalledWith({ system: "SPD", type: "INDICATORS" });
  });

  it("export failure shows danger toast", async () => {
    mockRequestExport.mockRejectedValueOnce(new Error("export error"));
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Exportar Indicadores"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("formula save (new formula) calls createFormula", async () => {
    const { createFormula } = await import("@/services/masters/formulas.service");
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-5"));
    await capturedFormulaModalProps.onSave({ expression: "a+b", ast: {} });
    await waitFor(() =>
      expect(createFormula).toHaveBeenCalledWith(expect.objectContaining({ expression: "a+b" }))
    );
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("formula save (update formula) calls updateFormula", async () => {
    const { updateFormula } = await import("@/services/masters/formulas.service");
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-5"));
    await capturedFormulaModalProps.onSave({ id: "f2", expression: "a*b", ast: {} });
    await waitFor(() =>
      expect(updateFormula).toHaveBeenCalledWith("f2", expect.objectContaining({ expression: "a*b" }))
    );
  });

  it("formula save error shows danger toast", async () => {
    const { createFormula } = await import("@/services/masters/formulas.service");
    (createFormula as jest.Mock).mockRejectedValueOnce(new Error("formula error"));
    render(<IndicativePlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-5"));
    await capturedFormulaModalProps.onSave({ expression: "bad", ast: {} });
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });
});
