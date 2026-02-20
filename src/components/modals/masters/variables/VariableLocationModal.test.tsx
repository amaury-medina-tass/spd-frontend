import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { VariableLocationModal } from "./VariableLocationModal";
import { addToast } from "@heroui/toast";

const mockGetVariableLocations = jest.fn();
const mockAssociateVariableLocation = jest.fn();
const mockDisassociateVariableLocation = jest.fn();
const mockGetLocationsSelect = jest.fn();
const mockCreateLocation = jest.fn();
const mockGetCommunesSelect = jest.fn();

jest.mock("@/services/masters/locations.service", () => ({
  getLocationsSelect: (...args: any[]) => mockGetLocationsSelect(...args),
  createLocation: (...args: any[]) => mockCreateLocation(...args),
}));
jest.mock("@/services/masters/communes.service", () => ({
  getCommunesSelect: (...args: any[]) => mockGetCommunesSelect(...args),
}));
jest.mock("@/services/masters/variables.service", () => ({
  getVariableLocations: (...args: any[]) => mockGetVariableLocations(...args),
  associateVariableLocation: (...args: any[]) => mockAssociateVariableLocation(...args),
  disassociateVariableLocation: (...args: any[]) => mockDisassociateVariableLocation(...args),
}));
jest.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));
jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => async (values: any) => ({ values, errors: {} }),
}));

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  variableId: "v1",
  variableCode: "VAR-001",
};

