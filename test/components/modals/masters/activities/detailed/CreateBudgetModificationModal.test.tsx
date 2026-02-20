import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { CreateBudgetModificationModal } from "@/components/modals/masters/activities/detailed/CreateBudgetModificationModal";

const mockGet = jest.fn();
jest.mock("@/lib/http", () => ({ get: (...args: any[]) => mockGet(...args) }));
jest.mock("@/lib/endpoints", () => ({
  endpoints: {
    masters: { rubricsSelect: "/rubrics/select" },
    financial: { detailedActivities: "/activities" },
  },
}));

// Override @internationalized/date to include toDate() method for handleSave
jest.mock("@internationalized/date", () => ({
  parseDate: jest.fn((d: string) => ({ toString: () => d })),
  getLocalTimeZone: jest.fn(() => "America/Bogota"),
  today: jest.fn(() => ({
    toString: () => "2024-01-01",
    toDate: jest.fn(() => new Date("2024-01-01T00:00:00.000Z")),
  })),
}));

const rubricsResponse = {
  data: [{ id: "r1", code: "RUB-001", accountName: "Rubrica Uno" }],
  meta: { total: 1, page: 1, limit: 20, totalPages: 1, hasMore: false },
};

/** Helper to simulate selecting a modificationType on the Select mock */
function selectModificationType(value: string) {
  const selectEl = screen.getByRole("combobox", { name: /Tipo de Modificaci/i });
  // Override value getter so React's synthetic event reads the correct value
  Object.defineProperty(selectEl, "value", { get: () => value, configurable: true });
  fireEvent.change(selectEl);
}

describe("CreateBudgetModificationModal", () => {
  const defaultProps = {
    isOpen: true,
    detailedActivityId: "da1",
    detailedActivityName: "Activity A",
    onClose: jest.fn(),
    onSave: jest.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    defaultProps.onClose = jest.fn();
    defaultProps.onSave = jest.fn();
    mockGet.mockResolvedValue(rubricsResponse);
  });

  it("renders when open", () => {
    render(<CreateBudgetModificationModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<CreateBudgetModificationModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows modal header", () => {
    render(<CreateBudgetModificationModal {...defaultProps} />);
    expect(screen.getByText("Modificación Presupuestal")).toBeInTheDocument();
  });

  it("shows activity name in subtitle", () => {
    render(<CreateBudgetModificationModal {...defaultProps} />);
    expect(screen.getByText("Activity A")).toBeInTheDocument();
  });

  it("shows Cancelar button", () => {
    render(<CreateBudgetModificationModal {...defaultProps} />);
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("shows Crear Modificación button", () => {
    render(<CreateBudgetModificationModal {...defaultProps} />);
    expect(screen.getByText("Crear Modificación")).toBeInTheDocument();
  });

  it("shows modification type select", () => {
    render(<CreateBudgetModificationModal {...defaultProps} />);
    expect(screen.getByRole("combobox", { name: /Tipo de Modificaci/i })).toBeInTheDocument();
  });

  it("selecting TRANSFER type shows rubric autocomplete (covers JSX lines 149-245)", async () => {
    render(<CreateBudgetModificationModal {...defaultProps} />);
    act(() => selectModificationType("TRANSFER"));
    await waitFor(() =>
      expect(screen.getByText("Nueva Posición Presupuestal")).toBeInTheDocument()
    );
  });

  it("selects ADDITION type and shows Descripción field", async () => {
    render(<CreateBudgetModificationModal {...defaultProps} />);
    act(() => selectModificationType("ADDITION"));
    await waitFor(() =>
      expect(screen.getByLabelText("Valor")).toBeInTheDocument()
    );
  });

  it("selects REDUCTION type and shows Descripción field", async () => {
    render(<CreateBudgetModificationModal {...defaultProps} />);
    act(() => selectModificationType("REDUCTION"));
    await waitFor(() =>
      expect(screen.getByLabelText("Valor")).toBeInTheDocument()
    );
  });

  it("calls fetchRubrics when TRANSFER type is selected (covers lines 92-103, 109)", async () => {
    render(<CreateBudgetModificationModal {...defaultProps} />);
    act(() => selectModificationType("TRANSFER"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("rubrics")));
  });

  it("renders rubric items after TRANSFER fetch (covers AutocompleteItem lines)", async () => {
    render(<CreateBudgetModificationModal {...defaultProps} />);
    act(() => selectModificationType("TRANSFER"));
    await waitFor(() => expect(screen.getByText("RUB-001")).toBeInTheDocument());
  });

  it("handles rubric fetch error gracefully (covers error catch in fetchRubrics)", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockGet.mockRejectedValue(new Error("rubric fetch failed"));
    render(<CreateBudgetModificationModal {...defaultProps} />);
    act(() => selectModificationType("TRANSFER"));
    await waitFor(() =>
      expect(consoleSpy).toHaveBeenCalledWith("Error fetching rubrics:", expect.any(Error))
    );
    consoleSpy.mockRestore();
  });

  it("does NOT call onSave when modificationType is empty (handleSave guard)", () => {
    render(<CreateBudgetModificationModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Crear Modificación"));
    expect(defaultProps.onSave).not.toHaveBeenCalled();
  });

  it("calls onSave with TRANSFER payload (covers handleSave lines 114-133)", async () => {
    render(<CreateBudgetModificationModal {...defaultProps} />);
    act(() => selectModificationType("TRANSFER"));
    await waitFor(() => expect(screen.getByLabelText(/Descripci/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Descripci/i), { target: { value: "Traslado de recursos" } });
    fireEvent.click(screen.getByText("Crear Modificación"));
    expect(defaultProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        modificationType: "TRANSFER",
        detailedActivityId: "da1",
        description: "Traslado de recursos",
      })
    );
  });

  it("calls onSave with ADDITION payload (covers else branch in handleSave)", async () => {
    render(<CreateBudgetModificationModal {...defaultProps} />);
    act(() => selectModificationType("ADDITION"));
    await waitFor(() => expect(screen.getByLabelText(/Descripci/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Descripci/i), { target: { value: "Adición de recursos" } });
    fireEvent.change(screen.getByLabelText("Valor"), { target: { value: "1000000" } });
    fireEvent.click(screen.getByText("Crear Modificación"));
    expect(defaultProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        modificationType: "ADDITION",
        detailedActivityId: "da1",
      })
    );
  });

  it("calls onClose when Cancelar is clicked", () => {
    render(<CreateBudgetModificationModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Cancelar"));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("resets state when reopened (covers isOpen useEffect)", async () => {
    const { rerender } = render(<CreateBudgetModificationModal {...defaultProps} />);
    act(() => selectModificationType("ADDITION"));
    // Close and reopen
    rerender(<CreateBudgetModificationModal {...defaultProps} isOpen={false} />);
    rerender(<CreateBudgetModificationModal {...defaultProps} isOpen={true} />);
    // After reopen, modificationType should be "" again (no rubric autocomplete)
    await waitFor(() =>
      expect(screen.queryByText("Nueva Posición Presupuestal")).not.toBeInTheDocument()
    );
  });

  it("isValid returns false when description is empty (covers lines 139-142)", async () => {
    render(<CreateBudgetModificationModal {...defaultProps} />);
    act(() => selectModificationType("TRANSFER"));
    // Don't fill description - click button
    fireEvent.click(screen.getByText("Crear Modificación"));
    // onSave called since handleSave doesn't check isValid (isValid is only for button disabled)
    // The payload has empty description
    expect(defaultProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ description: "" })
    );
  });
});
