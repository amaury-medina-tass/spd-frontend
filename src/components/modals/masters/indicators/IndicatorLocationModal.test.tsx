import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import { IndicatorLocationModal } from "./IndicatorLocationModal";
import { addToast } from "@heroui/toast";

const mockGetActionPlanIndicatorLocations = jest.fn();
const mockGetIndicativePlanIndicatorLocations = jest.fn();
const mockAssociateActionPlanIndicatorLocation = jest.fn();
const mockAssociateIndicativePlanIndicatorLocation = jest.fn();
const mockDisassociateActionPlanIndicatorLocation = jest.fn();
const mockDisassociateIndicativePlanIndicatorLocation = jest.fn();
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
jest.mock("@/services/masters/indicators.service", () => ({
  getActionPlanIndicatorLocations: (...args: any[]) => mockGetActionPlanIndicatorLocations(...args),
  getIndicativePlanIndicatorLocations: (...args: any[]) => mockGetIndicativePlanIndicatorLocations(...args),
  associateActionPlanIndicatorLocation: (...args: any[]) => mockAssociateActionPlanIndicatorLocation(...args),
  associateIndicativePlanIndicatorLocation: (...args: any[]) => mockAssociateIndicativePlanIndicatorLocation(...args),
  disassociateActionPlanIndicatorLocation: (...args: any[]) => mockDisassociateActionPlanIndicatorLocation(...args),
  disassociateIndicativePlanIndicatorLocation: (...args: any[]) => mockDisassociateIndicativePlanIndicatorLocation(...args),
}));
jest.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

// Mock zodResolver so create form is always valid
jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => async () => ({
    values: { address: "Calle 10 # 20 - 30", communeId: "c1", latitude: "4.6", longitude: "-74.0" },
    errors: {},
  }),
}));

const associatedData = [
  { id: "al1", locationId: "loc1", location: { id: "loc1", address: "Calle ABC 123", commune: { name: "Comuna Norte" }, latitude: 4.6, longitude: -74.0 } },
  { id: "al2", locationId: "loc2", location: { id: "loc2", address: "Carrera XYZ 456", commune: { name: "Comuna Sur" }, latitude: null, longitude: null } },
];

const searchResults = [
  { id: "sr1", address: "Avenida 100", commune: { name: "Centro" } },
  { id: "sr2", address: "Diagonal 50", commune: { name: "Norte" } },
];

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  indicatorId: "i1",
  type: "action" as const,
};

