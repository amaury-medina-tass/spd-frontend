import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { CreateActionPlanIndicatorModal } from "@/components/modals/masters/indicators/action-plan/CreateActionPlanIndicatorModal";
import { addToast } from "@heroui/toast";

const mockCreate = jest.fn();
const mockGetCatalogs = jest.fn();

jest.mock("@/services/masters/indicators.service", () => ({
  createActionPlanIndicator: (...args: any[]) => mockCreate(...args),
  getIndicatorCatalogs: (...args: any[]) => mockGetCatalogs(...args),
}));

jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => () => ({ values: {}, errors: {} }),
}));

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSuccess: jest.fn(),
};

describe("CreateActionPlanIndicatorModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreate.mockResolvedValue({});
    mockGetCatalogs.mockResolvedValue({
      unitMeasures: [{ id: 1, name: "Kilogramos" }, { id: 2, name: "Unidades" }],
    });
  });

  it("renders when open", () => {
    render(<CreateActionPlanIndicatorModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<CreateActionPlanIndicatorModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders modal title", () => {
    render(<CreateActionPlanIndicatorModal {...defaultProps} />);
    expect(screen.getByText("Crear Indicador (Plan de Acción)")).toBeInTheDocument();
  });

  it("renders Información Básica section", () => {
    render(<CreateActionPlanIndicatorModal {...defaultProps} />);
    expect(screen.getByText("Información Básica")).toBeInTheDocument();
  });

  it("renders Metas y Ejecución section", () => {
    render(<CreateActionPlanIndicatorModal {...defaultProps} />);
    expect(screen.getByText("Metas y Ejecución")).toBeInTheDocument();
  });

  it("renders all form field labels", () => {
    render(<CreateActionPlanIndicatorModal {...defaultProps} />);
    // Input labels are visible text
    expect(screen.getByText("Código")).toBeInTheDocument();
    expect(screen.getByText("Código Estadístico")).toBeInTheDocument();
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("Número de Secuencia")).toBeInTheDocument();
    expect(screen.getByText("Cantidad Planeada")).toBeInTheDocument();
    expect(screen.getByText("Corte de Ejecución")).toBeInTheDocument();
    expect(screen.getByText("Porcentaje de Cumplimiento")).toBeInTheDocument();
    // Select/Textarea labels are aria-label
    expect(screen.getByLabelText("Unidad de Medida")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripción")).toBeInTheDocument();
    expect(screen.getByLabelText("Observaciones")).toBeInTheDocument();
  });

  it("renders Cancelar and Crear buttons", () => {
    render(<CreateActionPlanIndicatorModal {...defaultProps} />);
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
    expect(screen.getByText("Crear")).toBeInTheDocument();
  });

  // Catalog loading
  it("loads catalogs on open", async () => {
    render(<CreateActionPlanIndicatorModal {...defaultProps} />);
    await waitFor(() => expect(mockGetCatalogs).toHaveBeenCalled());
  });

  it("does not re-load catalogs on subsequent opens when already loaded", async () => {
    const { rerender } = render(<CreateActionPlanIndicatorModal {...defaultProps} />);
    await waitFor(() => expect(mockGetCatalogs).toHaveBeenCalledTimes(1));
    rerender(<CreateActionPlanIndicatorModal {...defaultProps} isOpen={false} />);
    rerender(<CreateActionPlanIndicatorModal {...defaultProps} isOpen={true} />);
    expect(mockGetCatalogs).toHaveBeenCalledTimes(1);
  });

  it("shows error toast when catalog loading fails", async () => {
    mockGetCatalogs.mockRejectedValueOnce(new Error("catalog error"));
    render(<CreateActionPlanIndicatorModal {...defaultProps} />);
    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error al cargar catálogos", color: "danger" })
      )
    );
  });

  // Form submission
  it("submits form successfully", async () => {
    render(<CreateActionPlanIndicatorModal {...defaultProps} />);
    await waitFor(() => expect(mockGetCatalogs).toHaveBeenCalled());

    const form = document.getElementById("create-action-plan-indicator-form") as HTMLFormElement;
    expect(form).toBeTruthy();
    await act(async () => {
      fireEvent.submit(form);
    });
    await waitFor(() => expect(mockCreate).toHaveBeenCalled());
    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Indicador creado correctamente", color: "success" })
    );
    expect(defaultProps.onSuccess).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("shows error toast when creation fails", async () => {
    mockCreate.mockRejectedValueOnce(new Error("create failed"));
    render(<CreateActionPlanIndicatorModal {...defaultProps} />);
    await waitFor(() => expect(mockGetCatalogs).toHaveBeenCalled());

    const form = document.getElementById("create-action-plan-indicator-form") as HTMLFormElement;
    await act(async () => {
      fireEvent.submit(form);
    });
    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "create failed", color: "danger" })
      )
    );
  });

  it("shows generic error when creation fails without message", async () => {
    mockCreate.mockRejectedValueOnce({});
    render(<CreateActionPlanIndicatorModal {...defaultProps} />);
    await waitFor(() => expect(mockGetCatalogs).toHaveBeenCalled());

    const form = document.getElementById("create-action-plan-indicator-form") as HTMLFormElement;
    await act(async () => {
      fireEvent.submit(form);
    });
    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error al crear indicador", color: "danger" })
      )
    );
  });

  // Render unit measure select
  it("renders unit measure select", async () => {
    render(<CreateActionPlanIndicatorModal {...defaultProps} />);
    await waitFor(() => expect(mockGetCatalogs).toHaveBeenCalled());
    expect(screen.getByLabelText("Unidad de Medida")).toBeInTheDocument();
  });
});
