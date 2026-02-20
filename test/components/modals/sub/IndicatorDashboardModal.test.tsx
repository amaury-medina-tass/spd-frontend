import { render, screen, waitFor } from "@testing-library/react";
import { IndicatorDashboardModal } from "@/components/modals/sub/IndicatorDashboardModal";
import { getActionIndicatorDetailed, getIndicativeIndicatorDetailed } from "@/services/sub/variable-advances.service";
import { addToast } from "@heroui/toast";

const mockGetAction = getActionIndicatorDetailed as jest.Mock;
const mockGetIndicative = getIndicativeIndicatorDetailed as jest.Mock;
const mockAddToast = addToast as jest.Mock;

jest.mock("@/services/sub/variable-advances.service", () => ({
  getActionIndicatorDetailed: jest.fn().mockResolvedValue(null),
  getIndicativeIndicatorDetailed: jest.fn().mockResolvedValue(null),
}));
jest.mock("recharts", () => ({
  Line: () => null,
  LineChart: ({ children }: any) => <div>{children}</div>,
  RadialBarChart: ({ children }: any) => <div>{children}</div>,
  RadialBar: () => null,
  CartesianGrid: () => null,
  XAxis: () => null,
  YAxis: () => null,
  PolarAngleAxis: () => null,
}));
jest.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children }: any) => <div>{children}</div>,
  ChartTooltip: () => null,
  ChartTooltipContent: () => null,
  ChartLegend: () => null,
  ChartLegendContent: () => null,
}));

const mockData = {
  indicator: { id: "i1", name: "Test Indicator", code: "IND-001", unitMeasure: "Unidad" },
  advances: [
    { id: "a1", month: 1, value: 10, year: 2024 },
    { id: "a2", month: 2, value: 20, year: 2024 },
  ],
  goals: [
    { id: "g1", year: 2024, value: 100 },
  ],
  variables: [],
};

describe("IndicatorDashboardModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    indicatorId: "i1" as string | null,
    indicatorCode: "IND-001",
    type: "action" as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAction.mockResolvedValue(null);
    mockGetIndicative.mockResolvedValue(null);
  });

  it("renders when open", () => {
    render(<IndicatorDashboardModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<IndicatorDashboardModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows modal title", () => {
    render(<IndicatorDashboardModal {...defaultProps} />);
    expect(screen.getByText("Dashboard del Indicador")).toBeInTheDocument();
  });

  it("shows empty state when indicatorId is null", () => {
    render(<IndicatorDashboardModal {...defaultProps} indicatorId={null} />);
    expect(screen.getByText("No hay datos disponibles")).toBeInTheDocument();
  });

  it("shows Cerrar button", () => {
    render(<IndicatorDashboardModal {...defaultProps} />);
    expect(screen.getByText("Cerrar")).toBeInTheDocument();
  });

  it("shows indicatorCode chip", () => {
    render(<IndicatorDashboardModal {...defaultProps} indicatorCode="IND-001" />);
    expect(screen.getByText("IND-001")).toBeInTheDocument();
  });

  it("renders with type=indicative", () => {
    render(<IndicatorDashboardModal {...defaultProps} type="indicative" />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("calls getActionIndicatorDetailed for action type", async () => {
    mockGetAction.mockResolvedValueOnce(mockData);
    render(<IndicatorDashboardModal {...defaultProps} type="action" />);
    await waitFor(() => expect(mockGetAction).toHaveBeenCalledWith("i1", expect.any(String), expect.any(String)));
  });

  it("calls getIndicativeIndicatorDetailed for indicative type", async () => {
    mockGetIndicative.mockResolvedValueOnce(mockData);
    render(<IndicatorDashboardModal {...defaultProps} type="indicative" />);
    await waitFor(() => expect(mockGetIndicative).toHaveBeenCalledWith("i1", expect.any(String), expect.any(String)));
  });

  it("does not fetch when indicatorId is null", () => {
    render(<IndicatorDashboardModal {...defaultProps} indicatorId={null} />);
    expect(mockGetAction).not.toHaveBeenCalled();
    expect(mockGetIndicative).not.toHaveBeenCalled();
  });

  it("renders indicator info after data loads", async () => {
    mockGetAction.mockResolvedValueOnce(mockData);
    render(<IndicatorDashboardModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Test Indicator")).toBeInTheDocument());
    expect(screen.getByText(/IND-001 • Unidad/)).toBeInTheDocument();
  });

  it("renders chart section headers after data loads", async () => {
    mockGetAction.mockResolvedValueOnce(mockData);
    render(<IndicatorDashboardModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Avances Mensuales")).toBeInTheDocument());
    expect(screen.getByText("Metas por Año")).toBeInTheDocument();
  });

  it("renders summary stats (Meta, Avance, Cumplimiento)", async () => {
    mockGetAction.mockResolvedValueOnce(mockData);
    render(<IndicatorDashboardModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Meta")).toBeInTheDocument());
    expect(screen.getByText("Avance")).toBeInTheDocument();
    expect(screen.getByText("Cumplimiento")).toBeInTheDocument();
  });

  it("handles fetch error gracefully", async () => {
    mockGetAction.mockRejectedValueOnce(new Error("fetch fail"));
    render(<IndicatorDashboardModal {...defaultProps} />);
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({ color: "danger" })
    ));
  });

  it("shows empty advances message when no advances", async () => {
    mockGetAction.mockResolvedValueOnce({ ...mockData, advances: [] });
    render(<IndicatorDashboardModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Sin avances registrados")).toBeInTheDocument());
  });

  it("shows empty goals message when no goals", async () => {
    mockGetAction.mockResolvedValueOnce({ ...mockData, goals: [] });
    render(<IndicatorDashboardModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Sin metas registradas")).toBeInTheDocument());
  });

  it("renders year and month filter selects", () => {
    render(<IndicatorDashboardModal {...defaultProps} />);
    expect(screen.getByLabelText("Año")).toBeInTheDocument();
    expect(screen.getByLabelText("Mes")).toBeInTheDocument();
  });
});
