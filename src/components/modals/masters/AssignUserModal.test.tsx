import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AssignUserModal } from "./AssignUserModal";

const mockGetUsers = jest.fn();
jest.mock("@/services/access-control/users.service", () => ({
  getUsers: (...args: any[]) => mockGetUsers(...args),
}));

// ResourceManager mock that renders items via renderCell so action buttons appear
jest.mock("@/components/common/ResourceManager", () => ({
  ResourceManager: ({ items, renderCell, columns, emptyContent }: any) => (
    <div data-testid="resource-manager">
      {items && items.length > 0
        ? items.map((item: any) => (
            <div key={item.id}>
              {(columns || []).map((col: any) => (
                <span key={col.uid}>{renderCell?.(item, col.uid)}</span>
              ))}
            </div>
          ))
        : emptyContent}
    </div>
  ),
}));

jest.mock("@/components/tables/CleanTable", () => ({
  CleanTable: () => <div data-testid="clean-table">CleanTable</div>,
}));

const allUsersData = [
  {
    id: "u1",
    email: "user1@test.com",
    first_name: "Alice",
    last_name: "Smith",
    document_number: "111",
    is_active: true,
    created_at: "",
    updated_at: "",
    roles: [],
  },
  {
    id: "u2",
    email: "user2@test.com",
    first_name: "Bob",
    last_name: "Jones",
    document_number: "222",
    is_active: true,
    created_at: "",
    updated_at: "",
    roles: [],
  },
];

const mockGetAssignedUsers = jest.fn();
const mockAssignUser = jest.fn();
const mockUnassignUser = jest.fn();

const defaultProps = {
  isOpen: true,
  entityId: "entity-1",
  entityCode: "VAR-001",
  entityLabel: "Variable",
  onClose: jest.fn(),
  getAssignedUsers: mockGetAssignedUsers,
  assignUser: mockAssignUser,
  unassignUser: mockUnassignUser,
};

describe("AssignUserModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetUsers.mockResolvedValue({ data: allUsersData, meta: { total: 2, page: 1, limit: 100, totalPages: 1 } });
    mockGetAssignedUsers.mockResolvedValue([
      { id: "a1", userId: "u1", firstName: "Alice", lastName: "Smith", email: "user1@test.com" },
    ]);
    mockAssignUser.mockResolvedValue({});
    mockUnassignUser.mockResolvedValue(undefined);
  });

  it("renders when open", () => {
    render(<AssignUserModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<AssignUserModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls getAssignedUsers on open with entityId (covers fetchAssigned)", async () => {
    render(<AssignUserModal {...defaultProps} />);
    await waitFor(() => expect(mockGetAssignedUsers).toHaveBeenCalledWith("entity-1"));
  });

  it("calls getUsers to fetch all users", async () => {
    render(<AssignUserModal {...defaultProps} />);
    await waitFor(() => expect(mockGetUsers).toHaveBeenCalled());
  });

  it("does not call getAssignedUsers when entityId is null", async () => {
    render(<AssignUserModal {...defaultProps} entityId={null} />);
    await new Promise((r) => setTimeout(r, 50));
    expect(mockGetAssignedUsers).not.toHaveBeenCalled();
  });

  it("renders ResourceManager components", async () => {
    render(<AssignUserModal {...defaultProps} />);
    await waitFor(() => expect(screen.getAllByTestId("resource-manager").length).toBeGreaterThan(0));
  });

  it("shows fetchAssigned error toast when getAssignedUsers rejects (line 80)", async () => {
    const { addToast } = require("@heroui/toast");
    mockGetAssignedUsers.mockRejectedValue(new Error("fetch assigned failed"));
    render(<AssignUserModal {...defaultProps} />);
    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ color: "danger" })
      )
    );
  });

  it("shows fetchAllUsers error toast when getUsers rejects (line 93)", async () => {
    const { addToast } = require("@heroui/toast");
    mockGetUsers.mockRejectedValue(new Error("fetch users failed"));
    render(<AssignUserModal {...defaultProps} />);
    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(
        expect.objectContaining({ color: "danger" })
      )
    );
  });

  it("enriches assigned users with data from allUsers (covers lines 138-140)", async () => {
    render(<AssignUserModal {...defaultProps} />);
    // After both fetches resolve, the enrich useEffect runs
    await waitFor(() => expect(mockGetUsers).toHaveBeenCalled());
    await waitFor(() => expect(mockGetAssignedUsers).toHaveBeenCalled());
    // Alice should appear in the assigned tab ResourceManager
    await waitFor(() => expect(screen.getAllByText(/Alice/i).length).toBeGreaterThan(0));
  });

  it("shows assigned user name in assigned tab", async () => {
    render(<AssignUserModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText(/Alice/i)).toBeInTheDocument());
  });

  it("shows available users (Bob) not in assigned set (covers lines 153-154)", async () => {
    render(<AssignUserModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText(/Bob/i)).toBeInTheDocument());
  });

  it("shows empty message when no assigned users", async () => {
    mockGetAssignedUsers.mockResolvedValue([]);
    render(<AssignUserModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByText("No hay usuarios asignados")).toBeInTheDocument());
  });

  it("calls assignUser when Asignar button is clicked (covers handleAssign lines 164-177)", async () => {
    render(<AssignUserModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByTitle("Asignar")).toBeInTheDocument());
    fireEvent.click(screen.getByTitle("Asignar"));
    await waitFor(() =>
      expect(mockAssignUser).toHaveBeenCalledWith("entity-1", "u2", expect.any(String))
    );
  });

  it("shows success toast after assigning user", async () => {
    const { addToast } = require("@heroui/toast");
    render(<AssignUserModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByTitle("Asignar")).toBeInTheDocument());
    fireEvent.click(screen.getByTitle("Asignar"));
    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }))
    );
  });

  it("calls unassignUser when Desasignar button is clicked (covers handleUnassign lines 182-191)", async () => {
    render(<AssignUserModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByTitle("Desasignar")).toBeInTheDocument());
    fireEvent.click(screen.getByTitle("Desasignar"));
    await waitFor(() =>
      expect(mockUnassignUser).toHaveBeenCalledWith("entity-1", "u1")
    );
  });

  it("shows handleAssign error toast on failure", async () => {
    const { addToast } = require("@heroui/toast");
    mockAssignUser.mockRejectedValue(new Error("assign failed"));
    render(<AssignUserModal {...defaultProps} />);
    await waitFor(() => expect(screen.getByTitle("Asignar")).toBeInTheDocument());
    fireEvent.click(screen.getByTitle("Asignar"));
    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("shows Gestionar Usuarios header", () => {
    render(<AssignUserModal {...defaultProps} />);
    expect(screen.getByText("Gestionar Usuarios")).toBeInTheDocument();
  });

  it("shows entityCode in header", () => {
    render(<AssignUserModal {...defaultProps} />);
    expect(screen.getByText("Variable: VAR-001")).toBeInTheDocument();
  });

  it("renders with entityLabel Indicador", () => {
    render(<AssignUserModal {...defaultProps} entityLabel="Indicador" entityCode="IND-001" />);
    expect(screen.getByText("Indicador: IND-001")).toBeInTheDocument();
  });

  it("calls onClose when Cerrar is clicked", () => {
    const onClose = jest.fn();
    render(<AssignUserModal {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText("Cerrar"));
    expect(onClose).toHaveBeenCalled();
  });
});
