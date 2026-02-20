import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
import { requestExport } from "@/services/exports.service";
import { addToast } from "@heroui/toast";

jest.mock("@/components/charts/dashboard/GlobalKPIs", () => ({ GlobalKPIs: () => <div data-testid="global-kpis">GlobalKPIs</div> }));
jest.mock("@/components/charts/dashboard/CdpDistributionChart", () => ({ CdpDistributionChart: () => <div>CdpChart</div> }));
jest.mock("@/components/charts/dashboard/ProjectBudgetChart", () => ({ ProjectBudgetChart: () => <div>ProjectChart</div> }));
jest.mock("@/components/charts/dashboard/BudgetModificationsChart", () => ({ BudgetModificationsChart: () => <div data-testid="mods-chart">BudgetChart</div> }));
jest.mock("@/components/tables/DataTable", () => ({
  DataTable: (props: any) => {
    const { items = [], columns = [], rowActions = [], ariaLabel, pagination } = props;
    return (
      <div data-testid="data-table" aria-label={ariaLabel}>
        {items.map((item: any, idx: number) => (
          <div key={idx} data-testid={`row-${idx}`}>
            {columns.map((col: any) => (
              <span key={col.key}>{col.render ? col.render(item) : null}</span>
            ))}
            {rowActions?.map((a: any, j: number) => (
              <button key={j} data-testid={`row-${idx}-action-${j}`} onClick={() => a.onClick?.(item)}>{a.label}</button>
            ))}
          </div>
        ))}
        {pagination && (
          <button data-testid="pagination-next" onClick={() => pagination.onChange(2)}>Next</button>
        )}
      </div>
    );
  },
}));

const mockGetDashboardGlobal = jest.fn();
const mockGetDashboardNeeds = jest.fn();
const mockGetProjectBudgetOverview = jest.fn();
const mockGetProjectExecution = jest.fn();
const mockGetCdpsByNeed = jest.fn();
const mockGetActivitiesByCdp = jest.fn();
const mockGetContractsByCdp = jest.fn();
const mockGetCdpsByContract = jest.fn();
const mockGetBudgetRecordsByContract = jest.fn();
const mockGetMgaActivitiesByProject = jest.fn();
const mockGetDetailedByMga = jest.fn();
const mockGetModificationsByActivity = jest.fn();
jest.mock("@/services/financial/dashboard.service", () => ({
  getDashboardGlobal: (...args: any[]) => mockGetDashboardGlobal(...args),
  getDashboardNeeds: (...args: any[]) => mockGetDashboardNeeds(...args),
  getCdpsByNeed: (...args: any[]) => mockGetCdpsByNeed(...args),
  getActivitiesByCdp: (...args: any[]) => mockGetActivitiesByCdp(...args),
  getContractsByCdp: (...args: any[]) => mockGetContractsByCdp(...args),
  getCdpsByContract: (...args: any[]) => mockGetCdpsByContract(...args),
  getBudgetRecordsByContract: (...args: any[]) => mockGetBudgetRecordsByContract(...args),
  getProjectBudgetOverview: (...args: any[]) => mockGetProjectBudgetOverview(...args),
  getProjectExecution: (...args: any[]) => mockGetProjectExecution(...args),
  getMgaActivitiesByProject: (...args: any[]) => mockGetMgaActivitiesByProject(...args),
  getDetailedByMga: (...args: any[]) => mockGetDetailedByMga(...args),
  getModificationsByActivity: (...args: any[]) => mockGetModificationsByActivity(...args),
}));

import FinancialDashboardPage from "./page";

const mockExport = requestExport as jest.Mock;
const mockAddToast = addToast as jest.Mock;

const mockGlobalData = {
  totalBudget: 1000000,
  totalExecution: 500000,
  totalNeeds: 5,
  totalCdps: 10,
  totalContracts: 3,
  totalProjects: 2,
  executionPercentage: 50,
};

