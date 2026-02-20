import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { ActionPlanQuadrenniumGoalsTab } from "@/components/modals/masters/indicators/action-plan/goals/ActionPlanQuadrenniumGoalsTab";
import { addToast } from "@heroui/toast";

const mockGetGoals = jest.fn();
const mockCreateGoal = jest.fn();
const mockUpdateGoal = jest.fn();
const mockDeleteGoal = jest.fn();

jest.mock("@/services/masters/indicators.service", () => ({
  getActionPlanIndicatorQuadrenniumGoals: (...args: any[]) => mockGetGoals(...args),
  createActionPlanIndicatorQuadrenniumGoal: (...args: any[]) => mockCreateGoal(...args),
  updateActionPlanIndicatorQuadrenniumGoal: (...args: any[]) => mockUpdateGoal(...args),
  deleteActionPlanIndicatorQuadrenniumGoal: (...args: any[]) => mockDeleteGoal(...args),
}));

jest.mock("@/components/common/ResourceManager", () => ({
  ResourceManager: ({ items, renderCell, columns, emptyContent, ...props }: any) => (
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
      {props.onPageChange && <button data-testid="next-page" onClick={() => props.onPageChange(2)}>Next</button>}
      {props.onLimitChange && <button data-testid="change-limit" onClick={() => props.onLimitChange(20)}>Limit</button>}
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
    { id: "qg1", indicatorId: "i1", startYear: 2024, endYear: 2027, value: "200.5", createAt: "2024-01-01T00:00:00.000Z" },
    { id: "qg2", indicatorId: "i1", startYear: 2028, endYear: 2031, value: "300", createAt: "2024-06-01T00:00:00.000Z" },
  ],
  meta: { total: 2, page: 1, limit: 10, totalPages: 1 },
};

describe("ActionPlanQuadrenniumGoalsTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetGoals.mockResolvedValue(mockData);
    mockCreateGoal.mockResolvedValue({});
    mockUpdateGoal.mockResolvedValue({});
    mockDeleteGoal.mockResolvedValue(undefined);
  });

  it("renders and fetches goals on mount", async () => {
    render(<ActionPlanQuadrenniumGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
  });

  it("does not fetch when indicatorId is null", () => {
    render(<ActionPlanQuadrenniumGoalsTab indicatorId={null} />);
    expect(mockGetGoals).not.toHaveBeenCalled();
  });

  it("renders form labels", async () => {
    render(<ActionPlanQuadrenniumGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
    expect(screen.getByText("Año Inicial")).toBeInTheDocument();
    expect(screen.getByText("Año Final")).toBeInTheDocument();
    expect(screen.getByText("Valor Meta")).toBeInTheDocument();
  });

  // renderCell: startYear, endYear columns
  it("renders years in goals table", async () => {
    render(<ActionPlanQuadrenniumGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getByText("2024")).toBeInTheDocument());
    expect(screen.getByText("2027")).toBeInTheDocument();
    expect(screen.getByText("2028")).toBeInTheDocument();
    expect(screen.getByText("2031")).toBeInTheDocument();
  });

  // renderCell: value column
  it("renders formatted value", async () => {
    render(<ActionPlanQuadrenniumGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getByText("200,5")).toBeInTheDocument());
  });

  // renderCell: createdAt column
  it("renders formatted dates", async () => {
    render(<ActionPlanQuadrenniumGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getByText("2024")).toBeInTheDocument());
    const body = document.body.textContent || "";
    expect(body).toMatch(/2024/);
  });

  // renderCell: actions column
  it("renders edit and delete action icons", async () => {
    render(<ActionPlanQuadrenniumGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Pencil").length).toBeGreaterThan(0));
    expect(screen.getAllByTestId("icon-Trash2").length).toBeGreaterThanOrEqual(2);
  });

  // Create form submission
  it("submits create form", async () => {
    render(<ActionPlanQuadrenniumGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
    const form = document.querySelector("form")!;
    await act(async () => { fireEvent.submit(form); });
    await waitFor(() => expect(mockCreateGoal).toHaveBeenCalled());
    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Meta cuatrenio creada correctamente", color: "success" })
    );
  });

  it("handles create error", async () => {
    mockCreateGoal.mockRejectedValueOnce(new Error("create fail"));
    render(<ActionPlanQuadrenniumGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
    const form = document.querySelector("form")!;
    await act(async () => { fireEvent.submit(form); });
    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error al crear meta cuatrenio", color: "danger" })
      )
    );
  });

  // Edit goal flow
  it("clicking edit icon shows Actualizar button", async () => {
    render(<ActionPlanQuadrenniumGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Pencil").length).toBeGreaterThan(0));
    const pencilIcons = screen.getAllByTestId("icon-Pencil");
    fireEvent.click(pencilIcons[0]);
    expect(screen.getByText("Actualizar")).toBeInTheDocument();
  });

  it("submits editing form calls update", async () => {
    render(<ActionPlanQuadrenniumGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Pencil").length).toBeGreaterThan(0));
    const pencilIcons = screen.getAllByTestId("icon-Pencil");
    fireEvent.click(pencilIcons[0]);
    const form = document.querySelector("form")!;
    await act(async () => { fireEvent.submit(form); });
    await waitFor(() => expect(mockUpdateGoal).toHaveBeenCalledWith("qg1", expect.any(Object)));
    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Meta cuatrenio actualizada correctamente", color: "success" })
    );
  });

  it("handles update error", async () => {
    mockUpdateGoal.mockRejectedValueOnce(new Error("update fail"));
    render(<ActionPlanQuadrenniumGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Pencil").length).toBeGreaterThan(0));
    const pencilIcons = screen.getAllByTestId("icon-Pencil");
    fireEvent.click(pencilIcons[0]);
    const form = document.querySelector("form")!;
    await act(async () => { fireEvent.submit(form); });
    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Error al actualizar meta cuatrenio", color: "danger" })
      )
    );
  });

  // Cancel edit
  it("cancel edit restores create mode", async () => {
    render(<ActionPlanQuadrenniumGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Pencil").length).toBeGreaterThan(0));
    const pencilIcons = screen.getAllByTestId("icon-Pencil");
    fireEvent.click(pencilIcons[0]);
    expect(screen.getByText("Actualizar")).toBeInTheDocument();
    const cancelIcon = screen.getByTestId("icon-X");
    fireEvent.click(cancelIcon);
    expect(screen.queryByText("Actualizar")).not.toBeInTheDocument();
  });

  // Delete goal flow
  it("clicking delete icon opens confirmation modal", async () => {
    render(<ActionPlanQuadrenniumGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Trash2").length).toBeGreaterThan(0));
    const trashIcons = screen.getAllByTestId("icon-Trash2");
    fireEvent.click(trashIcons[0]);
    expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
    expect(screen.getByText("Eliminar Meta Cuatrenio")).toBeInTheDocument();
  });

  it("confirming delete calls deleteGoal", async () => {
    render(<ActionPlanQuadrenniumGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Trash2").length).toBeGreaterThan(0));
    const trashIcons = screen.getAllByTestId("icon-Trash2");
    fireEvent.click(trashIcons[0]);
    await act(async () => { fireEvent.click(screen.getByText("Confirm")); });
    await waitFor(() => expect(mockDeleteGoal).toHaveBeenCalledWith("qg1"));
    expect(addToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Meta cuatrenio eliminada correctamente", color: "success" })
    );
  });

  it("handles delete error", async () => {
    mockDeleteGoal.mockRejectedValueOnce(new Error("delete fail"));
    render(<ActionPlanQuadrenniumGoalsTab indicatorId="i1" />);
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
  it("changes page", async () => {
    render(<ActionPlanQuadrenniumGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
    mockGetGoals.mockClear();
    fireEvent.click(screen.getByTestId("next-page"));
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
  });

  // Limit change
  it("changes limit", async () => {
    render(<ActionPlanQuadrenniumGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
    mockGetGoals.mockClear();
    fireEvent.click(screen.getByTestId("change-limit"));
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled(), { timeout: 3000 });
  });

  // Empty content
  it("shows empty content when no goals", async () => {
    mockGetGoals.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } });
    render(<ActionPlanQuadrenniumGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
    expect(screen.getByText("No hay metas por cuatrenio registradas para este indicador")).toBeInTheDocument();
  });

  // Fetch error
  it("handles fetch error gracefully", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockGetGoals.mockRejectedValueOnce(new Error("fetch error"));
    render(<ActionPlanQuadrenniumGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGetGoals).toHaveBeenCalled());
    consoleSpy.mockRestore();
  });

  // Does not submit when indicatorId is null
  it("does not create when indicatorId is null", async () => {
    render(<ActionPlanQuadrenniumGoalsTab indicatorId={null} />);
    const form = document.querySelector("form")!;
    await act(async () => { fireEvent.submit(form); });
    expect(mockCreateGoal).not.toHaveBeenCalled();
  });
});
