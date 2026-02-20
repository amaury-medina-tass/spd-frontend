import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EditIndicatorModal } from "./EditIndicatorModal";
import { updateIndicator, getIndicatorCatalogs } from "@/services/masters/indicators.service";
import { addToast } from "@heroui/toast";

const mockUpdateIndicator = updateIndicator as jest.Mock;
const mockGetCatalogs = getIndicatorCatalogs as jest.Mock;
const mockAddToast = addToast as jest.Mock;

jest.mock("@/services/masters/indicators.service", () => ({
  updateIndicator: jest.fn().mockResolvedValue({}),
  getIndicatorCatalogs: jest.fn().mockResolvedValue({
    indicatorTypes: [{ id: 1, name: "Tipo A" }],
    unitMeasures: [{ id: 1, name: "Unidad A" }],
    indicatorDirections: [{ id: 1, name: "Ascendente" }],
  }),
}));
jest.mock("react-hook-form", () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: any) => (e: any) => {
      e?.preventDefault?.();
      return fn({
        code: "IND-001", name: "Test", observations: "", advancePercentage: 75,
        pillarCode: "P1", pillarName: "Pilar", componentCode: "C1", componentName: "Comp",
        programCode: "PR1", programName: "Prog", description: "Desc", baseline: "50",
        indicatorTypeId: 1, unitMeasureId: 1, directionId: 1,
      });
    },
    reset: jest.fn(),
    formState: { errors: {}, isSubmitting: false },
  }),
  Controller: ({ render: renderFn }: any) =>
    renderFn({ field: { value: "", onChange: jest.fn(), ref: jest.fn() }, fieldState: { error: null } }),
}));
jest.mock("@hookform/resolvers/zod", () => ({ zodResolver: () => jest.fn() }));

const mockIndicator = {
  id: "i1",
  code: "IND-001",
  name: "Test Indicator",
  description: "Desc",
  baseline: "50",
  advancePercentage: 75,
  pillarCode: "P1",
  pillarName: "Pilar Uno",
  componentCode: "C1",
  componentName: "Componente Uno",
  programCode: "PR1",
  programName: "Programa Uno",
  indicatorTypeId: 1,
  unitMeasureId: 1,
  directionId: 1,
};

describe("EditIndicatorModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
    indicator: mockIndicator as any,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCatalogs.mockResolvedValue({
      indicatorTypes: [{ id: 1, name: "Tipo A" }],
      unitMeasures: [{ id: 1, name: "Unidad A" }],
      indicatorDirections: [{ id: 1, name: "Ascendente" }],
    });
    mockUpdateIndicator.mockResolvedValue({});
  });

  it("renders when open", () => {
    render(<EditIndicatorModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<EditIndicatorModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows modal title", () => {
    render(<EditIndicatorModal {...defaultProps} />);
    expect(screen.getByText("Editar Indicador")).toBeInTheDocument();
  });

  it("shows Código and Nombre Input labels", () => {
    render(<EditIndicatorModal {...defaultProps} />);
    expect(screen.getByText("Código")).toBeInTheDocument();
    expect(screen.getByText("Nombre")).toBeInTheDocument();
  });

  it("shows strategic alignment Input labels", () => {
    render(<EditIndicatorModal {...defaultProps} />);
    expect(screen.getByText("Línea Base")).toBeInTheDocument();
    expect(screen.getByText("Nombre Pilar")).toBeInTheDocument();
    expect(screen.getByText("Porcentaje de Avance")).toBeInTheDocument();
  });

  it("shows Cancelar and Guardar Cambios buttons", () => {
    render(<EditIndicatorModal {...defaultProps} />);
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
    expect(screen.getByText("Guardar Cambios")).toBeInTheDocument();
  });

  it("fetches catalogs on open", async () => {
    render(<EditIndicatorModal {...defaultProps} />);
    await waitFor(() => expect(mockGetCatalogs).toHaveBeenCalled());
  });

  it("handles catalog loading error", async () => {
    mockGetCatalogs.mockRejectedValueOnce(new Error("catalog fail"));
    render(<EditIndicatorModal {...defaultProps} />);
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Error al cargar catálogos" })
    ));
  });

  it("submits form and calls updateIndicator", async () => {
    render(<EditIndicatorModal {...defaultProps} />);
    await waitFor(() => expect(mockGetCatalogs).toHaveBeenCalled());
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => expect(mockUpdateIndicator).toHaveBeenCalled());
  });

  it("calls onSuccess and onClose after successful update", async () => {
    render(<EditIndicatorModal {...defaultProps} />);
    await waitFor(() => expect(mockGetCatalogs).toHaveBeenCalled());
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => expect(defaultProps.onSuccess).toHaveBeenCalled());
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("handles update error gracefully", async () => {
    mockUpdateIndicator.mockRejectedValueOnce(new Error("update fail"));
    render(<EditIndicatorModal {...defaultProps} />);
    await waitFor(() => expect(mockGetCatalogs).toHaveBeenCalled());
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({ color: "danger" })
    ));
  });

  it("does not call updateIndicator when indicator is null", async () => {
    render(<EditIndicatorModal {...defaultProps} indicator={null} />);
    await waitFor(() => expect(mockGetCatalogs).toHaveBeenCalled());
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => {});
    expect(mockUpdateIndicator).not.toHaveBeenCalled();
  });

  it("renders section headers", () => {
    render(<EditIndicatorModal {...defaultProps} />);
    expect(screen.getByText("Información Básica")).toBeInTheDocument();
    expect(screen.getByText("Clasificación")).toBeInTheDocument();
    expect(screen.getByText("Alineación Estratégica")).toBeInTheDocument();
  });

  it("renders select fields for classification", () => {
    render(<EditIndicatorModal {...defaultProps} />);
    expect(screen.getByLabelText("Tipo de Indicador")).toBeInTheDocument();
    expect(screen.getByLabelText("Unidad de Medida")).toBeInTheDocument();
    expect(screen.getByLabelText("Sentido del Indicador")).toBeInTheDocument();
  });

  it("renders textarea fields with aria-label", () => {
    render(<EditIndicatorModal {...defaultProps} />);
    expect(screen.getByLabelText("Descripción")).toBeInTheDocument();
    expect(screen.getByLabelText("Observaciones")).toBeInTheDocument();
  });
});
