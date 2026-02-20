import { screen, fireEvent, waitFor, act } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
import { get, del, post, patch } from "@/lib/http";
import { addToast } from "@heroui/toast";

const mockGet = get as jest.Mock;
const mockDel = del as jest.Mock;
const mockPost = post as jest.Mock;
const mockPatch = patch as jest.Mock;
const mockAddToast = addToast as jest.Mock;

let capturedTableProps: any = {};
let capturedActionModalProps: any = {};

jest.mock("@/components/tables/DataTable", () => ({
  DataTable: (props: any) => {
    capturedTableProps = props;
    const { items = [], columns = [], renderCell, topActions = [], rowActions = [], ariaLabel, pagination, onSortChange } = props;
    return (
      <div data-testid="data-table" aria-label={ariaLabel}>
        {topActions.map((a: any, i: number) => (
          <button key={i} data-testid={`top-${i}`} onClick={a.onClick}>{a.label}</button>
        ))}
        {items.map((item: any, i: number) => (
          <div key={i} data-testid={`row-${i}`}>
            {columns.map((col: any) => (
              <span key={col.key} data-testid={`cell-${i}-${col.key}`}>
                {col.render ? col.render(item) : renderCell?.(item, col.key)}
              </span>
            ))}
            {rowActions?.map((a: any, j: number) => (
              <button key={j} data-testid={`row-${i}-action-${j}`} onClick={() => a.onClick?.(item)}>{a.label}</button>
            ))}
          </div>
        ))}
        {pagination && (
          <>
            <button data-testid="pagination-change" onClick={() => pagination.onChange(2)}>Next Page</button>
            <button data-testid="pagination-size" onClick={() => pagination.onPageSizeChange(20)}>Change Size</button>
          </>
        )}
        {onSortChange && (
          <button data-testid="sort-change" onClick={() => onSortChange({ column: "name", direction: "descending" })}>Sort</button>
        )}
      </div>
    );
  },
}));

jest.mock("@/components/modals/actions/ActionModal", () => ({
  ActionModal: (props: any) => {
    capturedActionModalProps = props;
    return <div data-testid="action-modal" />;
  },
}));

jest.mock("@/components/modals/ConfirmationModal", () => ({
  ConfirmationModal: ({ isOpen, onConfirm }: any) =>
    isOpen ? <div data-testid="confirm-modal"><button onClick={onConfirm}>Confirm</button></div> : null,
}));

import ActionsPage from "@/app/dashboard/access-control/actions/page";

