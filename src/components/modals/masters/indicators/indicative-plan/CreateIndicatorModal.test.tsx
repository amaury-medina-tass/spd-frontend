import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateIndicatorModal } from "./CreateIndicatorModal";
import { createIndicator, getIndicatorCatalogs } from "@/services/masters/indicators.service";
import { addToast } from "@heroui/toast";

const mockCreateIndicator = createIndicator as jest.Mock;
const mockGetCatalogs = getIndicatorCatalogs as jest.Mock;
const mockAddToast = addToast as jest.Mock;

jest.mock("@/services/masters/indicators.service", () => ({
  createIndicator: jest.fn().mockResolvedValue({}),
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
        code: "C1", name: "Ind1", observations: "", advancePercentage: 0,
        pillarCode: "P1", pillarName: "Pilar", componentCode: "CO1", componentName: "Comp",
        programCode: "PR1", programName: "Prog", description: "Desc", baseline: "0",
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

describe("CreateIndicatorModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onSuccess: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCatalogs.mockResolvedValue({
      indicatorTypes: [{ id: 1, name: "Tipo A" }],
      unitMeasures: [{ id: 1, name: "Unidad A" }],
      indicatorDirections: [{ id: 1, name: "Ascendente" }],
    });
    mockCreateIndicator.mockResolvedValue({});
  });

  it("renders when open", () => {
    render(<CreateIndicatorModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<CreateIndicatorModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows modal title", () => {
    render(<CreateIndicatorModal {...defaultProps} />);
    expect(screen.getByText("Crear Indicador")).toBeInTheDocument();
  });

  it("shows section headers", () => {
    render(<CreateIndicatorModal {...defaultProps} />);
    expect(screen.getByText("Información Básica")).toBeInTheDocument();
    expect(screen.getByText("Clasificación")).toBeInTheDocument();
    expect(screen.getByText("Alineación Estratégica")).toBeInTheDocument();
  });

  it("shows Código and Nombre Input labels", () => {
    render(<CreateIndicatorModal {...defaultProps} />);
    expect(screen.getByText("Código")).toBeInTheDocument();
    expect(screen.getByText("Nombre")).toBeInTheDocument();
  });

  it("shows strategic alignment Input labels", () => {
    render(<CreateIndicatorModal {...defaultProps} />);
    expect(screen.getByText("Línea Base")).toBeInTheDocument();
    expect(screen.getByText("Nombre Pilar")).toBeInTheDocument();
    expect(screen.getByText("Nombre Programa")).toBeInTheDocument();
  });

  it("shows Cancelar and Crear buttons", () => {
    render(<CreateIndicatorModal {...defaultProps} />);
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
    expect(screen.getByText("Crear")).toBeInTheDocument();
  });

  it("fetches catalogs on open", async () => {
    render(<CreateIndicatorModal {...defaultProps} />);
    await waitFor(() => expect(mockGetCatalogs).toHaveBeenCalled());
  });

  it("does not fetch catalogs when closed", () => {
    render(<CreateIndicatorModal {...defaultProps} isOpen={false} />);
    expect(mockGetCatalogs).not.toHaveBeenCalled();
  });

  it("handles catalog loading error", async () => {
    mockGetCatalogs.mockRejectedValueOnce(new Error("catalog fail"));
    render(<CreateIndicatorModal {...defaultProps} />);
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Error al cargar catálogos" })
    ));
  });

  it("submits form and calls createIndicator", async () => {
    render(<CreateIndicatorModal {...defaultProps} />);
    await waitFor(() => expect(mockGetCatalogs).toHaveBeenCalled());
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => expect(mockCreateIndicator).toHaveBeenCalled());
  });

  it("calls onSuccess and onClose after successful creation", async () => {
    render(<CreateIndicatorModal {...defaultProps} />);
    await waitFor(() => expect(mockGetCatalogs).toHaveBeenCalled());
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => expect(defaultProps.onSuccess).toHaveBeenCalled());
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("handles create error gracefully", async () => {
    mockCreateIndicator.mockRejectedValueOnce(new Error("create fail"));
    render(<CreateIndicatorModal {...defaultProps} />);
    await waitFor(() => expect(mockGetCatalogs).toHaveBeenCalled());
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(
      expect.objectContaining({ color: "danger" })
    ));
  });

  it("renders textarea and pilar fields", () => {
    render(<CreateIndicatorModal {...defaultProps} />);
    expect(screen.getByLabelText("Descripción")).toBeInTheDocument();
    expect(screen.getByText("Cód. Pilar")).toBeInTheDocument();
    expect(screen.getByText("Cód. Componente")).toBeInTheDocument();
    expect(screen.getByText("Nombre Componente")).toBeInTheDocument();
    expect(screen.getByText("Cód. Programa")).toBeInTheDocument();
    expect(screen.getByLabelText("Observaciones")).toBeInTheDocument();
  });

  it("renders select fields for classification", () => {
    render(<CreateIndicatorModal {...defaultProps} />);
    expect(screen.getByLabelText("Tipo de Indicador")).toBeInTheDocument();
    expect(screen.getByLabelText("Unidad de Medida")).toBeInTheDocument();
    expect(screen.getByLabelText("Sentido del Indicador")).toBeInTheDocument();
  });
});
