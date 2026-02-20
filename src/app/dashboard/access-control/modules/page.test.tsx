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
let capturedModuleModalProps: any = {};
let capturedActionsModalProps: any = {};

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
          <button data-testid="sort-change" onClick={() => onSortChange({ column: "path", direction: "descending" })}>Sort</button>
        )}
      </div>
    );
  },
}));

jest.mock("@/components/modals/modules/ModuleModal", () => ({
  ModuleModal: (props: any) => {
    capturedModuleModalProps = props;
    return <div data-testid="module-modal" />;
  },
}));

jest.mock("@/components/modals/modules/ModuleActionsModal", () => ({
  ModuleActionsModal: (props: any) => {
    capturedActionsModalProps = props;
    return <div data-testid="actions-modal" />;
  },
}));

jest.mock("@/components/modals/ConfirmationModal", () => ({
  ConfirmationModal: ({ isOpen, onConfirm }: any) =>
    isOpen ? <div data-testid="confirm-modal"><button onClick={onConfirm}>Confirm</button></div> : null,
}));

import ModulesPage from "./page";

const mockModules = {
  data: [
    { id: "m1", name: "Users", path: "/users", description: "User module", created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-02T00:00:00.000Z" },
  ],
  meta: { total: 1, page: 1, limit: 10, totalPages: 3 },
};

const mockModuleWithActions = {
  id: "m1",
  name: "Users",
  path: "/users",
  actions: [{ id: "act1", code_action: "READ", name: "Read" }],
};

describe("AccessControlModulesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReset();
    mockDel.mockReset();
    mockPost.mockReset();
    mockPatch.mockReset();
    capturedTableProps = {};
    capturedModuleModalProps = {};
    capturedActionsModalProps = {};
    mockGet.mockResolvedValue(mockModules);
    mockDel.mockResolvedValue(undefined);
    mockPost.mockResolvedValue({});
    mockPatch.mockResolvedValue({});
    // Include canAssignAction so "Gestionar Acciones" row action appears
    const { usePermissions } = require("@/hooks/usePermissions");
    (usePermissions as jest.Mock).mockReturnValue({
      canRead: true, canCreate: true, canUpdate: true, canDelete: true, canAssignAction: true,
    });
  });

  it("renders breadcrumbs", async () => {
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(screen.getByText("Módulos")).toBeInTheDocument());
  });

  it("renders data table with fetched items", async () => {
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
  });

  it("renders columns with formatted dates via col.render", async () => {
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-name")).toBeInTheDocument();
    expect(screen.getByTestId("cell-0-created_at").textContent).not.toBe("");
    expect(screen.getByTestId("cell-0-updated_at").textContent).not.toBe("");
  });

  it("shows access denied when no read permission", async () => {
    const { usePermissions } = require("@/hooks/usePermissions");
    (usePermissions as jest.Mock).mockReturnValueOnce({ canRead: false, canCreate: false, canUpdate: false, canDelete: false, canAssignAction: false });
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(screen.getByText("Acceso Denegado")).toBeInTheDocument());
  });

  it("clicks create top action", async () => {
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Crear"));
  });

  it("clicks refresh top action triggers refetch", async () => {
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByText("Actualizar"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("onEdit success fetches fresh module", async () => {
    const freshModule = { id: "m1", name: "Users Updated", path: "/users", description: "desc", created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-02T00:00:00.000Z" };
    mockGet.mockResolvedValueOnce(mockModules).mockResolvedValueOnce(freshModule);
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0")); // Editar
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("onEdit error shows danger toast", async () => {
    mockGet.mockResolvedValueOnce(mockModules).mockRejectedValueOnce({ data: { errors: { code: "NOT_FOUND" } } });
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("onManageActions success fetches module actions", async () => {
    mockGet.mockResolvedValueOnce(mockModules).mockResolvedValueOnce(mockModuleWithActions);
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1")); // Gestionar Acciones
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("onManageActions error shows danger toast", async () => {
    mockGet.mockResolvedValueOnce(mockModules).mockRejectedValueOnce({ data: { errors: { code: "ERR" } } });
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("onAssignAction calls post and refreshes actions", async () => {
    mockGet.mockResolvedValueOnce(mockModules)
      .mockResolvedValueOnce(mockModuleWithActions) // manage actions load
      .mockResolvedValueOnce(mockModuleWithActions); // refresh after assign
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1")); // open manage actions
    // Wait for onManageActions to resolve AND React to apply setSelectedModuleForActions
    await waitFor(() => expect(capturedActionsModalProps.module?.id).toBe("m1"));
    await act(async () => {
      await capturedActionsModalProps.onAssign("act1");
    });
    expect(mockPost).toHaveBeenCalled();
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("onAssignAction error shows danger toast", async () => {
    mockGet.mockResolvedValueOnce(mockModules).mockResolvedValueOnce(mockModuleWithActions);
    mockPost.mockRejectedValueOnce({ data: { errors: { code: "ERR" } } });
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    await waitFor(() => expect(capturedActionsModalProps.module?.id).toBe("m1"));
    await act(async () => {
      await capturedActionsModalProps.onAssign("act1");
    });
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }));
  });

  it("onUnassignAction calls del and refreshes actions", async () => {
    mockGet.mockResolvedValueOnce(mockModules)
      .mockResolvedValueOnce(mockModuleWithActions)
      .mockResolvedValueOnce(mockModuleWithActions);
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    await waitFor(() => expect(capturedActionsModalProps.module?.id).toBe("m1"));
    await act(async () => {
      await capturedActionsModalProps.onUnassign("act1");
    });
    expect(mockDel).toHaveBeenCalled();
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("onUnassignAction error shows danger toast", async () => {
    mockGet.mockResolvedValueOnce(mockModules).mockResolvedValueOnce(mockModuleWithActions);
    mockDel.mockRejectedValueOnce({ data: { errors: { code: "ERR" } } });
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    await waitFor(() => expect(capturedActionsModalProps.module?.id).toBe("m1"));
    await act(async () => {
      await capturedActionsModalProps.onUnassign("act1");
    });
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }));
  });

  it("onSave create path calls post", async () => {
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    await act(async () => {
      await capturedModuleModalProps.onSave({ name: "New Module", path: "/new", description: "desc" });
    });
    expect(mockPost).toHaveBeenCalled();
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("onSave edit path calls patch after onEdit", async () => {
    const freshModule = { id: "m1", name: "Users", path: "/users", description: "desc", created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-02T00:00:00.000Z" };
    mockGet.mockResolvedValueOnce(mockModules).mockResolvedValueOnce(freshModule);
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() => expect(capturedModuleModalProps.initial?.id).toBe("m1"));
    await act(async () => {
      await capturedModuleModalProps.onSave({ name: "Users", path: "/users", description: "desc" });
    });
    expect(mockPatch).toHaveBeenCalled();
  });

  it("onSave error shows danger toast", async () => {
    mockPost.mockRejectedValueOnce({ data: { errors: { code: "ERR" } } });
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    await act(async () => {
      await capturedModuleModalProps.onSave({ name: "X", path: "/x" });
    });
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }));
  });

  it("clicks delete row action and confirms", async () => {
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-2")); // Eliminar (index 2 with canAssignAction)
    await waitFor(() => expect(screen.getByTestId("confirm-modal")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() => expect(mockDel).toHaveBeenCalled());
  });

  it("handles delete error", async () => {
    mockDel.mockRejectedValueOnce({ data: { errors: { code: "ERR" } } });
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-2"));
    await waitFor(() => expect(screen.getByTestId("confirm-modal")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("shows error state and Reintentar when fetch fails", async () => {
    mockGet.mockRejectedValueOnce(new Error("network"));
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(screen.getByText("Reintentar")).toBeInTheDocument());
  });

  it("Reintentar retries the fetch", async () => {
    mockGet.mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce(mockModules);
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(screen.getByText("Reintentar")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Reintentar"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("pagination onChange triggers refetch", async () => {
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(screen.getByTestId("pagination-change")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("pagination-change"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("pagination onPageSizeChange triggers refetch", async () => {
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(screen.getByTestId("pagination-size")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("pagination-size"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("sort change triggers refetch", async () => {
    renderWithProviders(<ModulesPage />);
    await waitFor(() => expect(screen.getByTestId("sort-change")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("sort-change"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });
});
