import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ActionPlanAnnualGoalsTab } from "./ActionPlanAnnualGoalsTab";
import { addToast } from "@heroui/toast";

const mockGetGoals = jest.fn();
const mockCreateGoal = jest.fn();
const mockUpdateGoal = jest.fn();
const mockDeleteGoal = jest.fn();

jest.mock("@/services/masters/indicators.service", () => ({
  getActionPlanIndicatorGoals: (...args: any[]) => mockGetGoals(...args),
  createActionPlanIndicatorGoal: (...args: any[]) => mockCreateGoal(...args),
  updateActionPlanIndicatorGoal: (...args: any[]) => mockUpdateGoal(...args),
  deleteActionPlanIndicatorGoal: (...args: any[]) => mockDeleteGoal(...args),
}));

jest.mock("@/components/common/ResourceManager", () => ({
  ResourceManager: ({ items, renderCell, columns, emptyContent, search, onSearchChange, ...props }: any) => (
    <div data-testid="resource-manager">
      {onSearchChange && <input data-testid="rm-search" value={search || ""} onChange={(e: any) => onSearchChange(e.target.value)} />}
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
      {props.onPageChange && <button data-testid="next-page" onClick={() => props.onPageChange(2)}>Next</button>}
      {props.onLimitChange && <button data-testid="change-limit" onClick={() => props.onLimitChange(10)}>Limit</button>}
    </div>
  ),
}));

jest.mock("@/components/modals/ConfirmationModal", () => ({
  ConfirmationModal: ({ isOpen, onConfirm, onClose, title, description }: any) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <span>{title}</span>
        <span>{description}</span>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    ) : null,
}));

jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => () => ({ values: {}, errors: {} }),
}));

const mockData = {
  data: [
    { id: "g1", indicatorId: "i1", year: 2024, value: "100.5", createAt: "2024-01-15T00:00:00.000Z" },
    { id: "g2", indicatorId: "i1", year: 2025, value: "200", createAt: "2024-06-01T00:00:00.000Z" },
  ],
  meta: { total: 2, page: 1, limit: 5, totalPages: 1 },
};

describe("ActionPlanAnnualGoalsTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetGoals.mockResolvedValue(mockData);
    mockCreateGoal.mockResolvedValue({});
    mockUpdateGoal.mockResolvedValue({});
    mockDeleteGoal.mockResolvedValue(undefined);
  });

  it("renders and fetches goals on mount", async () => {
    render(<ActionPlanAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
  });

  it("does not fetch when indicatorId is null", () => {
    render(<ActionPlanAnnualGoalsTab indicatorId={null} />);
    expect(mockGetGoals).not.toHaveBeenCalled();
  });

  it("renders year form label", async () => {
    render(<ActionPlanAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
    expect(screen.getByText("Año")).toBeInTheDocument();
  });

  it("renders value form label", async () => {
    render(<ActionPlanAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
    expect(screen.getByText("Valor Meta")).toBeInTheDocument();
  });

  // renderCell: year column
  it("renders year in goals table", async () => {
    render(<ActionPlanAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
    expect(screen.getByText("2024")).toBeInTheDocument();
    expect(screen.getByText("2025")).toBeInTheDocument();
  });

  // renderCell: value column (formatted)
  it("renders formatted value in goals table", async () => {
    render(<ActionPlanAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
    expect(screen.getByText("100,5")).toBeInTheDocument();
  });

  // renderCell: createdAt column (formatted date)
  it("renders formatted dates in goals table", async () => {
    render(<ActionPlanAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
    const body = document.body.textContent || "";
    expect(body).toMatch(/2024/);
  });

  // renderCell: actions column (edit/delete icons)
  it("renders edit and delete action icons", async () => {
    render(<ActionPlanAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
    expect(screen.getAllByTestId("icon-Pencil").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByTestId("icon-Trash2").length).toBeGreaterThanOrEqual(2);
  });

  // Submit create form
  it("submits create form", async () => {
    render(<ActionPlanAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
    const form = document.querySelector("form")!;
    await act(async () => { fireEvent.submit(form); });
    await waitFor(() => expect(mockCreateGoal).toHaveBeenCalled());
    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Meta creada correctamente", color: "success" })
    );
  });

  it("handles create error", async () => {
    mockCreateGoal.mockRejectedValueOnce(new Error("create fail"));
    render(<ActionPlanAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
    const form = document.querySelector("form")!;
    await act(async () => { fireEvent.submit(form); });
    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error al crear la meta", color: "danger" })
      )
    );
  });

  // Edit goal flow
  it("clicking edit icon sets editing state and shows Actualizar button", async () => {
    render(<ActionPlanAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Pencil").length).toBeGreaterThan(0));
    const pencilIcons = screen.getAllByTestId("icon-Pencil");
    fireEvent.click(pencilIcons[0]);
    // Should now show Actualizar button
    expect(screen.getByText("Actualizar")).toBeInTheDocument();
  });

  it("submits editing form calls update", async () => {
    render(<ActionPlanAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Pencil").length).toBeGreaterThan(0));
    const pencilIcons = screen.getAllByTestId("icon-Pencil");
    fireEvent.click(pencilIcons[0]);
    const form = document.querySelector("form")!;
    await act(async () => { fireEvent.submit(form); });
    await waitFor(() => expect(mockUpdateGoal).toHaveBeenCalledWith("g1", expect.any(Object)));
    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Meta actualizada correctamente", color: "success" })
    );
  });

  it("handles update error", async () => {
    mockUpdateGoal.mockRejectedValueOnce(new Error("update fail"));
    render(<ActionPlanAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Pencil").length).toBeGreaterThan(0));
    const pencilIcons = screen.getAllByTestId("icon-Pencil");
    fireEvent.click(pencilIcons[0]);
    const form = document.querySelector("form")!;
    await act(async () => { fireEvent.submit(form); });
    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error al actualizar la meta", color: "danger" })
      )
    );
  });

  // Cancel edit
  it("cancel edit restores create mode", async () => {
    render(<ActionPlanAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Pencil").length).toBeGreaterThan(0));
    const pencilIcons = screen.getAllByTestId("icon-Pencil");
    fireEvent.click(pencilIcons[0]);
    expect(screen.getByText("Actualizar")).toBeInTheDocument();
    // Click the X (cancel) button
    const cancelIcon = screen.getByTestId("icon-X");
    fireEvent.click(cancelIcon);
    expect(screen.queryByText("Actualizar")).not.toBeInTheDocument();
  });

  // Delete goal flow
  it("clicking delete icon opens confirmation modal", async () => {
    render(<ActionPlanAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Trash2").length).toBeGreaterThan(0));
    const trashIcons = screen.getAllByTestId("icon-Trash2");
    fireEvent.click(trashIcons[0]);
    expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
    expect(screen.getByText("Eliminar Meta Anual")).toBeInTheDocument();
  });

  it("confirming delete calls deleteGoal", async () => {
    render(<ActionPlanAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Trash2").length).toBeGreaterThan(0));
    const trashIcons = screen.getAllByTestId("icon-Trash2");
    fireEvent.click(trashIcons[0]);
    await act(async () => { fireEvent.click(screen.getByText("Confirm")); });
    await waitFor(() => expect(mockDeleteGoal).toHaveBeenCalledWith("g1"));
    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Meta eliminada correctamente", color: "success" })
    );
  });

  it("handles delete error", async () => {
    mockDeleteGoal.mockRejectedValueOnce(new Error("delete fail"));
    render(<ActionPlanAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Trash2").length).toBeGreaterThan(0));
    const trashIcons = screen.getAllByTestId("icon-Trash2");
    fireEvent.click(trashIcons[0]);
    await act(async () => { fireEvent.click(screen.getByText("Confirm")); });
    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error al eliminar", color: "danger" })
      )
    );
  });

  // Pagination
  it("changes page when next page button clicked", async () => {
    render(<ActionPlanAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
    mockGetGoals.mockClear();
    fireEvent.click(screen.getByTestId("next-page"));
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
  });

  // Limit change
  it("changes limit and resets page", async () => {
    render(<ActionPlanAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
    mockGetGoals.mockClear();
    fireEvent.click(screen.getByTestId("change-limit"));
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
  });

  // Empty content
  it("shows empty content when no goals", async () => {
    mockGetGoals.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 5, totalPages: 0 } });
    render(<ActionPlanAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
    expect(screen.getByText("No hay metas registradas para este indicador")).toBeInTheDocument();
  });

  // Search
  it("search changes trigger search parameter", async () => {
    render(<ActionPlanAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
    mockGetGoals.mockClear();
    const searchInput = screen.getByTestId("rm-search");
    await act(async () => { fireEvent.change(searchInput, { target: { value: "2024" } }); });
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
  });

  // Fetch error
  it("handles fetch error gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockGetGoals.mockRejectedValueOnce(new Error("fetch error"));
    render(<ActionPlanAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
    consoleSpy.mockRestore();
  });

  // Does not submit when indicatorId is null
  it("does not create when indicatorId is null", async () => {
    render(<ActionPlanAnnualGoalsTab indicatorId={null} />);
    const form = document.querySelector("form")!;
    await act(async () => { fireEvent.submit(form); });
    expect(mockCreateGoal).not.toHaveBeenCalled();
  });
});
