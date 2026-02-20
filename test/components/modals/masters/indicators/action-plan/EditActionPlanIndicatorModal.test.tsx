import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { EditActionPlanIndicatorModal } from "@/components/modals/masters/indicators/action-plan/EditActionPlanIndicatorModal";
import { addToast } from "@heroui/toast";

const mockUpdate = jest.fn();
const mockGetCatalogs = jest.fn();

jest.mock("@/services/masters/indicators.service", () => ({
  updateActionPlanIndicator: (...args: any[]) => mockUpdate(...args),
  getIndicatorCatalogs: (...args: any[]) => mockGetCatalogs(...args),
}));

jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => () => ({ values: {}, errors: {} }),
}));

const mockIndicator = {
  id: "ind-1",
  code: "IND-001",
  statisticalCode: "STAT-001",
  name: "Test Indicator",
  sequenceNumber: 1,
  description: "Test description",
  plannedQuantity: 100,
  executionCut: "Q1",
  compliancePercentage: 50,
  observations: "Test obs",
  unitMeasureId: 1,
};

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSuccess: jest.fn(),
  indicator: mockIndicator as any,
};

describe("EditActionPlanIndicatorModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdate.mockResolvedValue({});
    mockGetCatalogs.mockResolvedValue({
      unitMeasures: [{ id: 1, name: "Kilogramos" }, { id: 2, name: "Unidades" }],
    });
  });

  it("renders when open", () => {
    render(<EditActionPlanIndicatorModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<EditActionPlanIndicatorModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders modal title", () => {
    render(<EditActionPlanIndicatorModal {...defaultProps} />);
    expect(screen.getByText("Editar Indicador (Plan de Acción)")).toBeInTheDocument();
  });

  it("renders Información Básica and Metas y Ejecución sections", () => {
    render(<EditActionPlanIndicatorModal {...defaultProps} />);
    expect(screen.getByText("Información Básica")).toBeInTheDocument();
    expect(screen.getByText("Metas y Ejecución")).toBeInTheDocument();
  });

  it("renders all form fields", () => {
    render(<EditActionPlanIndicatorModal {...defaultProps} />);
    expect(screen.getByText("Código")).toBeInTheDocument();
    expect(screen.getByText("Código Estadístico")).toBeInTheDocument();
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("Número de Secuencia")).toBeInTheDocument();
    expect(screen.getByLabelText("Unidad de Medida")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripción")).toBeInTheDocument();
    expect(screen.getByText("Cantidad Planeada")).toBeInTheDocument();
    expect(screen.getByText("Corte de Ejecución")).toBeInTheDocument();
    expect(screen.getByText("Porcentaje de Cumplimiento")).toBeInTheDocument();
    expect(screen.getByLabelText("Observaciones")).toBeInTheDocument();
  });

  it("renders Cancelar and Guardar Cambios buttons", () => {
    render(<EditActionPlanIndicatorModal {...defaultProps} />);
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
    expect(screen.getByText("Guardar Cambios")).toBeInTheDocument();
  });

  // Catalog loading
  it("loads catalogs on open", async () => {
    render(<EditActionPlanIndicatorModal {...defaultProps} />);
    await waitFor(() => expect(mockGetCatalogs).toHaveBeenCalled());
  });

  it("shows error toast when catalog loading fails", async () => {
    mockGetCatalogs.mockRejectedValueOnce(new Error("catalog error"));
    render(<EditActionPlanIndicatorModal {...defaultProps} />);
    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error al cargar catálogos", color: "danger" })
      )
    );
  });

  // Indicator reset via useEffect
  it("renders with indicator data", () => {
    render(<EditActionPlanIndicatorModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("handles null indicator", () => {
    render(<EditActionPlanIndicatorModal {...defaultProps} indicator={null} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // Form submission
  it("submits form successfully", async () => {
    render(<EditActionPlanIndicatorModal {...defaultProps} />);
    await waitFor(() => expect(mockGetCatalogs).toHaveBeenCalled());

    const form = document.getElementById("edit-action-plan-indicator-form") as HTMLFormElement;
    expect(form).toBeTruthy();
    await act(async () => {
      fireEvent.submit(form);
    });
    await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith("ind-1", expect.any(Object)));
    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Indicador actualizado correctamente", color: "success" })
    );
    expect(defaultProps.onSuccess).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("does not submit when indicator is null", async () => {
    render(<EditActionPlanIndicatorModal {...defaultProps} indicator={null} />);
    await waitFor(() => expect(mockGetCatalogs).toHaveBeenCalled());

    const form = document.getElementById("edit-action-plan-indicator-form") as HTMLFormElement;
    await act(async () => {
      fireEvent.submit(form);
    });
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("shows error toast when update fails", async () => {
    mockUpdate.mockRejectedValueOnce(new Error("update failed"));
    render(<EditActionPlanIndicatorModal {...defaultProps} />);
    await waitFor(() => expect(mockGetCatalogs).toHaveBeenCalled());

    const form = document.getElementById("edit-action-plan-indicator-form") as HTMLFormElement;
    await act(async () => {
      fireEvent.submit(form);
    });
    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "update failed", color: "danger" })
      )
    );
  });

  it("shows generic error when update fails without message", async () => {
    mockUpdate.mockRejectedValueOnce({});
    render(<EditActionPlanIndicatorModal {...defaultProps} />);
    await waitFor(() => expect(mockGetCatalogs).toHaveBeenCalled());

    const form = document.getElementById("edit-action-plan-indicator-form") as HTMLFormElement;
    await act(async () => {
      fireEvent.submit(form);
    });
    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error al actualizar indicador", color: "danger" })
      )
    );
  });
});
