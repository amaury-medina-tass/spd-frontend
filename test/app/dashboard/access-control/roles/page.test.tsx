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
let capturedRoleModalProps: any = {};
let capturedPermissionsModalProps: any = {};

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

jest.mock("@/components/modals/roles/RoleModal", () => ({
  RoleModal: (props: any) => {
    capturedRoleModalProps = props;
    return <div data-testid="role-modal" />;
  },
}));

jest.mock("@/components/modals/roles/RolePermissionsModal", () => ({
  RolePermissionsModal: (props: any) => {
    capturedPermissionsModalProps = props;
    return <div data-testid="perms-modal" />;
  },
}));

jest.mock("@/components/modals/ConfirmationModal", () => ({
  ConfirmationModal: ({ isOpen, onConfirm }: any) =>
    isOpen ? <div data-testid="confirm-modal"><button onClick={onConfirm}>Confirm</button></div> : null,
}));

import RolesPage from "@/app/dashboard/access-control/roles/page";

const mockRoles = {
  data: [
    { id: "r1", name: "Admin", description: "Administrator role", is_active: true, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-02-01T00:00:00.000Z" },
    { id: "r2", name: "User", description: "Basic user", is_active: false, created_at: "2023-06-01T00:00:00.000Z", updated_at: "2023-07-01T00:00:00.000Z" },
  ],
  meta: { total: 2, page: 1, limit: 10, totalPages: 3 },
};

const mockPermissionsData = {
  role: { id: "r1", name: "Admin" },
  modules: [],
};

describe("AccessControlRolesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReset();
    mockDel.mockReset();
    mockPost.mockReset();
    mockPatch.mockReset();
    capturedTableProps = {};
    capturedRoleModalProps = {};
    capturedPermissionsModalProps = {};
    mockGet.mockResolvedValue(mockRoles);
    mockDel.mockResolvedValue(undefined);
    mockPost.mockResolvedValue({});
    mockPatch.mockResolvedValue({});
  });

  it("renders breadcrumbs", async () => {
    renderWithProviders(<RolesPage />);
    await waitFor(() => expect(screen.getByText("Roles")).toBeInTheDocument());
  });

  it("renders data table with fetched items", async () => {
    renderWithProviders(<RolesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
  });

  it("is_active=true renders Activo chip via col.render", async () => {
    renderWithProviders(<RolesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    // row-0 has is_active=true → "Activo"
    expect(screen.getByTestId("cell-0-is_active").textContent).toContain("Activo");
  });

  it("is_active=false renders Inactivo chip via col.render", async () => {
    renderWithProviders(<RolesPage />);
    await waitFor(() => expect(screen.getByTestId("row-1")).toBeInTheDocument());
    // row-1 has is_active=false → "Inactivo"
    expect(screen.getByTestId("cell-1-is_active").textContent).toContain("Inactivo");
  });

  it("renders created_at and updated_at formatted via col.render", async () => {
    renderWithProviders(<RolesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-created_at").textContent).not.toBe("");
    expect(screen.getByTestId("cell-0-updated_at").textContent).not.toBe("");
  });

  it("shows access denied when no read permission", async () => {
    const { usePermissions } = require("@/hooks/usePermissions");
    (usePermissions as jest.Mock).mockReturnValueOnce({ canRead: false, canCreate: false, canUpdate: false, canDelete: false, canAssignPermission: false });
    renderWithProviders(<RolesPage />);
    await waitFor(() => expect(screen.getByText("Acceso Denegado")).toBeInTheDocument());
  });

  it("clicks create top action", async () => {
    renderWithProviders(<RolesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Crear"));
  });

  it("clicks refresh top action triggers refetch", async () => {
    renderWithProviders(<RolesPage />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByText("Actualizar"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("onEdit success fetches fresh role", async () => {
    const freshRole = { id: "r1", name: "Admin", description: "desc", is_active: true, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-02-01T00:00:00.000Z" };
    mockGet.mockResolvedValueOnce(mockRoles).mockResolvedValueOnce(freshRole);
    renderWithProviders(<RolesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0")); // Editar
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("onEdit error shows danger toast", async () => {
    mockGet.mockResolvedValueOnce(mockRoles).mockRejectedValueOnce({ data: { errors: { code: "NOT_FOUND" } } });
    renderWithProviders(<RolesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("onManagePermissions success fetches role permissions", async () => {
    mockGet.mockResolvedValueOnce(mockRoles).mockResolvedValueOnce(mockPermissionsData);
    renderWithProviders(<RolesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1")); // Gestionar Permisos
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("onManagePermissions error shows danger toast", async () => {
    mockGet.mockResolvedValueOnce(mockRoles).mockRejectedValueOnce({ data: { errors: { code: "ERR" } } });
    renderWithProviders(<RolesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("onSavePermissions calls patch with allowed permissionIds", async () => {
    mockGet.mockResolvedValueOnce(mockRoles).mockResolvedValueOnce(mockPermissionsData);
    renderWithProviders(<RolesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    // Wait for onManagePermissions to resolve AND React to apply setSelectedRolePermissions
    await waitFor(() => expect(capturedPermissionsModalProps.permissionsData?.role.id).toBe("r1"));
    await act(async () => {
      await capturedPermissionsModalProps.onSave({
        "/users": {
          role: {},
          actions: [
            { permissionId: "p1", allowed: true },
            { permissionId: "p2", allowed: false },
          ],
        },
      });
    });
    expect(mockPatch).toHaveBeenCalledWith(
      expect.stringContaining("r1"),
      expect.objectContaining({ permissionIds: ["p1"] })
    );
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("onSavePermissions error shows danger toast", async () => {
    mockGet.mockResolvedValueOnce(mockRoles).mockResolvedValueOnce(mockPermissionsData);
    mockPatch.mockRejectedValueOnce({ data: { errors: { code: "ERR" } } });
    renderWithProviders(<RolesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    await waitFor(() => expect(capturedPermissionsModalProps.permissionsData?.role.id).toBe("r1"));
    await act(async () => {
      await capturedPermissionsModalProps.onSave({ "/users": { role: {}, actions: [] } });
    });
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }));
  });

  it("onSave create path calls post", async () => {
    renderWithProviders(<RolesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    await act(async () => {
      await capturedRoleModalProps.onSave({ name: "New Role", description: "desc", is_active: true });
    });
    expect(mockPost).toHaveBeenCalled();
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("onSave edit path calls patch after onEdit", async () => {
    const freshRole = { id: "r1", name: "Admin", description: "desc", is_active: true, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-02-01T00:00:00.000Z" };
    mockGet.mockResolvedValueOnce(mockRoles).mockResolvedValueOnce(freshRole);
    renderWithProviders(<RolesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    // Wait for onEdit to resolve AND React to apply setEditing(freshRole)
    await waitFor(() => expect(capturedRoleModalProps.initial?.id).toBe("r1"));
    await act(async () => {
      await capturedRoleModalProps.onSave({ name: "Admin", description: "desc", is_active: true });
    });
    expect(mockPatch).toHaveBeenCalled();
  });

  it("onSave error shows danger toast", async () => {
    mockPost.mockRejectedValueOnce({ data: { errors: { code: "ERR" } } });
    renderWithProviders(<RolesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    await act(async () => {
      await capturedRoleModalProps.onSave({ name: "Role X", is_active: true });
    });
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }));
  });

  it("clicks delete and confirms", async () => {
    renderWithProviders(<RolesPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-2")); // Eliminar
    await waitFor(() => expect(screen.getByTestId("confirm-modal")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() => expect(mockDel).toHaveBeenCalled());
  });

  it("handles delete error", async () => {
    mockDel.mockRejectedValueOnce({ data: { errors: { code: "ERR" } } });
    renderWithProviders(<RolesPage />);
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
    renderWithProviders(<RolesPage />);
    await waitFor(() => expect(screen.getByText("Reintentar")).toBeInTheDocument());
  });

  it("Reintentar retries the fetch", async () => {
    mockGet.mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce(mockRoles);
    renderWithProviders(<RolesPage />);
    await waitFor(() => expect(screen.getByText("Reintentar")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Reintentar"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("pagination onChange triggers refetch", async () => {
    renderWithProviders(<RolesPage />);
    await waitFor(() => expect(screen.getByTestId("pagination-change")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("pagination-change"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("pagination onPageSizeChange triggers refetch", async () => {
    renderWithProviders(<RolesPage />);
    await waitFor(() => expect(screen.getByTestId("pagination-size")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("pagination-size"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("sort change triggers refetch", async () => {
    renderWithProviders(<RolesPage />);
    await waitFor(() => expect(screen.getByTestId("sort-change")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("sort-change"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });
});
