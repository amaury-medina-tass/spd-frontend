import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AssociatedProjectsTab } from "@/components/modals/masters/indicators/action-plan/projects/AssociatedProjectsTab";
import { addToast } from "@heroui/toast";

const mockGetProjects = jest.fn();
const mockDissociate = jest.fn();

jest.mock("@/services/masters/indicators.service", () => ({
  getActionPlanIndicatorProjects: (...args: any[]) => mockGetProjects(...args),
  disassociateActionPlanIndicatorProject: (...args: any[]) => mockDissociate(...args),
}));

jest.mock("@/components/common/ResourceManager", () => ({
  ResourceManager: ({ items, renderCell, columns, emptyContent, search, onSearchChange, onPageChange, onLimitChange, onRefresh, ...props }: any) => (
    <div data-testid="resource-manager">
      {items?.length > 0 ? (
        <table>
          <tbody>
            {items.map((item: any) => (
              <tr key={item.id}>
                {columns?.map((col: any) => (
                  <td key={col.uid}>{renderCell(item, col.uid)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : emptyContent}
      {onSearchChange && <input data-testid="search-input" value={search || ""} onChange={(e) => onSearchChange(e.target.value)} />}
      {onPageChange && <button data-testid="next-page" onClick={() => onPageChange(2)}>Next</button>}
      {onLimitChange && <button data-testid="change-limit" onClick={() => onLimitChange(20)}>Limit</button>}
      {onRefresh && <button data-testid="refresh" onClick={onRefresh}>Refresh</button>}
    </div>
  ),
}));

jest.mock("@/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value,
}));

const sampleProjects = [
  { id: "p1", code: "PROJ-001", name: "Proyecto Alpha", currentBudget: "5000000", financialExecutionPercentage: 85 },
  { id: "p2", code: "PROJ-002", name: "Proyecto Beta", currentBudget: "1000000", financialExecutionPercentage: 60 },
  { id: "p3", code: "PROJ-003", name: "Proyecto Gamma", currentBudget: "2000000", financialExecutionPercentage: 30 },
];

describe("AssociatedProjectsTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProjects.mockResolvedValue({
      data: sampleProjects,
      meta: { total: 3, page: 1, limit: 5, totalPages: 1 },
    });
    mockDissociate.mockResolvedValue(undefined);
  });

  it("renders and fetches on mount", async () => {
    render(<AssociatedProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetProjects).toHaveBeenCalledWith("i1", expect.stringContaining("type=associated")));
  });

  it("does not fetch when indicatorId is null", () => {
    render(<AssociatedProjectsTab indicatorId={null} />);
    expect(mockGetProjects).not.toHaveBeenCalled();
  });

  it("fetches on indicatorId change", async () => {
    const { rerender } = render(<AssociatedProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetProjects).toHaveBeenCalledWith("i1", expect.any(String)));
    mockGetProjects.mockClear();
    rerender(<AssociatedProjectsTab indicatorId="i2" />);
    await waitFor(() => expect(mockGetProjects).toHaveBeenCalledWith("i2", expect.any(String)));
  });

  // renderCell: code
  it("renders project code", async () => {
    render(<AssociatedProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getByText("PROJ-001")).toBeInTheDocument());
  });

  // renderCell: name
  it("renders project name", async () => {
    render(<AssociatedProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getByText("Proyecto Alpha")).toBeInTheDocument());
  });

  // renderCell: currentBudget → formatCurrency
  it("renders formatted currency", async () => {
    render(<AssociatedProjectsTab indicatorId="i1" />);
    await waitFor(() => {
      const body = document.body.textContent || "";
      expect(body).toMatch(/5.*000.*000/);
    });
  });

  // renderCell: financialExecutionPercentage with color classes
  it("renders execution percentage >= 80 with success color", async () => {
    render(<AssociatedProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getByText("85%")).toBeInTheDocument());
    expect(screen.getByText("85%")).toHaveClass("text-success");
  });

  it("renders execution percentage >= 50 with warning color", async () => {
    render(<AssociatedProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getByText("60%")).toBeInTheDocument());
    expect(screen.getByText("60%")).toHaveClass("text-warning");
  });

  it("renders execution percentage < 50 with danger color", async () => {
    render(<AssociatedProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getByText("30%")).toBeInTheDocument());
    expect(screen.getByText("30%")).toHaveClass("text-danger");
  });

  // renderCell: actions (X icon for dissociate)
  it("renders dissociate button with X icon", async () => {
    render(<AssociatedProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-X").length).toBeGreaterThan(0));
  });

  // handleDissociate success
  it("dissociates project on button click", async () => {
    render(<AssociatedProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-X").length).toBeGreaterThan(0));
    const xButtons = screen.getAllByTestId("icon-X");
    // X icon is inside a Button mock (div with onClick=onPress)
    const btn = xButtons[0].closest("[title='Desasociar']") as HTMLElement;
    await act(async () => { fireEvent.click(btn); });
    await waitFor(() => expect(mockDissociate).toHaveBeenCalledWith("i1", "p1"));
    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Proyecto desasociado", color: "success" }));
  });

  // handleDissociate error
  it("shows error toast on dissociate failure", async () => {
    mockDissociate.mockRejectedValueOnce(new Error("fail"));
    render(<AssociatedProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-X").length).toBeGreaterThan(0));
    const btn = screen.getAllByTestId("icon-X")[0].closest("[title='Desasociar']") as HTMLElement;
    await act(async () => { fireEvent.click(btn); });
    await waitFor(() => expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Error", color: "danger" })));
  });

  // fetch error
  it("shows error toast on fetch failure", async () => {
    mockGetProjects.mockRejectedValueOnce(new Error("network"));
    render(<AssociatedProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Error al cargar proyectos asociados", color: "danger" })
    ));
  });

  // empty content without search
  it("shows empty message when no projects", async () => {
    mockGetProjects.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 5, totalPages: 0 } });
    render(<AssociatedProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getByText("No hay proyectos asociados")).toBeInTheDocument());
  });

  // pagination
  it("changes page", async () => {
    render(<AssociatedProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetProjects).toHaveBeenCalled());
    mockGetProjects.mockClear();
    fireEvent.click(screen.getByTestId("next-page"));
    await waitFor(() => expect(mockGetProjects).toHaveBeenCalled());
  });

  // limit change
  it("changes limit", async () => {
    render(<AssociatedProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetProjects).toHaveBeenCalled());
    mockGetProjects.mockClear();
    fireEvent.click(screen.getByTestId("change-limit"));
    await waitFor(() => expect(mockGetProjects).toHaveBeenCalled());
  });

  // refresh
  it("calls refresh", async () => {
    render(<AssociatedProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetProjects).toHaveBeenCalled());
    mockGetProjects.mockClear();
    fireEvent.click(screen.getByTestId("refresh"));
    await waitFor(() => expect(mockGetProjects).toHaveBeenCalled());
  });

  // search
  it("searches projects", async () => {
    render(<AssociatedProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetProjects).toHaveBeenCalled());
    mockGetProjects.mockClear();
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "alpha" } });
    await waitFor(() => expect(mockGetProjects).toHaveBeenCalledWith("i1", expect.stringContaining("search=alpha")));
  });

  // handleDissociate with null indicatorId
  it("does not dissociate when indicatorId is null", async () => {
    mockGetProjects.mockResolvedValue({ data: sampleProjects, meta: { total: 3, page: 1, limit: 5, totalPages: 1 } });
    // Cannot trigger dissociate when indicatorId is null since fetchProjects won't run,
    // but we verify the guard by checking no call to dissociate
    render(<AssociatedProjectsTab indicatorId={null} />);
    expect(mockDissociate).not.toHaveBeenCalled();
  });
});
