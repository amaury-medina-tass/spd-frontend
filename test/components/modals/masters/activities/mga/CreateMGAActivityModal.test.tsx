import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import { CreateMGAActivityModal } from "@/components/modals/masters/activities/mga/CreateMGAActivityModal";
import { get, post } from "@/lib/http";
import { addToast } from "@heroui/toast";

jest.mock("@/lib/http", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));
jest.mock("@/lib/endpoints", () => ({
  endpoints: {
    financial: { projectsSelect: "/projects-select" },
    masters: {
      productsSelect: "/products-select",
      detailedActivitiesSelect: "/detailed-select",
      mgaActivities: "/mga",
    },
  },
}));
jest.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

// Mock zodResolver to always return valid so we can test onSubmit
jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => async () => ({
    values: {
      code: "MGA-001",
      name: "Test MGA",
      observations: "obs",
      activityDate: { toDate: () => new Date("2024-01-01T00:00:00Z") },
      projectId: "p1",
      productId: "pr1",
    },
    errors: {},
  }),
}));

const projectsRes = {
  data: [{ id: "p1", code: "PROJ-001", name: "Project 1" }],
  meta: { total: 1, limit: 20, offset: 0, hasMore: false },
};
const productsRes = {
  data: [{ id: "pr1", productCode: "PROD-001", indicatorName: "Indicator 1" }],
  meta: { total: 1, limit: 20, offset: 0, hasMore: false },
};
const detailedRes = {
  data: [
    { id: "d1", code: "DET-001", name: "Detailed 1", balance: "1000000", project: { code: "P01" }, rubric: { code: "R01" } },
    { id: "d2", code: "DET-002", name: "Detailed 2", balance: "0", project: null, rubric: null },
  ],
  meta: { total: 2, limit: 20, offset: 0, hasMore: false },
};

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  onSuccess: jest.fn(),
};

