import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
import { get, del, post, patch } from "@/lib/http";
import { requestExport } from "@/services/exports.service";
import { addToast } from "@heroui/toast";

let capturedVariableModalProps: any = {};

jest.mock("@/components/tables/DataTable", () => ({
  DataTable: (props: any) => {
    const { items = [], columns = [], topActions = [], rowActions = [], ariaLabel } = props;
    return (
      <div data-testid="data-table" aria-label={ariaLabel}>
        {topActions.map((a: any, i: number) => (
          <button key={i} data-testid={`top-${i}`} onClick={a.onClick}>{a.label}</button>
        ))}
        {items.map((item: any, idx: number) => (
          <div key={idx} data-testid={`row-${idx}`}>
            {columns.map((col: any) => (
              <span key={col.key} data-testid={`cell-${idx}-${col.key}`}>
                {col.render ? col.render(item) : String(item[col.key] ?? "")}
              </span>
            ))}
            {rowActions?.map((a: any, j: number) => (
              <button key={j} data-testid={`row-${idx}-action-${j}`} onClick={() => a.onClick?.(item)}>{a.label}</button>
            ))}
          </div>
        ))}
      </div>
    );
  },
}));
jest.mock("@/components/modals/ConfirmationModal", () => ({
  ConfirmationModal: ({ isOpen, onConfirm }: any) =>
    isOpen ? <div data-testid="confirm-modal"><button onClick={onConfirm}>Confirm</button></div> : null,
}));
jest.mock("@/components/modals/masters/variables/VariableModal", () => ({
  VariableModal: (props: any) => { capturedVariableModalProps = props; return null; },
}));
jest.mock("@/components/modals/masters/variables/VariableDetailModal", () => ({ VariableDetailModal: () => null }));
jest.mock("@/components/modals/masters/variables/VariableGoalsModal", () => ({ VariableGoalsModal: () => null }));
jest.mock("@/components/modals/masters/variables/VariableLocationModal", () => ({ VariableLocationModal: () => null }));
jest.mock("@/components/modals/masters/AssignUserModal", () => ({ AssignUserModal: () => null }));
jest.mock("@/services/masters/variables.service", () => ({
  getVariableUsers: jest.fn().mockResolvedValue([]),
  assignVariableUser: jest.fn().mockResolvedValue({}),
  unassignVariableUser: jest.fn().mockResolvedValue({}),
}));

import MastersVariablesPage from "./page";

const mockGet = get as jest.Mock;
const mockDel = del as jest.Mock;
const mockPost = post as jest.Mock;
const mockPatch = patch as jest.Mock;
const mockExport = requestExport as jest.Mock;
const mockAddToast = addToast as jest.Mock;

const mockVariable = {
  id: "1",
  code: "VAR-001",
  name: "Variable de Prueba",
  observations: "Observaciones de prueba",
  createAt: "2024-01-15T10:00:00.000Z",
  updateAt: "2024-02-01T08:00:00.000Z",
};

