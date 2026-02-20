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
jest.mock("@/components/modals/masters/indicators/action-plan/CreateActionPlanIndicatorModal", () => ({ CreateActionPlanIndicatorModal: () => null }));
jest.mock("@/components/modals/masters/indicators/action-plan/EditActionPlanIndicatorModal", () => ({ EditActionPlanIndicatorModal: () => null }));
jest.mock("@/components/modals/masters/indicators/action-plan/ActionPlanIndicatorDetailModal", () => ({ ActionPlanIndicatorDetailModal: () => null }));
jest.mock("@/components/modals/masters/indicators/action-plan/ActionPlanIndicatorGoalsModal", () => ({ ActionPlanIndicatorGoalsModal: () => null }));
jest.mock("@/components/modals/masters/indicators/action-plan/ManageActionPlanProjectsModal", () => ({ ManageActionPlanProjectsModal: () => null }));
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
  getActionPlanIndicators: (...args: any[]) => mockGetIndicators(...args),
  deleteActionPlanIndicator: (...args: any[]) => mockDeleteIndicator(...args),
  getActionPlanIndicatorUsers: jest.fn().mockResolvedValue([]),
  assignActionPlanIndicatorUser: jest.fn().mockResolvedValue({}),
  unassignActionPlanIndicatorUser: jest.fn().mockResolvedValue({}),
}));
jest.mock("@/services/masters/formulas.service", () => ({
  createFormula: jest.fn().mockResolvedValue({}),
  updateFormula: jest.fn().mockResolvedValue({}),
}));

import { ActionPlanIndicatorsTab } from "@/app/dashboard/masters/indicators/ActionPlanIndicatorsTab";

const mockData = {
  data: [
    { id: "ap1", code: "AP-001", statisticalCode: "ST-001", name: "AP Indicator", unitMeasure: { name: "Unidades" }, plannedQuantity: 100, executionCut: 50, compliancePercentage: 50 },
  ],
  meta: { total: 1, page: 1, limit: 5, totalPages: 1 },
};

describe("ActionPlanIndicatorsTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedFormulaModalProps = {};
    mockGetIndicators.mockResolvedValue(mockData);
    mockDeleteIndicator.mockResolvedValue({});
  });

  it("renders data table with fetched indicators", async () => {
    render(<ActionPlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
  });

  it("renders all columns via renderCell", async () => {
    render(<ActionPlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-code")).toBeInTheDocument();
    expect(screen.getByTestId("cell-0-compliancePercentage")).toBeInTheDocument();
  });

  it("clicks view detail action", async () => {
    render(<ActionPlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
  });

  it("clicks edit action", async () => {
    render(<ActionPlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
  });

  it("clicks delete and confirms", async () => {
    render(<ActionPlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-2"));
    await waitFor(() => expect(screen.getByTestId("confirm-modal")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() => expect(mockDeleteIndicator).toHaveBeenCalled());
  });

  it("clicks goals and variables actions", async () => {
    render(<ActionPlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-3"));
    fireEvent.click(screen.getByTestId("row-0-action-4"));
  });

  it("clicks projects and formula actions", async () => {
    render(<ActionPlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-5"));
    fireEvent.click(screen.getByTestId("row-0-action-6"));
  });

  it("clicks location and users actions", async () => {
    render(<ActionPlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-7"));
    fireEvent.click(screen.getByTestId("row-0-action-8"));
  });

  it("clicks refresh and create top actions", async () => {
    render(<ActionPlanIndicatorsTab />);
    await waitFor(() => expect(mockGetIndicators).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByText("Actualizar"));
    await waitFor(() => expect(mockGetIndicators).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByText("Crear"));
  });

  it("handles fetch error", async () => {
    mockGetIndicators.mockRejectedValueOnce(new Error("fail"));
    render(<ActionPlanIndicatorsTab />);
    await waitFor(() => expect(mockGetIndicators).toHaveBeenCalled());
  });

  it("handles delete error", async () => {
    mockDeleteIndicator.mockRejectedValueOnce(new Error("delete failed"));
    render(<ActionPlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-2"));
    await waitFor(() => expect(screen.getByTestId("confirm-modal")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("renders compliancePercentage >= 100 with text-success class", async () => {
    mockGetIndicators.mockResolvedValue({
      data: [{ ...mockData.data[0], compliancePercentage: 100 }],
      meta: mockData.meta,
    });
    render(<ActionPlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    const cell = screen.getByTestId("cell-0-compliancePercentage");
    expect(cell.querySelector("span")).toHaveClass("text-success");
    expect(cell).toHaveTextContent("100%");
  });

  it("renders compliancePercentage < 100 with text-warning class", async () => {
    render(<ActionPlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    const cell = screen.getByTestId("cell-0-compliancePercentage");
    expect(cell.querySelector("span")).toHaveClass("text-warning");
  });

  it("renders unitMeasure via col.render", async () => {
    render(<ActionPlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-unitMeasure")).toHaveTextContent("Unidades");
  });

  it("export success calls requestExport and shows primary toast", async () => {
    render(<ActionPlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Exportar Indicadores"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "primary" }))
    );
    expect(mockRequestExport).toHaveBeenCalledWith({ system: "SPD", type: "INDICATORS" });
  });

  it("export failure shows danger toast", async () => {
    mockRequestExport.mockRejectedValueOnce(new Error("export error"));
    render(<ActionPlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Exportar Indicadores"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("formula save (new) calls createFormula and shows success toast", async () => {
    const { createFormula } = await import("@/services/masters/formulas.service");
    render(<ActionPlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-6"));
    await capturedFormulaModalProps.onSave({ expression: "x+y", ast: {} });
    await waitFor(() =>
      expect(createFormula).toHaveBeenCalledWith(expect.objectContaining({ expression: "x+y" }))
    );
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("formula save (update) calls updateFormula", async () => {
    const { updateFormula } = await import("@/services/masters/formulas.service");
    render(<ActionPlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-6"));
    await capturedFormulaModalProps.onSave({ id: "f1", expression: "x*y", ast: {} });
    await waitFor(() =>
      expect(updateFormula).toHaveBeenCalledWith("f1", expect.objectContaining({ expression: "x*y" }))
    );
  });

  it("formula save error shows danger toast", async () => {
    const { createFormula } = await import("@/services/masters/formulas.service");
    (createFormula as jest.Mock).mockRejectedValueOnce(new Error("formula error"));
    render(<ActionPlanIndicatorsTab />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-6"));
    await capturedFormulaModalProps.onSave({ expression: "bad", ast: {} });
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });
});
