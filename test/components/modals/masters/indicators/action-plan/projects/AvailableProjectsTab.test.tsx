import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { addToast } from "@heroui/toast";

const mockGetProjects = jest.fn();
const mockAssociate = jest.fn();

jest.mock("@/services/masters/indicators.service", () => ({
  getActionPlanIndicatorProjects: (...args: any[]) => mockGetProjects(...args),
  associateActionPlanIndicatorProject: (...args: any[]) => mockAssociate(...args),
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

import { AvailableProjectsTab } from "@/components/modals/masters/indicators/action-plan/projects/AvailableProjectsTab";

const sampleProjects = [
  { id: "p1", code: "PRY-001", name: "Proyecto Test", currentBudget: 1_000_000, financialExecutionPercentage: 90 },
  { id: "p2", code: "PRY-002", name: "Proyecto Dos", currentBudget: 500_000, financialExecutionPercentage: 55 },
  { id: "p3", code: "PRY-003", name: "Proyecto Tres", currentBudget: 300_000, financialExecutionPercentage: 20 },
];

describe("AvailableProjectsTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetProjects.mockResolvedValue({
      data: sampleProjects,
      meta: { total: 3, page: 1, limit: 5, totalPages: 1 },
    });
    mockAssociate.mockResolvedValue({});
  });

  it("renders and fetches on mount with type=available", async () => {
    render(<AvailableProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetProjects).toHaveBeenCalledWith("i1", expect.stringContaining("type=available")));
  });

  it("does not fetch when indicatorId is null", () => {
    render(<AvailableProjectsTab indicatorId={null} />);
    expect(mockGetProjects).not.toHaveBeenCalled();
  });

  it("renders ResourceManager", () => {
    render(<AvailableProjectsTab indicatorId="i1" />);
    expect(screen.getByTestId("resource-manager")).toBeInTheDocument();
  });

  // renderCell: code
  it("renders project code", async () => {
    render(<AvailableProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getByText("PRY-001")).toBeInTheDocument());
  });

  // renderCell: name
  it("renders project name", async () => {
    render(<AvailableProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getByText("Proyecto Test")).toBeInTheDocument());
  });

  // renderCell: currentBudget → formatCurrency
  it("renders formatted currency for budget", async () => {
    render(<AvailableProjectsTab indicatorId="i1" />);
    await waitFor(() => {
      const body = document.body.textContent || "";
      expect(body).toMatch(/1.*000.*000/);
    });
  });

  // renderCell: financialExecutionPercentage colors
  it("renders execution >= 80 with success class", async () => {
    render(<AvailableProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getByText("90%")).toBeInTheDocument());
    expect(screen.getByText("90%")).toHaveClass("text-success");
  });

  it("renders execution >= 50 with warning class", async () => {
    render(<AvailableProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getByText("55%")).toBeInTheDocument());
    expect(screen.getByText("55%")).toHaveClass("text-warning");
  });

  it("renders execution < 50 with danger class", async () => {
    render(<AvailableProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getByText("20%")).toBeInTheDocument());
    expect(screen.getByText("20%")).toHaveClass("text-danger");
  });

  // renderCell: actions (Plus icon for associate)
  it("renders associate button with Plus icon", async () => {
    render(<AvailableProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Plus").length).toBeGreaterThan(0));
  });

  // handleAssociate success
  it("associates project on button click", async () => {
    render(<AvailableProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Plus").length).toBeGreaterThan(0));
    const btn = screen.getAllByTestId("icon-Plus")[0].closest("[title='Asociar']") as HTMLElement;
    await act(async () => { fireEvent.click(btn); });
    await waitFor(() => expect(mockAssociate).toHaveBeenCalledWith("i1", "p1"));
    expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Proyecto asociado", color: "success" }));
  });

  // handleAssociate error
  it("shows error on associate failure", async () => {
    mockAssociate.mockRejectedValueOnce(new Error("fail"));
    render(<AvailableProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Plus").length).toBeGreaterThan(0));
    const btn = screen.getAllByTestId("icon-Plus")[0].closest("[title='Asociar']") as HTMLElement;
    await act(async () => { fireEvent.click(btn); });
    await waitFor(() => expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Error", color: "danger" })));
  });

  // fetch error
  it("shows error toast on fetch failure", async () => {
    mockGetProjects.mockRejectedValueOnce(new Error("network"));
    render(<AvailableProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Error al cargar proyectos disponibles", color: "danger" })
    ));
  });

  // empty content without search
  it("shows empty message when no projects", async () => {
    mockGetProjects.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 5, totalPages: 0 } });
    render(<AvailableProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getByText("No hay proyectos disponibles")).toBeInTheDocument());
  });

  // pagination
  it("changes page", async () => {
    render(<AvailableProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetProjects).toHaveBeenCalled());
    mockGetProjects.mockClear();
    fireEvent.click(screen.getByTestId("next-page"));
    await waitFor(() => expect(mockGetProjects).toHaveBeenCalled());
  });

  // limit change
  it("changes limit", async () => {
    render(<AvailableProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetProjects).toHaveBeenCalled());
    mockGetProjects.mockClear();
    fireEvent.click(screen.getByTestId("change-limit"));
    await waitFor(() => expect(mockGetProjects).toHaveBeenCalled());
  });

  // refresh
  it("calls refresh", async () => {
    render(<AvailableProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetProjects).toHaveBeenCalled());
    mockGetProjects.mockClear();
    fireEvent.click(screen.getByTestId("refresh"));
    await waitFor(() => expect(mockGetProjects).toHaveBeenCalled());
  });

  // search
  it("searches projects", async () => {
    render(<AvailableProjectsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetProjects).toHaveBeenCalled());
    mockGetProjects.mockClear();
    fireEvent.change(screen.getByTestId("search-input"), { target: { value: "test" } });
    await waitFor(() => expect(mockGetProjects).toHaveBeenCalledWith("i1", expect.stringContaining("search=test")));
  });

  // fetches with different indicatorId
  it("fetches with different indicatorId", async () => {
    render(<AvailableProjectsTab indicatorId="id-xyz" />);
    await waitFor(() => expect(mockGetProjects).toHaveBeenCalledWith("id-xyz", expect.any(String)));
  });
});