describe("MastersVariablesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedVariableModalProps = {};
    mockGet.mockImplementation((url: string) => {
      if (url.endsWith(`/${mockVariable.id}`)) return Promise.resolve(mockVariable);
      return Promise.resolve({ data: [mockVariable], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } });
    });
    mockDel.mockResolvedValue({});
    mockPost.mockResolvedValue({});
    mockPatch.mockResolvedValue({});
    mockExport.mockResolvedValue({});
  });

  it("renders breadcrumbs", () => {
    renderWithProviders(<MastersVariablesPage />);
    expect(screen.getByText("Variables")).toBeInTheDocument();
  });

  it("fetches and renders items in table", async () => {
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
  });

  it("renders code cell", async () => {
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-code")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-code")).toHaveTextContent("VAR-001");
  });

  it("renders observations cell", async () => {
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-observations")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-observations")).toHaveTextContent("Observaciones de prueba");
  });

  it("renders N/A when observations is null", async () => {
    mockGet.mockResolvedValueOnce({ data: [{ ...mockVariable, observations: null }], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } });
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-observations")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-observations")).toHaveTextContent("N/A");
  });

  it("top action 0 (refresh) refetches data", async () => {
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByTestId("top-0")).toBeInTheDocument());
    const callsBefore = mockGet.mock.calls.length;
    fireEvent.click(screen.getByTestId("top-0"));
    await waitFor(() => expect(mockGet.mock.calls.length).toBeGreaterThan(callsBefore));
  });

  it("top action 1 (export) calls requestExport", async () => {
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByTestId("top-1")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("top-1"));
    await waitFor(() => expect(mockExport).toHaveBeenCalledWith(expect.objectContaining({ type: "VARIABLES" })));
  });

  it("top action 2 (create) opens modal", async () => {
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByTestId("top-2")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("top-2"));
    await waitFor(() => expect(screen.getByTestId("data-table")).toBeInTheDocument());
  });

  it("row action 0 (view) opens detail modal", async () => {
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(screen.getByTestId("data-table")).toBeInTheDocument());
  });

  it("row action 1 (goals) opens goals modal", async () => {
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-1")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    await waitFor(() => expect(screen.getByTestId("data-table")).toBeInTheDocument());
  });

  it("row action 3 (edit) fetches fresh variable", async () => {
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-3")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-3"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledWith(expect.stringContaining(mockVariable.id)));
  });

  it("row action 4 (delete) shows confirmation modal", async () => {
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-4")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-4"));
    await waitFor(() => expect(screen.getByTestId("confirm-modal")).toBeInTheDocument());
  });

  it("confirm delete calls del and refetches", async () => {
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-4")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-4"));
    await waitFor(() => expect(screen.getByTestId("confirm-modal")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() => expect(mockDel).toHaveBeenCalled());
  });

  it("shows error on fetch failure", async () => {
    mockGet.mockRejectedValueOnce({ message: "Error al cargar variables" });
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByText("Error al cargar variables")).toBeInTheDocument());
  });

  it("Reintentar button re-fetches data", async () => {
    mockGet.mockRejectedValueOnce({ message: "Error al cargar variables" });
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByText("Reintentar")).toBeInTheDocument());
    mockGet.mockImplementation((url: string) => {
      if (url.endsWith(`/${mockVariable.id}`)) return Promise.resolve(mockVariable);
      return Promise.resolve({ data: [mockVariable], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } });
    });
    fireEvent.click(screen.getByText("Reintentar"));
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
  });

  it("renders createAt column via col.render", async () => {
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-createAt")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-createAt")).not.toBeEmptyDOMElement();
  });

  it("renders updateAt column via col.render", async () => {
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByTestId("cell-0-updateAt")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-updateAt")).not.toBeEmptyDOMElement();
  });

  it("row action 2 (location) opens modal", async () => {
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-2")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-2"));
    await waitFor(() => expect(screen.getByTestId("data-table")).toBeInTheDocument());
  });

  it("row action 5 (users) opens modal", async () => {
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-5")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-5"));
    await waitFor(() => expect(screen.getByTestId("data-table")).toBeInTheDocument());
  });

  it("export error shows danger toast", async () => {
    mockExport.mockRejectedValueOnce(new Error("export failed"));
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByTestId("top-1")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("top-1"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("edit error shows danger toast", async () => {
    mockGet.mockImplementation((url: string) => {
      if (url.endsWith(`/${mockVariable.id}`)) return Promise.reject(new Error("fetch failed"));
      return Promise.resolve({ data: [mockVariable], meta: { total: 1, page: 1, limit: 10, totalPages: 1 } });
    });
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-3")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-3"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("onSave create calls post and shows success toast", async () => {
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByTestId("top-2")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("top-2"));
    await capturedVariableModalProps.onSave({ code: "VAR-002", name: "Nueva Variable", observations: "obs" });
    await waitFor(() => expect(mockPost).toHaveBeenCalled());
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("onSave update calls patch and shows success toast", async () => {
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-3")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-3"));
    // Wait for editing state to propagate (VariableModal receives initial={editing})
    await waitFor(() => expect(capturedVariableModalProps?.initial).toBeTruthy());
    await capturedVariableModalProps.onSave({ code: "VAR-001", name: "Updated", observations: "new obs" });
    await waitFor(() => expect(mockPatch).toHaveBeenCalled());
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("onSave error shows danger toast", async () => {
    mockPost.mockRejectedValueOnce(new Error("save failed"));
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByTestId("top-2")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("top-2"));
    await capturedVariableModalProps.onSave({ code: "VAR-002", name: "Fail", observations: "" });
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("delete error shows danger toast", async () => {
    mockDel.mockRejectedValueOnce(new Error("delete failed"));
    renderWithProviders(<MastersVariablesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0-action-4")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-4"));
    await waitFor(() => expect(screen.getByTestId("confirm-modal")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });
});