describe("CreateMGAActivityModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/projects-select")) return Promise.resolve(projectsRes);
      if (url.includes("/products-select")) return Promise.resolve(productsRes);
      if (url.includes("/detailed-select")) return Promise.resolve(detailedRes);
      return Promise.resolve({ data: [], meta: {} });
    });
    (post as jest.Mock).mockResolvedValue({});
  });

  it("renders when open", () => {
    render(<CreateMGAActivityModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<CreateMGAActivityModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows modal title and subtitle", () => {
    render(<CreateMGAActivityModal {...defaultProps} />);
    expect(screen.getByText("Nueva Actividad MGA")).toBeInTheDocument();
    expect(screen.getByText("Registre una nueva actividad MGA en el sistema")).toBeInTheDocument();
  });

  it("shows form fields and buttons", () => {
    render(<CreateMGAActivityModal {...defaultProps} />);
    expect(screen.getByText("Código")).toBeInTheDocument();
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
    expect(screen.getByText("Crear Actividad")).toBeInTheDocument();
  });

  it("fetches projects on open", async () => {
    render(<CreateMGAActivityModal {...defaultProps} />);
    await waitFor(() => expect(get).toHaveBeenCalledWith(expect.stringContaining("/projects-select")));
  });

  it("fetches products on open", async () => {
    render(<CreateMGAActivityModal {...defaultProps} />);
    await waitFor(() => expect(get).toHaveBeenCalledWith(expect.stringContaining("/products-select")));
  });

  it("does not fetch when closed", () => {
    render(<CreateMGAActivityModal {...defaultProps} isOpen={false} />);
    expect(get).not.toHaveBeenCalled();
  });

  it("fetch projects error logs to console", async () => {
    (get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/projects-select")) return Promise.reject(new Error("err"));
      return Promise.resolve(productsRes);
    });
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    render(<CreateMGAActivityModal {...defaultProps} />);
    await waitFor(() => expect(spy).toHaveBeenCalledWith("Error fetching projects", expect.any(Error)));
    spy.mockRestore();
  });

  it("fetch products error logs to console", async () => {
    (get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/products-select")) return Promise.reject(new Error("err"));
      return Promise.resolve(projectsRes);
    });
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    render(<CreateMGAActivityModal {...defaultProps} />);
    await waitFor(() => expect(spy).toHaveBeenCalledWith("Error fetching products", expect.any(Error)));
    spy.mockRestore();
  });

  // Switch toggle
  it("shows detailed activities when Switch toggled", async () => {
    render(<CreateMGAActivityModal {...defaultProps} />);
    const switchEl = screen.getByRole("switch");
    await act(async () => { fireEvent.click(switchEl); });
    await waitFor(() => expect(get).toHaveBeenCalledWith(expect.stringContaining("/detailed-select")));
  });

  it("renders detailed activity items", async () => {
    render(<CreateMGAActivityModal {...defaultProps} />);
    await act(async () => { fireEvent.click(screen.getByRole("switch")); });
    await waitFor(() => {
      expect(screen.getByText("DET-001")).toBeInTheDocument();
      expect(screen.getByText("Detailed 1")).toBeInTheDocument();
    });
  });

  it("shows project/rubric codes or N/A", async () => {
    render(<CreateMGAActivityModal {...defaultProps} />);
    await act(async () => { fireEvent.click(screen.getByRole("switch")); });
    await waitFor(() => {
      expect(screen.getByText(/Proy: P01/)).toBeInTheDocument();
      expect(screen.getByText(/PosPre: R01/)).toBeInTheDocument();
      expect(screen.getAllByText(/N\/A/).length).toBeGreaterThan(0);
    });
  });

  it("formatCurrency renders formatted balance", async () => {
    render(<CreateMGAActivityModal {...defaultProps} />);
    await act(async () => { fireEvent.click(screen.getByRole("switch")); });
    await waitFor(() => {
      // Check some currency output is rendered for balance "1000000"
      const container = document.querySelector(".overflow-y-auto");
      expect(container?.textContent).toMatch(/1[.,]000[.,]000/);
    });
  });

  // toggleSelection
  it("toggleSelection selects and deselects items", async () => {
    render(<CreateMGAActivityModal {...defaultProps} />);
    await act(async () => { fireEvent.click(screen.getByRole("switch")); });
    await waitFor(() => expect(screen.getByText("DET-001")).toBeInTheDocument());
    fireEvent.click(screen.getByText("DET-001"));
    expect(screen.getByText("1 actividad(es) seleccionada(s)")).toBeInTheDocument();
    fireEvent.click(screen.getByText("DET-001"));
    expect(screen.getByText("0 actividad(es) seleccionada(s)")).toBeInTheDocument();
  });

  // handleScroll
  it("handleScroll loads more when near bottom", async () => {
    const items20 = Array.from({ length: 20 }, (_, i) => ({
      id: `d${i}`, code: `DET-${i}`, name: `D${i}`, balance: "100",
      project: { code: "P" }, rubric: { code: "R" },
    }));
    (get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/projects-select")) return Promise.resolve(projectsRes);
      if (url.includes("/products-select")) return Promise.resolve(productsRes);
      if (url.includes("/detailed-select")) return Promise.resolve({ data: items20, meta: { total: 40, limit: 20, offset: 0, hasMore: true } });
      return Promise.resolve({ data: [], meta: {} });
    });
    render(<CreateMGAActivityModal {...defaultProps} />);
    await act(async () => { fireEvent.click(screen.getByRole("switch")); });
    await waitFor(() => expect(screen.getByText("DET-0")).toBeInTheDocument());

    const scrollContainer = document.querySelector(".overflow-y-auto")!;
    Object.defineProperty(scrollContainer, "scrollHeight", { value: 1000, configurable: true });
    Object.defineProperty(scrollContainer, "clientHeight", { value: 300, configurable: true });
    Object.defineProperty(scrollContainer, "scrollTop", { value: 700, configurable: true });
    fireEvent.scroll(scrollContainer);

    await waitFor(() => {
      const detCalls = (get as jest.Mock).mock.calls.filter((c: any[]) => c[0].includes("/detailed-select"));
      expect(detCalls.length).toBeGreaterThan(1);
    });
  });

  it("empty detailed activities shows message", async () => {
    (get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/projects-select")) return Promise.resolve(projectsRes);
      if (url.includes("/products-select")) return Promise.resolve(productsRes);
      if (url.includes("/detailed-select")) return Promise.resolve({ data: [], meta: { total: 0, limit: 20, offset: 0, hasMore: false } });
      return Promise.resolve({ data: [], meta: {} });
    });
    render(<CreateMGAActivityModal {...defaultProps} />);
    await act(async () => { fireEvent.click(screen.getByRole("switch")); });
    await waitFor(() => expect(screen.getByText("No se encontraron actividades")).toBeInTheDocument());
  });

  it("fetch detailed activities error logs to console", async () => {
    (get as jest.Mock).mockImplementation((url: string) => {
      if (url.includes("/detailed-select")) return Promise.reject(new Error("err"));
      if (url.includes("/projects-select")) return Promise.resolve(projectsRes);
      if (url.includes("/products-select")) return Promise.resolve(productsRes);
      return Promise.resolve({ data: [], meta: {} });
    });
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    render(<CreateMGAActivityModal {...defaultProps} />);
    await act(async () => { fireEvent.click(screen.getByRole("switch")); });
    await waitFor(() => expect(spy).toHaveBeenCalledWith("Error fetching detailed activities", expect.any(Error)));
    spy.mockRestore();
  });

  // handleClose
  it("Cancelar calls onClose", () => {
    const onClose = jest.fn();
    render(<CreateMGAActivityModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText("Cancelar"));
    expect(onClose).toHaveBeenCalled();
  });

  // onSubmit
  it("onSubmit posts data and calls onSuccess/onClose", async () => {
    render(<CreateMGAActivityModal {...defaultProps} />);
    const form = document.querySelector("form")!;
    await act(async () => { fireEvent.submit(form); });
    await waitFor(() => expect(post).toHaveBeenCalledWith("/mga", expect.objectContaining({
      code: "MGA-001",
      name: "Test MGA",
    })));
    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
    expect(defaultProps.onSuccess).toHaveBeenCalled();
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("onSubmit error shows error toast", async () => {
    (post as jest.Mock).mockRejectedValueOnce(new Error("create fail"));
    render(<CreateMGAActivityModal {...defaultProps} />);
    const form = document.querySelector("form")!;
    await act(async () => { fireEvent.submit(form); });
    await waitFor(() => expect(addToast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Error al crear actividad MGA",
      color: "danger",
    })));
  });
});