describe("IndicatorLocationModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetActionPlanIndicatorLocations.mockResolvedValue(associatedData);
    mockGetIndicativePlanIndicatorLocations.mockResolvedValue(associatedData);
    mockGetLocationsSelect.mockResolvedValue({ data: searchResults });
    mockGetCommunesSelect.mockResolvedValue({ data: [{ id: "c1", code: "CM-01", name: "Comuna 1" }] });
    mockCreateLocation.mockResolvedValue({ id: "new-loc" });
    mockAssociateActionPlanIndicatorLocation.mockResolvedValue({});
    mockAssociateIndicativePlanIndicatorLocation.mockResolvedValue({});
    mockDisassociateActionPlanIndicatorLocation.mockResolvedValue(undefined);
    mockDisassociateIndicativePlanIndicatorLocation.mockResolvedValue(undefined);
  });

  it("renders when open", () => {
    render(<IndicatorLocationModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<IndicatorLocationModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows Ubicaciones heading and subtitle in search mode", () => {
    render(<IndicatorLocationModal {...defaultProps} />);
    expect(screen.getByText("Ubicaciones")).toBeInTheDocument();
    expect(screen.getByText("Gestiona las ubicaciones asociadas")).toBeInTheDocument();
  });

  // fetchAssociatedLocations
  it("calls getActionPlanIndicatorLocations for action type", async () => {
    render(<IndicatorLocationModal {...defaultProps} type="action" />);
    await waitFor(() => expect(mockGetActionPlanIndicatorLocations).toHaveBeenCalledWith("i1"));
  });

  it("calls getIndicativePlanIndicatorLocations for indicative type", async () => {
    render(<IndicatorLocationModal {...defaultProps} type="indicative" />);
    await waitFor(() => expect(mockGetIndicativePlanIndicatorLocations).toHaveBeenCalledWith("i1"));
  });

  it("does not fetch when indicatorId is null", () => {
    render(<IndicatorLocationModal {...defaultProps} indicatorId={null} />);
    expect(mockGetActionPlanIndicatorLocations).not.toHaveBeenCalled();
  });

  it("fetch associated error logs to console", async () => {
    mockGetActionPlanIndicatorLocations.mockRejectedValueOnce(new Error("err"));
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    render(<IndicatorLocationModal {...defaultProps} />);
    await waitFor(() => expect(spy).toHaveBeenCalledWith("Error fetching associated locations:", expect.any(Error)));
    spy.mockRestore();
  });

  // Associated locations display
  it("shows associated locations with address and commune", async () => {
    render(<IndicatorLocationModal {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText("Calle ABC 123")).toBeInTheDocument();
      expect(screen.getByText("Comuna Norte")).toBeInTheDocument();
      expect(screen.getByText("Carrera XYZ 456")).toBeInTheDocument();
    });
  });

  it("shows associated count badge", async () => {
    render(<IndicatorLocationModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("2")).toBeInTheDocument());
  });

  it("shows coordinates when present", async () => {
    render(<IndicatorLocationModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("4.6, -74")).toBeInTheDocument());
  });

  it("shows empty message when no associated locations", async () => {
    mockGetActionPlanIndicatorLocations.mockResolvedValue([]);
    render(<IndicatorLocationModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Sin ubicaciones asociadas")).toBeInTheDocument());
  });

  // Disassociate
  it("handleDisassociate action calls correct service", async () => {
    render(<IndicatorLocationModal {...defaultProps} type="action" />);
    await waitFor(() => expect(screen.getByText("Calle ABC 123")).toBeInTheDocument());
    const dangerBtns = document.querySelectorAll("[color='danger']");
    await act(async () => { (dangerBtns[0] as HTMLElement).click(); });
    await waitFor(() => expect(mockDisassociateActionPlanIndicatorLocation).toHaveBeenCalledWith("i1", "loc1"));
    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("handleDisassociate indicative calls correct service", async () => {
    render(<IndicatorLocationModal {...defaultProps} type="indicative" />);
    await waitFor(() => expect(screen.getByText("Calle ABC 123")).toBeInTheDocument());
    const dangerBtns = document.querySelectorAll("[color='danger']");
    await act(async () => { (dangerBtns[0] as HTMLElement).click(); });
    await waitFor(() => expect(mockDisassociateIndicativePlanIndicatorLocation).toHaveBeenCalledWith("i1", "loc1"));
  });

  it("handleDisassociate error shows toast", async () => {
    mockDisassociateActionPlanIndicatorLocation.mockRejectedValueOnce(new Error("fail"));
    render(<IndicatorLocationModal {...defaultProps} type="action" />);
    await waitFor(() => expect(screen.getByText("Calle ABC 123")).toBeInTheDocument());
    const dangerBtns = document.querySelectorAll("[color='danger']");
    await act(async () => { (dangerBtns[0] as HTMLElement).click(); });
    await waitFor(() => expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" })));
  });

  // Search
  it("searches locations when input >= 3 chars", async () => {
    render(<IndicatorLocationModal {...defaultProps} />);
    await waitFor(() => expect(mockGetActionPlanIndicatorLocations).toHaveBeenCalled());
    const input = screen.getByPlaceholderText("Buscar ubicación...");
    await act(async () => { fireEvent.change(input, { target: { value: "Ave" } }); });
    await waitFor(() => expect(mockGetLocationsSelect).toHaveBeenCalled());
  });

  it("shows search results with address and commune", async () => {
    render(<IndicatorLocationModal {...defaultProps} />);
    await waitFor(() => expect(mockGetActionPlanIndicatorLocations).toHaveBeenCalled());
    const input = screen.getByPlaceholderText("Buscar ubicación...");
    await act(async () => { fireEvent.change(input, { target: { value: "Ave" } }); });
    await waitFor(() => {
      expect(screen.getByText("Avenida 100")).toBeInTheDocument();
      expect(screen.getByText("Centro")).toBeInTheDocument();
    });
  });

  it("handleAssociate action calls correct service from search", async () => {
    render(<IndicatorLocationModal {...defaultProps} type="action" />);
    await waitFor(() => expect(mockGetActionPlanIndicatorLocations).toHaveBeenCalled());
    const input = screen.getByPlaceholderText("Buscar ubicación...");
    await act(async () => { fireEvent.change(input, { target: { value: "Ave" } }); });
    await waitFor(() => expect(screen.getByText("Avenida 100")).toBeInTheDocument());
    await act(async () => { fireEvent.click(screen.getByText("Avenida 100")); });
    await waitFor(() => expect(mockAssociateActionPlanIndicatorLocation).toHaveBeenCalledWith("i1", "sr1"));
    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Ubicación asociada correctamente", color: "success" }));
  });

  it("handleAssociate indicative calls correct service", async () => {
    render(<IndicatorLocationModal {...defaultProps} type="indicative" />);
    await waitFor(() => expect(mockGetIndicativePlanIndicatorLocations).toHaveBeenCalled());
    const input = screen.getByPlaceholderText("Buscar ubicación...");
    await act(async () => { fireEvent.change(input, { target: { value: "Ave" } }); });
    await waitFor(() => expect(screen.getByText("Avenida 100")).toBeInTheDocument());
    await act(async () => { fireEvent.click(screen.getByText("Avenida 100")); });
    await waitFor(() => expect(mockAssociateIndicativePlanIndicatorLocation).toHaveBeenCalledWith("i1", "sr1"));
  });

  it("handleAssociate error shows toast", async () => {
    mockAssociateActionPlanIndicatorLocation.mockRejectedValueOnce(new Error("assoc fail"));
    render(<IndicatorLocationModal {...defaultProps} type="action" />);
    await waitFor(() => expect(mockGetActionPlanIndicatorLocations).toHaveBeenCalled());
    const input = screen.getByPlaceholderText("Buscar ubicación...");
    await act(async () => { fireEvent.change(input, { target: { value: "Ave" } }); });
    await waitFor(() => expect(screen.getByText("Avenida 100")).toBeInTheDocument());
    await act(async () => { fireEvent.click(screen.getByText("Avenida 100")); });
    await waitFor(() => expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" })));
  });

  it("no search results shows create button", async () => {
    mockGetLocationsSelect.mockResolvedValue({ data: [] });
    render(<IndicatorLocationModal {...defaultProps} />);
    await waitFor(() => expect(mockGetActionPlanIndicatorLocations).toHaveBeenCalled());
    const input = screen.getByPlaceholderText("Buscar ubicación...");
    await act(async () => { fireEvent.change(input, { target: { value: "NoExist" } }); });
    await waitFor(() => {
      expect(screen.getByText("No se encontraron resultados")).toBeInTheDocument();
      expect(screen.getByText("Crear nueva ubicación")).toBeInTheDocument();
    });
  });

  // filteredAssociatedLocations
  it("filters associated locations by text", async () => {
    render(<IndicatorLocationModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Calle ABC 123")).toBeInTheDocument());
    const filter = screen.getByPlaceholderText("Filtrar...");
    await act(async () => { fireEvent.change(filter, { target: { value: "Carrera" } }); });
    expect(screen.getByText("Carrera XYZ 456")).toBeInTheDocument();
    expect(screen.queryByText("Calle ABC 123")).not.toBeInTheDocument();
  });

  it("shows filter empty message when no match", async () => {
    render(<IndicatorLocationModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("Calle ABC 123")).toBeInTheDocument());
    const filter = screen.getByPlaceholderText("Filtrar...");
    await act(async () => { fireEvent.change(filter, { target: { value: "zzzzz" } }); });
    expect(screen.getByText("Sin resultados para el filtro")).toBeInTheDocument();
  });

  // Mode switching
  it("Crear nueva switches to create mode", async () => {
    render(<IndicatorLocationModal {...defaultProps} />);
    await waitFor(() => expect(mockGetActionPlanIndicatorLocations).toHaveBeenCalled());
    fireEvent.click(screen.getByText("Crear nueva"));
    expect(screen.getByText("Nueva ubicación")).toBeInTheDocument();
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
    expect(screen.getByText("Guardar")).toBeInTheDocument();
  });

  it("fetches communes on create mode", async () => {
    render(<IndicatorLocationModal {...defaultProps} />);
    await waitFor(() => expect(mockGetActionPlanIndicatorLocations).toHaveBeenCalled());
    await act(async () => { fireEvent.click(screen.getByText("Crear nueva")); });
    await waitFor(() => expect(mockGetCommunesSelect).toHaveBeenCalledWith("limit=100"));
  });

  it("communes fetch error shows toast", async () => {
    mockGetCommunesSelect.mockRejectedValueOnce(new Error("communes err"));
    render(<IndicatorLocationModal {...defaultProps} />);
    await waitFor(() => expect(mockGetActionPlanIndicatorLocations).toHaveBeenCalled());
    await act(async () => { fireEvent.click(screen.getByText("Crear nueva")); });
    await waitFor(() => expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Error al cargar comunas", color: "danger" })));
  });

  it("Cancelar in create mode returns to search", async () => {
    render(<IndicatorLocationModal {...defaultProps} />);
    await waitFor(() => expect(mockGetActionPlanIndicatorLocations).toHaveBeenCalled());
    fireEvent.click(screen.getByText("Crear nueva"));
    expect(screen.getByText("Nueva ubicación")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancelar"));
    expect(screen.getByText("Ubicaciones")).toBeInTheDocument();
  });

  // Address builder toggle
  it("toggles between builder and custom address mode", async () => {
    render(<IndicatorLocationModal {...defaultProps} />);
    await waitFor(() => expect(mockGetActionPlanIndicatorLocations).toHaveBeenCalled());
    await act(async () => { fireEvent.click(screen.getByText("Crear nueva")); });
    expect(screen.getByText("Escribir manualmente")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Escribir manualmente"));
    expect(screen.getByText("Usar constructor")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Usar constructor"));
    expect(screen.getByText("Escribir manualmente")).toBeInTheDocument();
  });

  // Create form submission
  it("handleCreateSubmit creates and associates location", async () => {
    render(<IndicatorLocationModal {...defaultProps} type="action" />);
    await waitFor(() => expect(mockGetActionPlanIndicatorLocations).toHaveBeenCalled());
    await act(async () => { fireEvent.click(screen.getByText("Crear nueva")); });
    const form = document.getElementById("create-location-form")!;
    await act(async () => { fireEvent.submit(form); });
    await waitFor(() => expect(mockCreateLocation).toHaveBeenCalledWith(expect.objectContaining({ communeId: "c1" })));
    await waitFor(() => expect(mockAssociateActionPlanIndicatorLocation).toHaveBeenCalledWith("i1", "new-loc"));
  });

  it("handleCreateSubmit error shows toast", async () => {
    mockCreateLocation.mockRejectedValueOnce(new Error("create fail"));
    render(<IndicatorLocationModal {...defaultProps} type="action" />);
    await waitFor(() => expect(mockGetActionPlanIndicatorLocations).toHaveBeenCalled());
    await act(async () => { fireEvent.click(screen.getByText("Crear nueva")); });
    const form = document.getElementById("create-location-form")!;
    await act(async () => { fireEvent.submit(form); });
    await waitFor(() => expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" })));
  });

  it("renders dialog when indicatorId is null", () => {
    render(<IndicatorLocationModal {...defaultProps} indicatorId={null} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