describe("VariableLocationModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetVariableLocations.mockResolvedValue([]);
    mockGetLocationsSelect.mockResolvedValue({ data: [] });
    mockGetCommunesSelect.mockResolvedValue({ data: [] });
    mockCreateLocation.mockResolvedValue({ id: "new-loc" });
    mockAssociateVariableLocation.mockResolvedValue({});
    mockDisassociateVariableLocation.mockResolvedValue(undefined);
  });

  it("renders when open", () => {
    render(<VariableLocationModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<VariableLocationModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows 'Ubicaciones' heading in search mode", () => {
    render(<VariableLocationModal {...defaultProps} />);
    expect(screen.getByText("Ubicaciones")).toBeInTheDocument();
  });

  it("shows variable code in header", () => {
    render(<VariableLocationModal {...defaultProps} />);
    expect(screen.getByText("(VAR-001)")).toBeInTheDocument();
  });

  it("shows search management subtitle", () => {
    render(<VariableLocationModal {...defaultProps} />);
    expect(screen.getByText(/gestiona las ubicaciones/i)).toBeInTheDocument();
  });

  it("calls getVariableLocations on open with variableId", async () => {
    render(<VariableLocationModal {...defaultProps} />);
    await waitFor(() => expect(mockGetVariableLocations).toHaveBeenCalledWith("v1"));
  });

  it("does not fetch when variableId is null", async () => {
    render(<VariableLocationModal {...defaultProps} variableId={null} />);
    await waitFor(() => expect(mockGetVariableLocations).not.toHaveBeenCalled());
  });

  it("renders search input placeholder", () => {
    render(<VariableLocationModal {...defaultProps} />);
    expect(screen.getByPlaceholderText(/buscar ubicación/i)).toBeInTheDocument();
  });

  // --- Associated locations ---

  it("shows 'Sin ubicaciones asociadas' when none returned", async () => {
    render(<VariableLocationModal {...defaultProps} />);
    await waitFor(() => expect(mockGetVariableLocations).toHaveBeenCalled());
    expect(screen.getByText("Sin ubicaciones asociadas")).toBeInTheDocument();
  });

  it("renders associated location addresses", async () => {
    mockGetVariableLocations.mockResolvedValue([
      { id: "al1", locationId: "loc1", location: { id: "loc1", address: "Calle 10 # 20 - 30", commune: { name: "Comuna Norte" } } },
    ]);
    render(<VariableLocationModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Calle 10 # 20 - 30")).toBeInTheDocument());
    expect(screen.getByText("Comuna Norte")).toBeInTheDocument();
  });

  it("shows location count badge", async () => {
    mockGetVariableLocations.mockResolvedValue([
      { id: "al1", locationId: "loc1", location: { address: "Addr 1", commune: { name: "C1" } } },
      { id: "al2", locationId: "loc2", location: { address: "Addr 2", commune: { name: "C2" } } },
    ]);
    render(<VariableLocationModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("2")).toBeInTheDocument());
  });

  // --- Search ---

  it("fetches search results when search > 3 chars", async () => {
    mockGetLocationsSelect.mockResolvedValue({
      data: [{ id: "s1", address: "Av. Siempre Viva 742", commune: { name: "Springfield" } }],
    });
    render(<VariableLocationModal {...defaultProps} />);
    const input = screen.getByPlaceholderText(/buscar ubicación/i);
    fireEvent.change(input, { target: { value: "Siempre" } });
    await waitFor(() => expect(mockGetLocationsSelect).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText("Av. Siempre Viva 742")).toBeInTheDocument());
  });

  it("shows 'No se encontraron resultados' when search returns empty", async () => {
    mockGetLocationsSelect.mockResolvedValue({ data: [] });
    render(<VariableLocationModal {...defaultProps} />);
    const input = screen.getByPlaceholderText(/buscar ubicación/i);
    fireEvent.change(input, { target: { value: "xyz123" } });
    await waitFor(() => expect(mockGetLocationsSelect).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText("No se encontraron resultados")).toBeInTheDocument());
  });

  // --- handleAssociate ---

  it("calls associateVariableLocation when clicking search result", async () => {
    mockGetLocationsSelect.mockResolvedValue({
      data: [{ id: "loc-x", address: "Calle Nueva 100", commune: { name: "Centro" } }],
    });
    render(<VariableLocationModal {...defaultProps} />);
    const input = screen.getByPlaceholderText(/buscar ubicación/i);
    fireEvent.change(input, { target: { value: "Nueva" } });
    await waitFor(() => expect(screen.getByText("Calle Nueva 100")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Calle Nueva 100").closest("button")!);
    await waitFor(() => expect(mockAssociateVariableLocation).toHaveBeenCalledWith("v1", "loc-x"));
  });

  // --- handleDisassociate ---

  it("calls disassociateVariableLocation when clicking delete on associated location", async () => {
    mockGetVariableLocations.mockResolvedValue([
      { id: "al1", locationId: "loc1", location: { address: "Calle Borrar", commune: { name: "C1" } } },
    ]);
    render(<VariableLocationModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Calle Borrar")).toBeInTheDocument());
    // The delete button is a Button (rendered as div data-testid="Button") with Trash2 icon
    const deleteButtons = screen.getAllByTestId("Button");
    // Find the one that's a delete action (last Button near the associated location)
    const trashButton = deleteButtons.find(btn => btn.querySelector('[data-testid="icon-Trash2"]'));
    expect(trashButton).toBeTruthy();
    fireEvent.click(trashButton!);
    await waitFor(() => expect(mockDisassociateVariableLocation).toHaveBeenCalledWith("v1", "loc1"));
  });

  // --- Mode switching ---

  it("switches to create mode when 'Crear nueva' clicked", async () => {
    render(<VariableLocationModal {...defaultProps} />);
    await waitFor(() => expect(mockGetVariableLocations).toHaveBeenCalled());
    fireEvent.click(screen.getByText("Crear nueva"));
    await waitFor(() => expect(screen.getByText("Nueva ubicación")).toBeInTheDocument());
  });

  it("switches to create mode from no results", async () => {
    mockGetLocationsSelect.mockResolvedValue({ data: [] });
    render(<VariableLocationModal {...defaultProps} />);
    const input = screen.getByPlaceholderText(/buscar ubicación/i);
    fireEvent.change(input, { target: { value: "abc" } });
    await waitFor(() => expect(screen.getByText("No se encontraron resultados")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Crear nueva ubicación"));
    await waitFor(() => expect(screen.getByText("Nueva ubicación")).toBeInTheDocument());
  });

  it("shows Cancelar button in create mode and returns to search", async () => {
    render(<VariableLocationModal {...defaultProps} />);
    await waitFor(() => expect(mockGetVariableLocations).toHaveBeenCalled());
    fireEvent.click(screen.getByText("Crear nueva"));
    await waitFor(() => expect(screen.getByText("Cancelar")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Cancelar"));
    await waitFor(() => expect(screen.getByText("Ubicaciones")).toBeInTheDocument());
  });

  // --- Create mode UI ---

  it("fetches communes when switching to create mode", async () => {
    render(<VariableLocationModal {...defaultProps} />);
    await waitFor(() => expect(mockGetVariableLocations).toHaveBeenCalled());
    fireEvent.click(screen.getByText("Crear nueva"));
    await waitFor(() => expect(mockGetCommunesSelect).toHaveBeenCalledWith("limit=100"));
  });

  it("shows address builder toggle", async () => {
    render(<VariableLocationModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Crear nueva"));
    await waitFor(() => expect(screen.getByText("Escribir manualmente")).toBeInTheDocument());
  });

  // --- Error handling ---

  it("handles getVariableLocations error gracefully", async () => {
    mockGetVariableLocations.mockRejectedValue(new Error("Network error"));
    render(<VariableLocationModal {...defaultProps} />);
    await waitFor(() => expect(mockGetVariableLocations).toHaveBeenCalled());
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders dialog when variableId is null", () => {
    render(<VariableLocationModal {...defaultProps} variableId={null} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows Cerrar button in search mode", () => {
    render(<VariableLocationModal {...defaultProps} />);
    expect(screen.getByText("Cerrar")).toBeInTheDocument();
  });

  it("renders Asociadas section", () => {
    render(<VariableLocationModal {...defaultProps} />);
    expect(screen.getByText("Asociadas")).toBeInTheDocument();
  });

  it("renders filter input for associated locations", () => {
    render(<VariableLocationModal {...defaultProps} />);
    expect(screen.getByPlaceholderText("Filtrar...")).toBeInTheDocument();
  });

  // --- Create mode form fields ---

  it("shows address builder fields in create mode", async () => {
    render(<VariableLocationModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Crear nueva"));
    await waitFor(() => {
      expect(screen.getByLabelText("Tipo de vía")).toBeInTheDocument();
      expect(screen.getByLabelText("Número de vía")).toBeInTheDocument();
      expect(screen.getByLabelText("Número cruce (#)")).toBeInTheDocument();
      expect(screen.getByLabelText("Número casa (-)")).toBeInTheDocument();
      expect(screen.getByLabelText("Información adicional")).toBeInTheDocument();
    });
  });

  it("shows coordinate fields in create mode", async () => {
    render(<VariableLocationModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Crear nueva"));
    await waitFor(() => {
      expect(screen.getByLabelText("Latitud")).toBeInTheDocument();
      expect(screen.getByLabelText("Longitud")).toBeInTheDocument();
    });
  });

  it("shows Guardar button in create mode", async () => {
    render(<VariableLocationModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Crear nueva"));
    await waitFor(() => expect(screen.getByText("Guardar")).toBeInTheDocument());
  });

  it("shows Comuna autocomplete in create mode", async () => {
    render(<VariableLocationModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Crear nueva"));
    await waitFor(() => expect(screen.getByText("Comuna")).toBeInTheDocument());
  });

  // --- Toggle builder/custom mode ---

  it("toggles to custom address mode", async () => {
    render(<VariableLocationModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Crear nueva"));
    await waitFor(() => expect(screen.getByText("Escribir manualmente")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Escribir manualmente"));
    await waitFor(() => {
      expect(screen.getByText("Usar constructor")).toBeInTheDocument();
      expect(screen.getByLabelText("Dirección personalizada")).toBeInTheDocument();
    });
  });

  it("toggles back to builder mode and resets fields", async () => {
    render(<VariableLocationModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Crear nueva"));
    fireEvent.click(screen.getByText("Escribir manualmente"));
    await waitFor(() => expect(screen.getByText("Usar constructor")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Usar constructor"));
    await waitFor(() => expect(screen.getByText("Escribir manualmente")).toBeInTheDocument());
  });

  // --- Create form submission ---

  it("submits create form successfully", async () => {
    mockCreateLocation.mockResolvedValue({ id: "new-loc-1" });
    render(<VariableLocationModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Crear nueva"));
    await waitFor(() => expect(screen.getByText("Guardar")).toBeInTheDocument());

    const form = document.getElementById("create-location-form");
    await act(async () => {
      fireEvent.submit(form!);
    });

    await waitFor(() => {
      expect(mockCreateLocation).toHaveBeenCalled();
      expect(mockAssociateVariableLocation).toHaveBeenCalledWith("v1", "new-loc-1");
    });
  });

  it("returns to search mode after successful create", async () => {
    mockCreateLocation.mockResolvedValue({ id: "new-loc-2" });
    render(<VariableLocationModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Crear nueva"));
    await waitFor(() => expect(screen.getByText("Nueva ubicación")).toBeInTheDocument());

    const form = document.getElementById("create-location-form");
    await act(async () => {
      fireEvent.submit(form!);
    });

    await waitFor(() => expect(screen.getByText("Ubicaciones")).toBeInTheDocument());
  });

  it("handles create form submit error", async () => {
    mockCreateLocation.mockRejectedValue(new Error("Create failed"));
    render(<VariableLocationModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Crear nueva"));
    await waitFor(() => expect(screen.getByText("Guardar")).toBeInTheDocument());

    const form = document.getElementById("create-location-form");
    await act(async () => {
      fireEvent.submit(form!);
    });

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Create failed", color: "danger" })
      );
    });
  });

  it("does not create when variableId is null", async () => {
    render(<VariableLocationModal {...defaultProps} variableId={null} />);
    fireEvent.click(screen.getByText("Crear nueva"));
    await waitFor(() => expect(screen.getByText("Guardar")).toBeInTheDocument());

    const form = document.getElementById("create-location-form");
    await act(async () => {
      fireEvent.submit(form!);
    });

    await waitFor(() => expect(mockCreateLocation).not.toHaveBeenCalled());
  });

  // --- Associate / Disassociate errors ---

  it("handles associate error", async () => {
    mockAssociateVariableLocation.mockRejectedValue(new Error("Association failed"));
    mockGetLocationsSelect.mockResolvedValue({
      data: [{ id: "loc-err", address: "Error Addr", commune: { name: "C" } }],
    });
    render(<VariableLocationModal {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText(/buscar ubicación/i), { target: { value: "Error" } });
    await waitFor(() => expect(screen.getByText("Error Addr")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Error Addr").closest("button")!);

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Association failed", color: "danger" })
      );
    });
  });

  it("handles disassociate error", async () => {
    mockDisassociateVariableLocation.mockRejectedValue(new Error("Delete failed"));
    mockGetVariableLocations.mockResolvedValue([
      { id: "al1", locationId: "loc1", location: { address: "Del Addr", commune: { name: "C1" } } },
    ]);
    render(<VariableLocationModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Del Addr")).toBeInTheDocument());

    const trashIcon = screen.getByTestId("icon-Trash2");
    fireEvent.click(trashIcon.closest('[data-testid="Button"]')!);

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Delete failed", color: "danger" })
      );
    });
  });

  // --- Filter associated locations ---

  it("filters associated locations by address", async () => {
    mockGetVariableLocations.mockResolvedValue([
      { id: "al1", locationId: "loc1", location: { address: "Calle Norte", commune: { name: "Comuna A" } } },
      { id: "al2", locationId: "loc2", location: { address: "Avenida Sur", commune: { name: "Comuna B" } } },
    ]);
    render(<VariableLocationModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Calle Norte")).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText("Filtrar..."), { target: { value: "Norte" } });
    await waitFor(() => {
      expect(screen.getByText("Calle Norte")).toBeInTheDocument();
      expect(screen.queryByText("Avenida Sur")).not.toBeInTheDocument();
    });
  });

  it("filters associated locations by commune name", async () => {
    mockGetVariableLocations.mockResolvedValue([
      { id: "al1", locationId: "loc1", location: { address: "Addr 1", commune: { name: "Centro" } } },
      { id: "al2", locationId: "loc2", location: { address: "Addr 2", commune: { name: "Norte" } } },
    ]);
    render(<VariableLocationModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Addr 1")).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText("Filtrar..."), { target: { value: "Centro" } });
    await waitFor(() => {
      expect(screen.getByText("Addr 1")).toBeInTheDocument();
      expect(screen.queryByText("Addr 2")).not.toBeInTheDocument();
    });
  });

  it("shows 'Sin resultados para el filtro' when filter matches nothing", async () => {
    mockGetVariableLocations.mockResolvedValue([
      { id: "al1", locationId: "loc1", location: { address: "Calle X", commune: { name: "C" } } },
    ]);
    render(<VariableLocationModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Calle X")).toBeInTheDocument());

    fireEvent.change(screen.getByPlaceholderText("Filtrar..."), { target: { value: "ZZZZZ" } });
    await waitFor(() => expect(screen.getByText("Sin resultados para el filtro")).toBeInTheDocument());
  });

  // --- Associated location details ---

  it("renders coordinates for associated location with lat/lng", async () => {
    mockGetVariableLocations.mockResolvedValue([
      { id: "al1", locationId: "loc1", location: { address: "Addr 1", latitude: 4.6097, longitude: -74.0817, commune: { name: "C1" } } },
    ]);
    render(<VariableLocationModal {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText("Addr 1")).toBeInTheDocument();
      expect(screen.getByText("4.6097, -74.0817")).toBeInTheDocument();
    });
  });

  it("shows 'Sin dirección' for location without address", async () => {
    mockGetVariableLocations.mockResolvedValue([
      { id: "al1", locationId: "loc1", location: { address: "", commune: { name: "C1" } } },
    ]);
    render(<VariableLocationModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Sin dirección")).toBeInTheDocument());
  });

  // --- Communes / search result states ---

  it("handles communes fetch error in create mode", async () => {
    mockGetCommunesSelect.mockRejectedValue(new Error("Communes error"));
    render(<VariableLocationModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Crear nueva"));
    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error al cargar comunas", color: "danger" })
      );
    });
  });

  it("marks search result as associated with check icon and disabled", async () => {
    mockGetVariableLocations.mockResolvedValue([
      { id: "al1", locationId: "loc1", location: { address: "Already", commune: { name: "C" } } },
    ]);
    mockGetLocationsSelect.mockResolvedValue({
      data: [{ id: "loc1", address: "Already Here", commune: { name: "C" } }],
    });
    render(<VariableLocationModal {...defaultProps} />);
    await waitFor(() => expect(mockGetVariableLocations).toHaveBeenCalled());

    fireEvent.change(screen.getByPlaceholderText(/buscar ubicación/i), { target: { value: "Already" } });
    await waitFor(() => {
      expect(screen.getByText("Already Here")).toBeInTheDocument();
      expect(screen.getByTestId("icon-Check")).toBeInTheDocument();
    });
  });

  it("shows subtitle for create mode", async () => {
    render(<VariableLocationModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Crear nueva"));
    await waitFor(() => expect(screen.getByText(/completa los datos/i)).toBeInTheDocument());
  });

  it("non-array data from getVariableLocations is handled", async () => {
    mockGetVariableLocations.mockResolvedValue("not-an-array");
    render(<VariableLocationModal {...defaultProps} />);
    await waitFor(() => expect(mockGetVariableLocations).toHaveBeenCalled());
    expect(screen.getByText("Sin ubicaciones asociadas")).toBeInTheDocument();
  });
});
