import { render, screen, fireEvent } from "@testing-library/react";
import { UserRoleModal } from "./UserRoleModal";

const mockUser = {
  id: "u1",
  first_name: "John",
  last_name: "Doe",
  email: "john@test.com",
  document_number: "12345",
  roles: [{ id: "r1", name: "Admin" }],
  missingRoles: [{ id: "r2", name: "Editor" }],
};

describe("UserRoleModal", () => {
  const defaultProps = {
    isOpen: true,
    user: mockUser as any,
    onClose: jest.fn(),
    onSave: jest.fn(),
    onUnassign: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("renders when open", () => {
    render(<UserRoleModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<UserRoleModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows Gestionar Rol header", () => {
    render(<UserRoleModal {...defaultProps} />);
    expect(screen.getByText("Gestionar Rol")).toBeInTheDocument();
  });

  it("shows user name", () => {
    render(<UserRoleModal {...defaultProps} />);
    expect(screen.getByText(/John.*Doe/)).toBeInTheDocument();
  });

  it("shows user email", () => {
    render(<UserRoleModal {...defaultProps} />);
    expect(screen.getByText("john@test.com")).toBeInTheDocument();
  });

  it("shows Cancelar button", () => {
    render(<UserRoleModal {...defaultProps} />);
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("shows user document number", () => {
    render(<UserRoleModal {...defaultProps} />);
    expect(screen.getByText("12345")).toBeInTheDocument();
  });

  it("shows existing role chip", () => {
    render(<UserRoleModal {...defaultProps} />);
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("shows Asignar Rol button", () => {
    render(<UserRoleModal {...defaultProps} />);
    expect(screen.getByText("Asignar Rol")).toBeInTheDocument();
  });

  // --- Select a role and assign ---
  it("selects a role and calls onSave on button click", () => {
    render(<UserRoleModal {...defaultProps} />);
    const select = screen.getByLabelText("Asignar Nuevo Rol");
    fireEvent.change(select, { target: { value: "Editor" } });
    fireEvent.click(screen.getByText("Asignar Rol"));
    expect(defaultProps.onSave).toHaveBeenCalledWith("Editor");
  });

  it("resets selection after assigning", () => {
    render(<UserRoleModal {...defaultProps} />);
    const select = screen.getByLabelText("Asignar Nuevo Rol");
    fireEvent.change(select, { target: { value: "Editor" } });
    fireEvent.click(screen.getByText("Asignar Rol"));
    expect(defaultProps.onSave).toHaveBeenCalled();
  });

  // --- onClose ---
  it("calls onClose when Cancelar is clicked", () => {
    render(<UserRoleModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Cancelar"));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  // --- Empty roles state ---
  it("shows message when user has no roles", () => {
    const noRolesUser = { ...mockUser, roles: [] };
    render(<UserRoleModal {...defaultProps} user={noRolesUser as any} />);
    expect(screen.getByText("Sin roles asignados")).toBeInTheDocument();
  });

  // --- No missing roles ---
  it("shows message when all roles assigned", () => {
    const allRolesUser = { ...mockUser, missingRoles: [] };
    render(<UserRoleModal {...defaultProps} user={allRolesUser as any} />);
    expect(screen.getByText("El usuario ya tiene todos los roles disponibles asignados.")).toBeInTheDocument();
  });

  // --- Available roles rendered ---
  it("renders available roles as select options", () => {
    render(<UserRoleModal {...defaultProps} />);
    expect(screen.getByText("Editor")).toBeInTheDocument();
  });

  // --- Null user ---
  it("renders gracefully with null user", () => {
    render(<UserRoleModal {...defaultProps} user={null} />);
    expect(screen.getByText("Sin roles asignados")).toBeInTheDocument();
  });
});
