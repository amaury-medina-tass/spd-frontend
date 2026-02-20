import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { IndicativeAnnualGoalsTab } from "@/components/modals/masters/indicators/indicative-plan/goals/IndicativeAnnualGoalsTab";
import { get, post, patch, del } from "@/lib/http";

const mockGet = get as jest.Mock;
const mockPost = post as jest.Mock;
const mockPatch = patch as jest.Mock;
const mockDel = del as jest.Mock;

jest.mock("@/components/common/ResourceManager", () => ({
  ResourceManager: ({ items, renderCell, columns, emptyContent }: any) => (
    <div data-testid="resource-manager">
      {items?.length ? items.map((item: any) => (
        <div key={item.id} data-testid={`row-${item.id}`}>
          {columns?.map((c: any) => (
            <span key={c.uid}>{renderCell?.(item, c.uid)}</span>
          ))}
        </div>
      )) : emptyContent}
    </div>
  ),
}));
jest.mock("@/components/modals/ConfirmationModal", () => ({
  ConfirmationModal: ({ isOpen, onConfirm }: any) =>
    isOpen ? <div data-testid="confirm-modal"><button onClick={onConfirm}>Confirm</button></div> : null,
}));
jest.mock("react-hook-form", () => ({
  useForm: () => ({
    control: {},
    handleSubmit: (fn: any) => (e: any) => { e?.preventDefault?.(); return fn({ year: 2024, value: 10 }); },
    reset: jest.fn(),
    setValue: jest.fn(),
    formState: { errors: {}, isSubmitting: false },
  }),
  Controller: ({ render: renderFn }: any) =>
    renderFn({ field: { value: "0", onChange: jest.fn(), ref: jest.fn() }, fieldState: { error: null } }),
}));
jest.mock("@hookform/resolvers/zod", () => ({ zodResolver: () => jest.fn() }));

const mockGoals = {
  data: [
    { id: "g1", indicatorId: "i1", year: 2024, value: "100", createAt: "2024-01-01T00:00:00.000Z" },
    { id: "g2", indicatorId: "i1", year: 2023, value: "80", createAt: "2023-01-01T00:00:00.000Z" },
  ],
  meta: { total: 2, page: 1, limit: 5, totalPages: 1 },
};

describe("IndicativeAnnualGoalsTab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue(mockGoals);
    mockPost.mockResolvedValue({});
    mockPatch.mockResolvedValue({});
    mockDel.mockResolvedValue(undefined);
  });

  it("renders and fetches goals on mount", async () => {
    render(<IndicativeAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
  });

  it("does not fetch when indicatorId is null", () => {
    render(<IndicativeAnnualGoalsTab indicatorId={null} />);
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("renders form labels", async () => {
    render(<IndicativeAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    expect(screen.getByText("Año")).toBeInTheDocument();
    expect(screen.getByText("Valor Meta")).toBeInTheDocument();
  });

  it("submits create form", async () => {
    render(<IndicativeAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => expect(mockPost).toHaveBeenCalled());
  });

  it("handles create error gracefully", async () => {
    mockPost.mockRejectedValueOnce(new Error("fail"));
    render(<IndicativeAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(mockGet).toHaveBeenCalled());
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => expect(mockPost).toHaveBeenCalled());
  });

  it("renders goal years in cells", async () => {
    render(<IndicativeAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getByText("2024")).toBeInTheDocument());
    expect(screen.getByText("2023")).toBeInTheDocument();
  });

  it("renders edit and delete icons for each goal", async () => {
    render(<IndicativeAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Pencil")).toHaveLength(2));
    expect(screen.getAllByTestId("icon-Trash2")).toHaveLength(2);
  });

  it("clicking edit icon shows Actualizar button", async () => {
    render(<IndicativeAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Pencil")).toHaveLength(2));
    fireEvent.click(screen.getAllByTestId("icon-Pencil")[0]);
    expect(screen.getByText("Actualizar")).toBeInTheDocument();
  });

  it("clicking cancel edit reverts to create mode", async () => {
    render(<IndicativeAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Pencil")).toHaveLength(2));
    fireEvent.click(screen.getAllByTestId("icon-Pencil")[0]);
    expect(screen.getByText("Actualizar")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("icon-X"));
    expect(screen.queryByText("Actualizar")).not.toBeInTheDocument();
  });

  it("submitting edit form calls patch", async () => {
    render(<IndicativeAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Pencil")).toHaveLength(2));
    fireEvent.click(screen.getAllByTestId("icon-Pencil")[0]);
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => expect(mockPatch).toHaveBeenCalled());
  });

  it("handles edit error gracefully", async () => {
    mockPatch.mockRejectedValueOnce(new Error("update failed"));
    render(<IndicativeAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Pencil")).toHaveLength(2));
    fireEvent.click(screen.getAllByTestId("icon-Pencil")[0]);
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => expect(mockPatch).toHaveBeenCalled());
  });

  it("clicking delete icon opens confirmation modal", async () => {
    render(<IndicativeAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Trash2")).toHaveLength(2));
    fireEvent.click(screen.getAllByTestId("icon-Trash2")[0]);
    expect(screen.getByTestId("confirm-modal")).toBeInTheDocument();
  });

  it("confirming delete calls del", async () => {
    render(<IndicativeAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Trash2")).toHaveLength(2));
    fireEvent.click(screen.getAllByTestId("icon-Trash2")[0]);
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() => expect(mockDel).toHaveBeenCalled());
  });

  it("handles delete error gracefully", async () => {
    mockDel.mockRejectedValueOnce(new Error("delete failed"));
    render(<IndicativeAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getAllByTestId("icon-Trash2")).toHaveLength(2));
    fireEvent.click(screen.getAllByTestId("icon-Trash2")[0]);
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() => expect(mockDel).toHaveBeenCalled());
  });

  it("renders empty state when no goals", async () => {
    mockGet.mockResolvedValueOnce({ data: [], meta: { total: 0, page: 1, limit: 5, totalPages: 0 } });
    render(<IndicativeAnnualGoalsTab indicatorId="i1" />);
    await waitFor(() => expect(screen.getByText("No hay metas registradas para este indicador")).toBeInTheDocument());
  });
});