const mockNeed = { id: "n1", code: "NEC-001", amount: "500000", description: "Necesidad test", previousStudy: { code: "EST-001", status: "Aprobado" } };
const paginatedNeeds = { data: [mockNeed], meta: { total: 1, page: 1, limit: 5, totalPages: 2, hasNextPage: true, hasPreviousPage: false } };
const emptyNeeds = { data: [], meta: { total: 0, page: 1, limit: 5, totalPages: 0, hasNextPage: false, hasPreviousPage: false } };
const paginatedExecution = { data: [], meta: { total: 0, page: 1, limit: 5, totalPages: 0, hasNextPage: false, hasPreviousPage: false } };
const mockCdp = { id: "c1", number: "CDP-001", amount: 100000, usedAmount: 50000, availableAmount: 50000, percentage: 50 };
const mockActivity = { id: "act1", code: "ACT-001", name: "Activity One", assignedValue: 100000, budgetCeiling: 150000, percentage: 67 };
const mockContract = { id: "ct1", number: "CONT-001", object: "Contrato prueba", totalValue: 200000, state: "Activo", needCode: "NEC-001" };
const mockBudgetRecord = { id: "br1", number: "RP-001", totalValue: 100000, balance: 40000, percentage: 60 };
const mockExecutionData = {
  data: [{ id: "pe1", code: "PRJ-001", name: "Project Test", dependencyName: "Dep A", currentBudget: 1000000, execution: 700000, executionPercentage: 70, mgaActivitiesCount: 3 }],
  meta: { total: 1, page: 1, limit: 5, totalPages: 2, hasNextPage: true, hasPreviousPage: false },
};
const mockMgaActivity = { id: "mga1", code: "MGA-001", name: "MGA Activity", totalValue: 500000, executionPercentage: 60, detailedActivitiesCount: 2 };
const mockDetailedActivity = { id: "da1", code: "DET-001", name: "Detailed Activity", budgetCeiling: 300000, balance: 120000, executionPercentage: 60, cdpCount: 2, projectCode: "PRJ-001" };
const mockModifications = {
  totalAdditions: 50000, totalReductions: 20000,
  additions: [{ id: "add1", value: 50000, dateIssue: "2024-03-01", description: "Adición test" }],
  reductions: [{ id: "red1", value: 20000, dateIssue: null, description: null }],
  transfers: [],
};

