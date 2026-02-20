import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { CreateDetailedActivityModal } from "./CreateDetailedActivityModal";

const mockGet = jest.fn();
jest.mock("@/lib/http", () => ({ get: (...args: any[]) => mockGet(...args) }));
jest.mock("@/lib/endpoints", () => ({
  endpoints: {
    financial: { projectsSelect: "/projects/select" },
    masters: { rubricsSelect: "/rubrics/select" },
  },
}));

// Mock zodResolver to always return valid so we can test onSubmit
jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => async () => ({
    values: {
      code: "ACT-001",
      cpc: "CPC-001",
      name: "Test Activity",
      observations: "obs",
      activityDate: { toDate: () => new Date("2024-01-01T00:00:00Z") },
      budgetCeiling: "5000000",
      projectId: "proj1",
      rubricId: "rub1",
    },
    errors: {},
  }),
}));

const projectsResponse = {
  data: [{ id: "proj1", code: "P001", name: "Project Alpha" }],
  meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
};
const rubricsResponse = {
  data: [{ id: "rub1", code: "R001", accountName: "Rubric One" }],
  meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
};

describe("CreateDetailedActivityModal", () => {
  const defaultProps = { isOpen: true, onClose: jest.fn(), onSave: jest.fn(), isLoading: false };

  beforeEach(() => {
    jest.clearAllMocks();
    defaultProps.onClose = jest.fn();
    defaultProps.onSave = jest.fn();
    mockGet.mockImplementation((url: string) => {
      if (url.includes("projects")) return Promise.resolve(projectsResponse);
      if (url.includes("rubrics")) return Promise.resolve(rubricsResponse);
      return Promise.resolve({ data: [] });
    });
  });

  it("renders when open", () => {
    render(<CreateDetailedActivityModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<CreateDetailedActivityModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows modal header", () => {
    render(<CreateDetailedActivityModal {...defaultProps} />);
    expect(screen.getByText("Nueva Actividad Detallada")).toBeInTheDocument();
  });

  it("shows Código Input label", () => {
    render(<CreateDetailedActivityModal {...defaultProps} />);
    expect(screen.getByText("Código")).toBeInTheDocument();
  });

  it("shows Nombre Input label", () => {
    render(<CreateDetailedActivityModal {...defaultProps} />);
    expect(screen.getByText("Nombre")).toBeInTheDocument();
  });

  it("shows Cancelar button", () => {
    render(<CreateDetailedActivityModal {...defaultProps} />);
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("shows Crear button", () => {
    render(<CreateDetailedActivityModal {...defaultProps} />);
    expect(screen.getByText("Crear")).toBeInTheDocument();
  });

  it("calls get to fetch projects when modal opens (covers fetchProjects useEffect)", async () => {
    render(<CreateDetailedActivityModal {...defaultProps} />);
    await waitFor(() =>
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("projects"))
    );
  });

  it("calls get to fetch rubrics when modal opens (covers fetchRubrics useEffect)", async () => {
    render(<CreateDetailedActivityModal {...defaultProps} />);
    await waitFor(() =>
      expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("rubrics"))
    );
  });

  it("renders loaded project items in autocomplete (covers AutocompleteItem lines 355-368)", async () => {
    render(<CreateDetailedActivityModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("P001")).toBeInTheDocument());
  });

  it("renders loaded rubric items in autocomplete (covers AutocompleteItem lines 392-393)", async () => {
    render(<CreateDetailedActivityModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("R001")).toBeInTheDocument());
  });

  it("handles project fetch error gracefully (covers lines 176-188)", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockGet.mockImplementation((url: string) => {
      if (url.includes("projects")) return Promise.reject(new Error("Projects unavailable"));
      return Promise.resolve({ data: [] });
    });
    render(<CreateDetailedActivityModal {...defaultProps} />);
    await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith("Error fetching projects:", expect.any(Error)));
    consoleSpy.mockRestore();
  });

  it("handles rubric fetch error gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockGet.mockImplementation((url: string) => {
      if (url.includes("rubrics")) return Promise.reject(new Error("Rubrics unavailable"));
      return Promise.resolve({ data: [] });
    });
    render(<CreateDetailedActivityModal {...defaultProps} />);
    await waitFor(() => expect(consoleSpy).toHaveBeenCalledWith("Error fetching rubrics:", expect.any(Error)));
    consoleSpy.mockRestore();
  });

  it("calls onClose when Cancelar is clicked (covers handleClose)", () => {
    render(<CreateDetailedActivityModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Cancelar"));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("shows Valor label", () => {
    render(<CreateDetailedActivityModal {...defaultProps} />);
    expect(screen.getByText("Valor")).toBeInTheDocument();
  });

  it("shows Observaciones textarea", () => {
    render(<CreateDetailedActivityModal {...defaultProps} />);
    expect(screen.getByLabelText("Observaciones")).toBeInTheDocument();
  });

  it("shows Proyecto label", () => {
    render(<CreateDetailedActivityModal {...defaultProps} />);
    expect(screen.getByText("Proyecto")).toBeInTheDocument();
  });

  it("shows Posición Presupuestal label", () => {
    render(<CreateDetailedActivityModal {...defaultProps} />);
    expect(screen.getByText("Posición Presupuestal")).toBeInTheDocument();
  });

  it("re-fetches projects when re-opened", async () => {
    const { rerender } = render(<CreateDetailedActivityModal {...defaultProps} isOpen={false} />);
    rerender(<CreateDetailedActivityModal {...defaultProps} isOpen={true} />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining("projects")));
  });

  it("onSubmit calls onSave with payload", async () => {
    render(<CreateDetailedActivityModal {...defaultProps} />);
    const form = document.querySelector("form")!;
    await act(async () => { fireEvent.submit(form); });
    await waitFor(() => expect(defaultProps.onSave).toHaveBeenCalledWith(expect.objectContaining({
      code: "ACT-001",
      name: "Test Activity",
      cpc: "CPC-001",
      projectId: "proj1",
      rubricId: "rub1",
    })));
  });

  it("onSubmit includes activityDate ISO string", async () => {
    render(<CreateDetailedActivityModal {...defaultProps} />);
    const form = document.querySelector("form")!;
    await act(async () => { fireEvent.submit(form); });
    await waitFor(() => expect(defaultProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ activityDate: expect.stringContaining("2024-01-01") })
    ));
  });

  it("onSubmit parses budgetCeiling to number", async () => {
    render(<CreateDetailedActivityModal {...defaultProps} />);
    const form = document.querySelector("form")!;
    await act(async () => { fireEvent.submit(form); });
    await waitFor(() => expect(defaultProps.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ budgetCeiling: 5000000, balance: 5000000 })
    ));
  });
});
