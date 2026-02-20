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
let capturedUserInfoModalProps: any = {};
let capturedUserRoleModalProps: any = {};

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
          <button data-testid="sort-change" onClick={() => onSortChange({ column: "email", direction: "ascending" })}>Sort</button>
        )}
      </div>
    );
  },
}));

jest.mock("@/components/modals/users/UserInfoModal", () => ({
  UserInfoModal: (props: any) => {
    capturedUserInfoModalProps = props;
    return <div data-testid="user-modal" />;
  },
}));

jest.mock("@/components/modals/users/UserRoleModal", () => ({
  UserRoleModal: (props: any) => {
    capturedUserRoleModalProps = props;
    return <div data-testid="role-modal" />;
  },
}));

jest.mock("@/components/modals/ConfirmationModal", () => ({
  ConfirmationModal: ({ isOpen, onConfirm }: any) =>
    isOpen ? <div data-testid="confirm-modal"><button onClick={onConfirm}>Confirm</button></div> : null,
}));

import UsersPage from "@/app/dashboard/access-control/users/page";

const mockUsers = {
  data: [
    { id: "u1", first_name: "John", last_name: "Doe", email: "john@test.com", document_number: "123", is_active: true, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-02T00:00:00.000Z", roles: [{ id: "r1", name: "Admin" }] },
    { id: "u2", first_name: "Jane", last_name: "Smith", email: "jane@test.com", document_number: "456", is_active: false, created_at: "2023-06-15T00:00:00.000Z", updated_at: "2023-07-01T00:00:00.000Z", roles: [] },
  ],
  meta: { total: 2, page: 1, limit: 10, totalPages: 3 },
};

const mockUserWithRoles = {
  id: "u1",
  first_name: "John",
  last_name: "Doe",
  email: "john@test.com",
  roles: [{ id: "r1", name: "Admin" }],
};

describe("AccessControlUsersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset http mock queues (mockReset clears Once queues + call history)
    mockGet.mockReset();
    mockDel.mockReset();
    mockPost.mockReset();
    mockPatch.mockReset();
    capturedTableProps = {};
    capturedUserInfoModalProps = {};
    capturedUserRoleModalProps = {};
    mockGet.mockResolvedValue(mockUsers);
    mockDel.mockResolvedValue(undefined);
    mockPost.mockResolvedValue({});
    mockPatch.mockResolvedValue({});
  });

  it("renders breadcrumbs", async () => {
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText("Usuarios")).toBeInTheDocument());
  });

  it("renders data table with fetched items", async () => {
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
  });

  it("roles column renders joined role names", async () => {
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    // u1 has roles: [{ name: "Admin" }] → renders "Admin"
    expect(screen.getByTestId("cell-0-roles").textContent).toContain("Admin");
  });

  it("is_active=true renders Activo chip", async () => {
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-is_active").textContent).toContain("Activo");
  });

  it("is_active=false renders Inactivo chip", async () => {
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByTestId("row-1")).toBeInTheDocument());
    expect(screen.getByTestId("cell-1-is_active").textContent).toContain("Inactivo");
  });

  it("renders all column cells with formatted timestamps", async () => {
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    expect(screen.getByTestId("cell-0-created_at").textContent).not.toBe("");
    expect(screen.getByTestId("cell-0-updated_at").textContent).not.toBe("");
  });

  it("shows access denied when no read permission", async () => {
    const { usePermissions } = require("@/hooks/usePermissions");
    (usePermissions as jest.Mock).mockReturnValueOnce({ canRead: false, canCreate: false, canUpdate: false, canDelete: false, canAssignRole: false });
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText("Acceso Denegado")).toBeInTheDocument());
  });

  it("clicks create top action", async () => {
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Crear"));
  });

  it("clicks refresh top action triggers refetch", async () => {
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByText("Actualizar"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("onEdit success fetches fresh user", async () => {
    const freshUser = { id: "u1", first_name: "John", last_name: "Doe", email: "john@test.com", document_number: "123", is_active: true, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-02T00:00:00.000Z", roles: [] };
    mockGet.mockResolvedValueOnce(mockUsers).mockResolvedValueOnce(freshUser);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0")); // Editar
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("onEdit error shows danger toast", async () => {
    mockGet.mockResolvedValueOnce(mockUsers).mockRejectedValueOnce({ data: { errors: { code: "NOT_FOUND" } } });
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("onManageRole success fetches user roles", async () => {
    mockGet.mockResolvedValueOnce(mockUsers).mockResolvedValueOnce(mockUserWithRoles);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1")); // Gestionar Rol
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("onManageRole error shows danger toast", async () => {
    mockGet.mockResolvedValueOnce(mockUsers).mockRejectedValueOnce({ data: { errors: { code: "ERR" } } });
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("onSaveInfo create calls post(auth.register)", async () => {
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    await act(async () => {
      await capturedUserInfoModalProps.onSave({ firstName: "Ana", lastName: "López", documentNumber: "111", email: "ana@test.com", password: "Pass1!" });
    });
    expect(mockPost).toHaveBeenCalled();
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("onSaveInfo edit calls patch with snake_case fields", async () => {
    const freshUser = { id: "u1", first_name: "John", last_name: "Doe", email: "john@test.com", document_number: "123", is_active: true, created_at: "2024-01-01T00:00:00.000Z", updated_at: "2024-01-02T00:00:00.000Z", roles: [] };
    mockGet.mockResolvedValueOnce(mockUsers).mockResolvedValueOnce(freshUser);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-0")); // onEdit
    // Wait for onEdit to resolve AND React to apply setEditing(freshUser)
    await waitFor(() => expect(capturedUserInfoModalProps.initial?.id).toBe("u1"));
    await act(async () => {
      await capturedUserInfoModalProps.onSave({ firstName: "John", lastName: "Doe", documentNumber: "123", email: "john@test.com", is_active: true });
    });
    expect(mockPatch).toHaveBeenCalledWith(
      expect.stringContaining("u1"),
      expect.objectContaining({ first_name: "John" })
    );
  });

  it("onSaveInfo error shows danger toast", async () => {
    mockPost.mockRejectedValueOnce({ data: { errors: { code: "ERR" } } });
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    await act(async () => {
      await capturedUserInfoModalProps.onSave({ firstName: "X", lastName: "Y", documentNumber: "0", email: "x@y.com", password: "p" });
    });
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }));
  });

  it("onSaveRole calls post and refreshes user roles", async () => {
    mockGet.mockResolvedValueOnce(mockUsers)
      .mockResolvedValueOnce(mockUserWithRoles)  // manage role fetch
      .mockResolvedValueOnce(mockUserWithRoles)  // refresh after assign
      .mockResolvedValueOnce(mockUsers);         // fetchUsers
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    // Wait for onManageRole to resolve AND React to apply setSelectedUserForRole
    await waitFor(() => expect(capturedUserRoleModalProps.user?.id).toBe("u1"));
    await act(async () => {
      await capturedUserRoleModalProps.onSave("r1");
    });
    expect(mockPost).toHaveBeenCalled();
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("onSaveRole error shows danger toast", async () => {
    mockGet.mockResolvedValueOnce(mockUsers).mockResolvedValueOnce(mockUserWithRoles);
    mockPost.mockRejectedValueOnce({ data: { errors: { code: "ERR" } } });
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    await waitFor(() => expect(capturedUserRoleModalProps.user?.id).toBe("u1"));
    await act(async () => {
      await capturedUserRoleModalProps.onSave("r1");
    });
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }));
  });

  it("onUnassignRole calls del and refreshes user roles", async () => {
    mockGet.mockResolvedValueOnce(mockUsers)
      .mockResolvedValueOnce(mockUserWithRoles)
      .mockResolvedValueOnce(mockUserWithRoles)
      .mockResolvedValueOnce(mockUsers);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    await waitFor(() => expect(capturedUserRoleModalProps.user?.id).toBe("u1"));
    await act(async () => {
      await capturedUserRoleModalProps.onUnassign("r1");
    });
    expect(mockDel).toHaveBeenCalled();
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("onUnassignRole error shows danger toast", async () => {
    mockGet.mockResolvedValueOnce(mockUsers).mockResolvedValueOnce(mockUserWithRoles);
    mockDel.mockRejectedValueOnce({ data: { errors: { code: "ERR" } } });
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-1"));
    await waitFor(() => expect(capturedUserRoleModalProps.user?.id).toBe("u1"));
    await act(async () => {
      await capturedUserRoleModalProps.onUnassign("r1");
    });
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }));
  });

  it("clicks delete row action and confirms", async () => {
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByTestId("row-0")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("row-0-action-2")); // Eliminar
    await waitFor(() => expect(screen.getByTestId("confirm-modal")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() => expect(mockDel).toHaveBeenCalled());
  });

  it("handles delete error", async () => {
    mockDel.mockRejectedValueOnce({ data: { errors: { code: "ERR" } } });
    renderWithProviders(<UsersPage />);
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
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText("Reintentar")).toBeInTheDocument());
  });

  it("Reintentar retries the fetch", async () => {
    mockGet.mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce(mockUsers);
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByText("Reintentar")).toBeInTheDocument());
    fireEvent.click(screen.getByText("Reintentar"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("pagination onChange triggers refetch", async () => {
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByTestId("pagination-change")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("pagination-change"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("pagination onPageSizeChange triggers refetch", async () => {
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByTestId("pagination-size")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("pagination-size"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });

  it("sort change triggers refetch", async () => {
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(screen.getByTestId("sort-change")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("sort-change"));
    await waitFor(() => expect(mockGet).toHaveBeenCalledTimes(2));
  });
});
