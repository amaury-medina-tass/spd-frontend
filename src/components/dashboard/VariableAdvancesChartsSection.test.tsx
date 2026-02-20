import { render, screen, waitFor, fireEvent } from "@testing-library/react";

const mockGetVariableAdvancesWithLocations = jest.fn();
const mockGetVariableDashboardData = jest.fn();

jest.mock("@/services/sub/variable-advances.service", () => ({
  getVariableAdvancesWithLocations: (...args: any[]) => mockGetVariableAdvancesWithLocations(...args),
}));
jest.mock("@/services/sub/variables.service", () => ({
  getVariableDashboardData: (...args: any[]) => mockGetVariableDashboardData(...args),
}));
jest.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  ChartTooltip: () => null,
  ChartTooltipContent: () => null,
}));
jest.mock("recharts", () => ({
  CartesianGrid: () => null,
  Line: () => null,
  LineChart: ({ children }: any) => <div data-testid="line-chart">{children}</div>,
  XAxis: () => null,
  YAxis: () => null,
  Bar: () => null,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

import { VariableAdvancesChartsSection } from "./VariableAdvancesChartsSection";

const dashboardData = {
  totalAdvances: 5,
  communeCount: 3,
  geolocatedCount: 2,
  advances: [
    { year: 2024, month: 1, value: 50 },
    { year: 2024, month: 2, value: 75 },
  ],
  goals: [{ year: 2024, value: 100 }],
  locations: [],
  quadrenniums: [],
};

const defaultProps = {
  variableId: "v1",
  variableCode: "VAR-001",
  variableName: "Test Variable",
  onClose: jest.fn(),
};

describe("VariableAdvancesChartsSection", () => {
  beforeEach(() => {
    mockGetVariableAdvancesWithLocations.mockResolvedValue({ advances: [], variableLocations: [] });
    mockGetVariableDashboardData.mockResolvedValue(dashboardData);
  });

  it("renders component without crashing", async () => {
    const { container } = render(<VariableAdvancesChartsSection {...defaultProps} />);
    await waitFor(() => expect(container.firstChild).toBeTruthy());
  });

  it("shows variable name after loading", async () => {
    render(<VariableAdvancesChartsSection {...defaultProps} variableName="Mi Variable" />);
    await waitFor(() => expect(screen.getByText("Mi Variable")).toBeInTheDocument());
  });

  it("shows variable code in heading after loading", async () => {
    render(<VariableAdvancesChartsSection {...defaultProps} variableCode="VAR-002" />);
    await waitFor(() => expect(screen.getByText(/Análisis de Variable: VAR-002/)).toBeInTheDocument());
  });

  it("calls getVariableAdvancesWithLocations with variableId", async () => {
    render(<VariableAdvancesChartsSection {...defaultProps} />);
    await waitFor(() => expect(mockGetVariableAdvancesWithLocations).toHaveBeenCalledWith("v1"));
  });

  it("calls getVariableDashboardData with variableId", async () => {
    render(<VariableAdvancesChartsSection {...defaultProps} />);
    await waitFor(() => expect(mockGetVariableDashboardData).toHaveBeenCalledWith("v1", expect.any(String), "all"));
  });

  it("calls onClose when close button clicked", async () => {
    const mockOnClose = jest.fn();
    render(<VariableAdvancesChartsSection {...defaultProps} onClose={mockOnClose} />);
    await waitFor(() => expect(screen.getByText(/Análisis de Variable/)).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("Button"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("shows error state when fetch fails", async () => {
    mockGetVariableAdvancesWithLocations.mockRejectedValue(new Error("Error de carga"));
    render(<VariableAdvancesChartsSection {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Error de carga")).toBeInTheDocument());
  });

  it("renders with advance data showing stats", async () => {
    render(<VariableAdvancesChartsSection {...defaultProps} />);
    await waitFor(() => expect(mockGetVariableDashboardData).toHaveBeenCalled());
  });

  it("renders advances with location data (communeName branch)", async () => {
    mockGetVariableAdvancesWithLocations.mockResolvedValue({
      advances: [
        {
          id: "a1",
          value: 50,
          locations: [
            { communeName: "Comuna 1", communeCode: "C1", latitude: 6.25, longitude: -75.56 },
          ],
        },
      ],
      variableLocations: [],
    });
    render(<VariableAdvancesChartsSection {...defaultProps} />);
    await waitFor(() => expect(screen.getByText(/Análisis de Variable/)).toBeInTheDocument());
    expect(screen.getByText("Distribución de Avances por Comuna")).toBeInTheDocument();
  });

  it("renders 'Sin ubicación específica' for advances without locations", async () => {
    mockGetVariableAdvancesWithLocations.mockResolvedValue({
      advances: [{ id: "a1", value: 30, locations: [] }],
      variableLocations: [],
    });
    render(<VariableAdvancesChartsSection {...defaultProps} />);
    await waitFor(() => expect(screen.getByText(/Análisis de Variable/)).toBeInTheDocument());
    expect(screen.getByText("Sin ubicación específica")).toBeInTheDocument();
  });

  it("renders variableLocations georeferenced section", async () => {
    mockGetVariableAdvancesWithLocations.mockResolvedValue({
      advances: [],
      variableLocations: [
        {
          communeCode: "C5",
          communeName: "Castilla",
          latitude: 6.28,
          longitude: -75.58,
          address: "Calle 1 # 2-3",
        },
      ],
    });
    render(<VariableAdvancesChartsSection {...defaultProps} />);
    await waitFor(() => expect(screen.getByText(/Castilla/)).toBeInTheDocument());
    expect(screen.getByText("Ubicaciones Georreferenciadas de la Variable")).toBeInTheDocument();
  });

  it("renders variableLocation without coordinates as Sin coordenadas", async () => {
    mockGetVariableAdvancesWithLocations.mockResolvedValue({
      advances: [],
      variableLocations: [
        { communeCode: "C9", communeName: "Corregimiento", latitude: null, longitude: null, address: null },
      ],
    });
    render(<VariableAdvancesChartsSection {...defaultProps} />);
    await waitFor(() => expect(screen.getByText(/Corregimiento/)).toBeInTheDocument());
    expect(screen.getByText("Sin coordenadas")).toBeInTheDocument();
  });

  it("renders quadrenniums section when data has quadrenniums", async () => {
    mockGetVariableDashboardData.mockResolvedValue({
      ...dashboardData,
      quadrenniums: [{ id: "q1", startYear: 2020, endYear: 2023, value: 250.5 }],
    });
    render(<VariableAdvancesChartsSection {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Metas por Cuatrienio")).toBeInTheDocument());
    expect(screen.getByText("2020 - 2023")).toBeInTheDocument();
  });

  it("renders goals count in stats card", async () => {
    mockGetVariableDashboardData.mockResolvedValue({
      ...dashboardData,
      goals: [{ year: 2024, value: 100 }, { year: 2025, value: 150 }],
    });
    render(<VariableAdvancesChartsSection {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Metas Definidas")).toBeInTheDocument());
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders 'No hay datos de avances' when chartData is empty", async () => {
    mockGetVariableDashboardData.mockResolvedValue({
      ...dashboardData,
      advances: [],
      goals: [],
    });
    render(<VariableAdvancesChartsSection {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("No hay datos de avances disponibles")).toBeInTheDocument());
  });
});