const mockActions = {
  data: [
    { id: "a1", code_action: "READ", name: "Read", description: "Read access", created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-02T00:00:00.000Z" },
  ],
  meta: { total: 1, page: 1, limit: 10, totalPages: 3 },
};

describe("AccessControlActionsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReset();
    mockDel.mockReset();
    mockPost.mockReset();
    mockPatch.mockReset();
    capturedTableProps = {};
    capturedActionModalProps = {};
    mockGet.mockResolvedValue(mockActions);
    mockDel.mockResolvedValue(undefined);
    mockPost.mockResolvedValue({});
    mockPatch.mockResolvedValue({});
  });

  it("renders breadcrumbs", async () => {
    renderWithProviders(<ActionsPage />);
    await waitFor(() => expect(screen.getByText("Acciones")).toBeInTheDocument());
  });

  it("renders data table with fetched items", async () => {
    renderWithProviders(<ActionsPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
  });

  it("renders created_at and updated_at columns with formatted date via col.render", async () => {
    renderWithProviders(<ActionsPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    // col.render is called for created_at and updated_at — non-empty content expected
    const createdCell = screen.getByTestId("cell-0-created_at");
    const updatedCell = screen.getByTestId("cell-0-updated_at");
    expect(createdCell.textContent).not.toBe("");
    expect(updatedCell.textContent).not.toBe("");
  });

  it("shows access denied when no read permission", async () => {
    const { usePermissions } = require("@/hooks/usePermissions");
    (usePermissions as jest.Mock).mockReturnValueOnce({ canRead: false, canCreate: false, canUpdate: false, canDelete: false });
    renderWithProviders(<ActionsPage />);
    await waitFor(() => expect(screen.getByText("Acceso Denegado")).toBeInTheDocument());
  });

  it("clicks create top action", async () => {
    renderWithProviders(<ActionsPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Crear"));
  });

  it("clicks refresh top action triggers another fetch", async () => {
    renderWithProviders(<ActionsPage />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByText("Actualizar"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("onEdit success fetches fresh action data", async () => {
    const freshAction = { id: "a1", code_action: "READ", name: "Read Updated", description: "Updated", created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-02T00:00:00.000Z" };
    mockGet.mockResolvedValueOnce(mockActions).mockResolvedValueOnce(freshAction);
    renderWithProviders(<ActionsPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0")); // Editar
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("onEdit error shows danger toast", async () => {
    mockGet.mockResolvedValueOnce(mockActions).mockRejectedValueOnce({ data: { errors: { code: "NOT_FOUND" } } });
    renderWithProviders(<ActionsPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("onSave create path calls post", async () => {
    renderWithProviders(<ActionsPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    await act(async () => {
      await capturedActionModalProps.onSave({ code_action: "WRITE", name: "Write", description: "Write access" });
    });
    expect(mockPost).toHaveBeenCalled();
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("onSave edit path calls patch after onEdit", async () => {
    const freshAction = { id: "a1", code_action: "READ", name: "Updated", description: "desc", created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-02T00:00:00.000Z" };
    mockGet.mockResolvedValueOnce(mockActions).mockResolvedValueOnce(freshAction);
    renderWithProviders(<ActionsPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0")); // triggers onEdit
    // Wait for onEdit to resolve AND React to apply setEditing(freshAction)
    await waitFor(() => expect(capturedActionModalProps.initial?.id).toBe("a1"));
    await act(async () => {
      await capturedActionModalProps.onSave({ code_action: "READ", name: "Updated", description: "desc" });
    });
    expect(mockPatch).toHaveBeenCalled();
  });

  it("onSave error shows danger toast", async () => {
    mockPost.mockRejectedValueOnce({ data: { errors: { code: "CONFLICT" } } });
    renderWithProviders(<ActionsPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    await act(async () => {
      await capturedActionModalProps.onSave({ code_action: "WRITE", name: "Write" });
    });
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }));
  });

  it("clicks delete and confirms — calls del", async () => {
    renderWithProviders(<ActionsPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1")); // Eliminar
    await waitFor(() => expect(screen.getByTestId("confirm-modal")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() => expect(mockDel).toHaveBeenCalled());
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("handles delete error", async () => {
    mockDel.mockRejectedValueOnce({ data: { errors: { code: "ERR" } } });
    renderWithProviders(<ActionsPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    await waitFor(() => expect(screen.getByTestId("confirm-modal")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("shows error state and Reintentar button when fetch fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("network error"));
    renderWithProviders(<ActionsPage />);
    await waitFor(() => expect(screen.getByText("Reintentar")).toBeInTheDocument());
  });

  it("Reintentar button retries the fetch", async () => {
    mockGet.mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(mockActions);
    renderWithProviders(<ActionsPage />);
    await waitFor(() => expect(screen.getByText("Reintentar")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Reintentar"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("pagination onChange triggers refetch", async () => {
    renderWithProviders(<ActionsPage />);
    await waitFor(() => expect(screen.getByTestId("pagination-change")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("pagination-change"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("pagination onPageSizeChange triggers refetch", async () => {
    renderWithProviders(<ActionsPage />);
    await waitFor(() => expect(screen.getByTestId("pagination-size")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("pagination-size"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("sort change updates sort descriptor and refetches", async () => {
    renderWithProviders(<ActionsPage />);
    await waitFor(() => expect(screen.getByTestId("sort-change")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("sort-change"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });
});