describe("FinancialDashboardPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    [mockGetDashboardGlobal, mockGetDashboardNeeds, mockGetProjectBudgetOverview,
      mockGetProjectExecution, mockGetCdpsByNeed, mockGetActivitiesByCdp,
      mockGetContractsByCdp, mockGetCdpsByContract, mockGetBudgetRecordsByContract,
      mockGetMgaActivitiesByProject, mockGetDetailedByMga, mockGetModificationsByActivity,
    ].forEach(m => m.mockReset());
    mockGetDashboardGlobal.mockResolvedValue(mockGlobalData);
    mockGetDashboardNeeds.mockResolvedValue(paginatedNeeds);
    mockGetProjectBudgetOverview.mockResolvedValue([]);
    mockGetProjectExecution.mockResolvedValue(paginatedExecution);
    mockGetCdpsByNeed.mockResolvedValue([]);
    mockGetActivitiesByCdp.mockResolvedValue([]);
    mockGetContractsByCdp.mockResolvedValue([]);
    mockGetCdpsByContract.mockResolvedValue([]);
    mockGetBudgetRecordsByContract.mockResolvedValue([]);
    mockGetMgaActivitiesByProject.mockResolvedValue([]);
    mockGetDetailedByMga.mockResolvedValue([]);
    mockGetModificationsByActivity.mockResolvedValue(null);
    mockExport.mockResolvedValue({});
  });

  it("renders page heading", async () => {
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByText(/dashboard financiero/i)).toBeInTheDocument());
  });

  it("fetches global data and renders GlobalKPIs", async () => {
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(mockGetDashboardGlobal).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByTestId("global-kpis")).toBeInTheDocument());
  });

  it("fetches needs data on mount", async () => {
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(mockGetDashboardNeeds).toHaveBeenCalled());
  });

  it("fetches project overview on mount", async () => {
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(mockGetProjectBudgetOverview).toHaveBeenCalled());
  });

  it("renders ProjectBudgetChart", async () => {
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByText("ProjectChart")).toBeInTheDocument());
  });

  it("export button calls requestExport", async () => {
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByText("Exportar")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Exportar"));
    await waitFor(() => expect(mockExport).toHaveBeenCalledWith(expect.objectContaining({ type: "FINANCIAL_DASHBOARD" })));
  });

  it("refresh button refetches all data", async () => {
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByText("Actualizar")).toBeInTheDocument());
    const globalCallsBefore = mockGetDashboardGlobal.mock.calls.length;
    fireEvent.click(screen.getByText("Actualizar"));
    await waitFor(() => expect(mockGetDashboardGlobal.mock.calls.length).toBeGreaterThan(globalCallsBefore));
  });

  it("needs row action triggers getCdpsByNeed", async () => {
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(mockGetCdpsByNeed).toHaveBeenCalledWith(mockNeed.id));
  });

  // ─── Column renders ───────────────────────────────────────
  it("renders need description via col.render", async () => {
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByText("Necesidad test")).toBeInTheDocument());
  });

  it("renders need status Aprobado chip", async () => {
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByText("Aprobado")).toBeInTheDocument());
  });

  it("renders need status Pendiente chip", async () => {
    mockGetDashboardNeeds.mockReset();
    mockGetDashboardNeeds.mockResolvedValue({ data: [{ ...mockNeed, previousStudy: { code: "E1", status: "Pendiente" } }], meta: paginatedNeeds.meta });
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByText("Pendiente")).toBeInTheDocument());
  });

  it("renders need status Rechazado chip", async () => {
    mockGetDashboardNeeds.mockReset();
    mockGetDashboardNeeds.mockResolvedValue({ data: [{ ...mockNeed, previousStudy: { code: "E1", status: "Rechazado" } }], meta: paginatedNeeds.meta });
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByText("Rechazado")).toBeInTheDocument());
  });

  it("renders N/A when previousStudy is null", async () => {
    mockGetDashboardNeeds.mockReset();
    mockGetDashboardNeeds.mockResolvedValue({ data: [{ ...mockNeed, previousStudy: null }], meta: paginatedNeeds.meta });
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getAllByText("N/A").length).toBeGreaterThan(0));
  });

  // ─── Export ────────────────────────────────────────────────
  it("export error shows danger toast", async () => {
    mockExport.mockRejectedValueOnce(new Error("export fail"));
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByText("Exportar")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Exportar"));
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" })));
  });

  // ─── Fetch errors ──────────────────────────────────────────
  it("fetchGlobalData error shows danger toast", async () => {
    mockGetDashboardGlobal.mockReset();
    mockGetDashboardGlobal.mockRejectedValue(new Error("network"));
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" })));
  });

  it("fetchNeeds error shows danger toast", async () => {
    mockGetDashboardNeeds.mockReset();
    mockGetDashboardNeeds.mockRejectedValue(new Error("fail"));
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" })));
  });

  it("fetchProjectExecution error shows danger toast", async () => {
    mockGetProjectExecution.mockReset();
    mockGetProjectExecution.mockRejectedValue(new Error("fail"));
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" })));
  });

  // ─── CDP drill-down ────────────────────────────────────────
  it("CDPs render as buttons after need selection", async () => {
    mockGetCdpsByNeed.mockResolvedValueOnce([mockCdp]);
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(screen.getByText("CDP CDP-001")).toBeInTheDocument());
  });

  it("clicking CDP triggers getActivitiesByCdp and getContractsByCdp", async () => {
    mockGetCdpsByNeed.mockResolvedValueOnce([mockCdp]);
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(screen.getByText("CDP CDP-001")).toBeInTheDocument());
    fireEvent.click(screen.getByText("CDP CDP-001"));
    await waitFor(() => expect(mockGetActivitiesByCdp).toHaveBeenCalledWith(mockCdp.id));
    await waitFor(() => expect(mockGetContractsByCdp).toHaveBeenCalledWith(mockCdp.id));
  });

  it("shows activity details after CDP selection", async () => {
    mockGetCdpsByNeed.mockResolvedValueOnce([mockCdp]);
    mockGetActivitiesByCdp.mockResolvedValueOnce([mockActivity]);
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(screen.getByText("CDP CDP-001")).toBeInTheDocument());
    fireEvent.click(screen.getByText("CDP CDP-001"));
    await waitFor(() => expect(screen.getByText("ACT-001")).toBeInTheDocument());
  });

  it("shows no activities message when CDP has no activities", async () => {
    mockGetCdpsByNeed.mockResolvedValueOnce([mockCdp]);
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(screen.getByText("CDP CDP-001")).toBeInTheDocument());
    fireEvent.click(screen.getByText("CDP CDP-001"));
    await waitFor(() => expect(screen.getByText("No hay actividades asociadas")).toBeInTheDocument());
    expect(screen.getByText("No hay contratos asociados")).toBeInTheDocument();
  });

  it("shows contracts after CDP selection and triggers contract drill-down", async () => {
    mockGetCdpsByNeed.mockResolvedValueOnce([mockCdp]);
    mockGetContractsByCdp.mockResolvedValueOnce([mockContract]);
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(screen.getByText("CDP CDP-001")).toBeInTheDocument());
    fireEvent.click(screen.getByText("CDP CDP-001"));
    await waitFor(() => expect(screen.getByText("Contrato #CONT-001")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Contrato #CONT-001"));
    await waitFor(() => expect(mockGetCdpsByContract).toHaveBeenCalledWith(mockContract.id));
    await waitFor(() => expect(mockGetBudgetRecordsByContract).toHaveBeenCalledWith(mockContract.id));
  });

  it("shows budget records after contract selection", async () => {
    mockGetCdpsByNeed.mockResolvedValueOnce([mockCdp]);
    mockGetContractsByCdp.mockResolvedValueOnce([mockContract]);
    mockGetBudgetRecordsByContract.mockResolvedValueOnce([mockBudgetRecord]);
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(screen.getByText("CDP CDP-001")).toBeInTheDocument());
    fireEvent.click(screen.getByText("CDP CDP-001"));
    await waitFor(() => expect(screen.getByText("Contrato #CONT-001")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Contrato #CONT-001"));
    await waitFor(() => expect(screen.getByText("RP #RP-001")).toBeInTheDocument());
  });

  it("getCdpsByNeed error shows danger toast", async () => {
    mockGetCdpsByNeed.mockReset();
    mockGetCdpsByNeed.mockRejectedValue(new Error("cdp fail"));
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" })));
  });

  // ─── Project Execution → MGA ───────────────────────────────
  it("execution column renders name via col.render", async () => {
    mockGetDashboardNeeds.mockReset();
    mockGetDashboardNeeds.mockResolvedValue(emptyNeeds);
    mockGetProjectExecution.mockReset();
    mockGetProjectExecution.mockResolvedValue(mockExecutionData);
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByText("Project Test")).toBeInTheDocument());
  });

  it("execution row action triggers getMgaActivitiesByProject", async () => {
    mockGetDashboardNeeds.mockReset();
    mockGetDashboardNeeds.mockResolvedValue(emptyNeeds);
    mockGetProjectExecution.mockReset();
    mockGetProjectExecution.mockResolvedValue(mockExecutionData);
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(mockGetMgaActivitiesByProject).toHaveBeenCalledWith(mockExecutionData.data[0].id));
  });

  it("shows empty MGA message when project has no MGA activities", async () => {
    mockGetDashboardNeeds.mockReset();
    mockGetDashboardNeeds.mockResolvedValue(emptyNeeds);
    mockGetProjectExecution.mockReset();
    mockGetProjectExecution.mockResolvedValue(mockExecutionData);
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(screen.getByText("No hay actividades MGA")).toBeInTheDocument());
  });

  it("shows MGA activities and allows drilling to detailed", async () => {
    mockGetDashboardNeeds.mockReset();
    mockGetDashboardNeeds.mockResolvedValue(emptyNeeds);
    mockGetProjectExecution.mockReset();
    mockGetProjectExecution.mockResolvedValue(mockExecutionData);
    mockGetMgaActivitiesByProject.mockResolvedValueOnce([mockMgaActivity]);
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(screen.getByText("MGA Activity")).toBeInTheDocument());
    const allActionBtns = screen.getAllByTestId("row-0-action-0");
    fireEvent.click(allActionBtns[allActionBtns.length - 1]);
    await waitFor(() => expect(mockGetDetailedByMga).toHaveBeenCalledWith(mockMgaActivity.id));
  });

  it("shows empty detailed message when MGA has no detailed activities", async () => {
    mockGetDashboardNeeds.mockReset();
    mockGetDashboardNeeds.mockResolvedValue(emptyNeeds);
    mockGetProjectExecution.mockReset();
    mockGetProjectExecution.mockResolvedValue(mockExecutionData);
    mockGetMgaActivitiesByProject.mockResolvedValueOnce([mockMgaActivity]);
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(screen.getByText("MGA Activity")).toBeInTheDocument());
    const allActionBtns = screen.getAllByTestId("row-0-action-0");
    fireEvent.click(allActionBtns[allActionBtns.length - 1]);
    await waitFor(() => expect(screen.getByText("No hay actividades detalladas")).toBeInTheDocument());
  });

  it("detailed row action shows budget modifications with accordion", async () => {
    mockGetDashboardNeeds.mockReset();
    mockGetDashboardNeeds.mockResolvedValue(emptyNeeds);
    mockGetProjectExecution.mockReset();
    mockGetProjectExecution.mockResolvedValue(mockExecutionData);
    mockGetMgaActivitiesByProject.mockResolvedValueOnce([mockMgaActivity]);
    mockGetDetailedByMga.mockResolvedValueOnce([mockDetailedActivity]);
    mockGetModificationsByActivity.mockResolvedValueOnce(mockModifications);
    renderWithProviders(<FinancialDashboardPage />);
    // select project
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    // wait for MGA
    await waitFor(() => expect(screen.getByText("MGA Activity")).toBeInTheDocument());
    let allBtns = screen.getAllByTestId("row-0-action-0");
    fireEvent.click(allBtns[allBtns.length - 1]);
    // wait for Detailed
    await waitFor(() => expect(screen.getByText("Detailed Activity")).toBeInTheDocument());
    allBtns = screen.getAllByTestId("row-0-action-0");
    fireEvent.click(allBtns[allBtns.length - 1]);
    // modifications chart + accordion
    await waitFor(() => expect(screen.getByTestId("mods-chart")).toBeInTheDocument());
    expect(screen.getByText(/Adiciones/)).toBeInTheDocument();
    expect(screen.getByText(/Reducciones/)).toBeInTheDocument();
    expect(screen.getByText("Adición test")).toBeInTheDocument();
  });

  it("getMgaActivitiesByProject error shows danger toast", async () => {
    mockGetDashboardNeeds.mockReset();
    mockGetDashboardNeeds.mockResolvedValue(emptyNeeds);
    mockGetProjectExecution.mockReset();
    mockGetProjectExecution.mockResolvedValue(mockExecutionData);
    mockGetMgaActivitiesByProject.mockReset();
    mockGetMgaActivitiesByProject.mockRejectedValue(new Error("mga fail"));
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" })));
  });

  it("needs pagination next calls fetchNeeds", async () => {
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    const paginationBtns = screen.getAllByTestId("pagination-next");
    fireEvent.click(paginationBtns[0]);
    await waitFor(() => expect(mockGetDashboardNeeds.mock.calls.length).toBeGreaterThan(1));
  });

  it("refresh resets all drill-down state", async () => {
    mockGetCdpsByNeed.mockResolvedValueOnce([mockCdp]);
    renderWithProviders(<FinancialDashboardPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(screen.getByText("CDP CDP-001")).toBeInTheDocument());
    const callsBefore = mockGetDashboardGlobal.mock.calls.length;
    fireEvent.click(screen.getByText("Actualizar"));
    await waitFor(() => expect(mockGetDashboardGlobal.mock.calls.length).toBeGreaterThan(callsBefore));
    expect(screen.queryByText("CDP CDP-001")).not.toBeInTheDocument();
  });
});
