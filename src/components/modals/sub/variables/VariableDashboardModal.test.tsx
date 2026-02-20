import { render, screen, waitFor } from "@testing-library/react";
import { VariableDashboardModal } from "./VariableDashboardModal";
import { getVariableDashboardData } from "@/services/sub/variables.service";
import { addToast } from "@heroui/toast";

const mockGetData = getVariableDashboardData as jest.Mock;
const mockAddToast = addToast as jest.Mock;

jest.mock("@/services/sub/variables.service", () => ({
  getVariableDashboardData: jest.fn().mockResolvedValue(null),
}));
jest.mock("recharts", () => ({
  Line: () => null,
  LineChart: ({ children }: any) => <div>{children}</div>,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => null,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));
jest.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartTooltip: () => null,
  ChartTooltipContent: () => null,
}));

const mockData = {
  variable: { id: "v1", name: "Test Variable", code: "VAR-001", observations: "Obs here" },
  advances: [
    { id: "a1", month: 1, value: 5, year: 2024 },
    { id: "a2", month: 3, value: 15, year: 2024 },
  ],
  goals: [
    { id: "g1", year: 2024, value: 50 },
  ],
  quadrenniums: [
    { id: "q1", startYear: 2024, endYear: 2027, value: 200 },
  ],
};

describe("VariableDashboardModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    variableId: "v1" as string | null,
    variableCode: "VAR-001",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetData.mockResolvedValue(null);
  });

  it("renders when open", () => {
    render(<VariableDashboardModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<VariableDashboardModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows modal title", () => {
    render(<VariableDashboardModal {...defaultProps} />);
    expect(screen.getByText("Dashboard de Variable")).toBeInTheDocument();
  });

  it("shows empty state when variableId is null", () => {
    render(<VariableDashboardModal {...defaultProps} variableId={null} />);
    expect(screen.getByText("No hay datos disponibles")).toBeInTheDocument();
  });

  it("shows Cerrar button", () => {
    render(<VariableDashboardModal {...defaultProps} />);
    expect(screen.getByText("Cerrar")).toBeInTheDocument();
  });

  it("shows variableCode chip", () => {
    render(<VariableDashboardModal {...defaultProps} variableCode="VAR-001" />);
    expect(screen.getByText("VAR-001")).toBeInTheDocument();
  });

  it("renders without variableCode", () => {
    render(<VariableDashboardModal {...defaultProps} variableCode={undefined} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("calls getVariableDashboardData on open with variableId", async () => {
    mockGetData.mockResolvedValueOnce(mockData);
    render(<VariableDashboardModal {...defaultProps} />);
    await waitFor(() => expect(mockGetData).toHaveBeenCalledWith("v1", expect.any(String), expect.any(String)));
  });

  it("does not fetch when variableId is null", () => {
    render(<VariableDashboardModal {...defaultProps} variableId={null} />);
    expect(mockGetData).not.toHaveBeenCalled();
  });

  it("renders variable info after data loads", async () => {
    mockGetData.mockResolvedValueOnce(mockData);
    render(<VariableDashboardModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Test Variable")).toBeInTheDocument());
    expect(screen.getAllByText("VAR-001").length).toBeGreaterThanOrEqual(1);
  });

  it("renders observations when present", async () => {
    mockGetData.mockResolvedValueOnce(mockData);
    render(<VariableDashboardModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Obs here")).toBeInTheDocument());
  });

  it("renders chart section headers after data loads", async () => {
    mockGetData.mockResolvedValueOnce(mockData);
    render(<VariableDashboardModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText(/Avances Mensuales/)).toBeInTheDocument());
    expect(screen.getByText("Metas Anuales")).toBeInTheDocument();
    expect(screen.getByText("Cuatrienios")).toBeInTheDocument();
  });

  it("handles fetch error gracefully", async () => {
    mockGetData.mockRejectedValueOnce(new Error("fetch fail"));
    render(<VariableDashboardModal {...defaultProps} />);
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({ color: "danger" })
    ));
  });

  it("shows empty advances message when no advances", async () => {
    mockGetData.mockResolvedValueOnce({ ...mockData, advances: [] });
    render(<VariableDashboardModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Sin avances registrados para este año")).toBeInTheDocument());
  });

  it("shows empty goals message when no goals", async () => {
    mockGetData.mockResolvedValueOnce({ ...mockData, goals: [] });
    render(<VariableDashboardModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Sin metas registradas")).toBeInTheDocument());
  });

  it("shows empty quadrenniums message when no quadrenniums", async () => {
    mockGetData.mockResolvedValueOnce({ ...mockData, quadrenniums: [] });
    render(<VariableDashboardModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Sin cuatrienios registrados")).toBeInTheDocument());
  });

  it("renders year and month filter selects", () => {
    render(<VariableDashboardModal {...defaultProps} />);
    expect(screen.getByLabelText("Año")).toBeInTheDocument();
    expect(screen.getByLabelText("Mes")).toBeInTheDocument();
  });
});
