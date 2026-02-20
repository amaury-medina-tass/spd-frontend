import { render, screen, fireEvent } from "@testing-library/react";
import { RolePermissionsModal } from "@/components/modals/roles/RolePermissionsModal";

const makePermissionsData = (overrides?: any) => ({
  role: { id: "r1", name: "Admin" },
  permissions: {
    "/users": {
      moduleId: "m1",
      moduleName: "Usuarios",
      actions: [
        { actionId: "a1", code: "read", name: "Leer", allowed: true },
        { actionId: "a2", code: "write", name: "Escribir", allowed: false },
      ],
    },
    "/settings": {
      moduleId: "m2",
      moduleName: "Configuración",
      actions: [
        { actionId: "a3", code: "read", name: "Ver", allowed: true },
        { actionId: "a4", code: "update", name: "Actualizar", allowed: true },
      ],
    },
    ...overrides,
  },
});

describe("RolePermissionsModal", () => {
  const defaultProps = {
    isOpen: true,
    permissionsData: makePermissionsData() as any,
    onClose: jest.fn(),
    onSave: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("renders when open with permissions data", () => {
    render(<RolePermissionsModal {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<RolePermissionsModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows Gestionar Permisos header", () => {
    render(<RolePermissionsModal {...defaultProps} />);
    expect(screen.getByText("Gestionar Permisos")).toBeInTheDocument();
  });

  it("shows role name in subheader", () => {
    render(<RolePermissionsModal {...defaultProps} />);
    expect(screen.getByText(/Admin/)).toBeInTheDocument();
  });

  it("shows Cancelar button", () => {
    render(<RolePermissionsModal {...defaultProps} />);
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("shows Guardar Permisos button", () => {
    render(<RolePermissionsModal {...defaultProps} />);
    expect(screen.getByText("Guardar Permisos")).toBeInTheDocument();
  });

  // --- Accordion / module rendering ---
  it("renders module names in accordion items", () => {
    render(<RolePermissionsModal {...defaultProps} />);
    expect(screen.getByText("Usuarios")).toBeInTheDocument();
    expect(screen.getByText("Configuración")).toBeInTheDocument();
  });

  it("renders action names", () => {
    render(<RolePermissionsModal {...defaultProps} />);
    expect(screen.getByText("Leer")).toBeInTheDocument();
    expect(screen.getByText("Escribir")).toBeInTheDocument();
    expect(screen.getByText("Ver")).toBeInTheDocument();
    expect(screen.getByText("Actualizar")).toBeInTheDocument();
  });

  it("renders allowed count chips (e.g. 1/2, 2/2)", () => {
    render(<RolePermissionsModal {...defaultProps} />);
    expect(screen.getByText("1/2")).toBeInTheDocument();
    expect(screen.getByText("2/2")).toBeInTheDocument();
  });

  // --- handlePermissionChange (individual action toggle via checkbox) ---
  it("toggles individual action via checkbox change", () => {
    render(<RolePermissionsModal {...defaultProps} />);
    const checkboxes = screen.getAllByRole("checkbox");
    // 4 action-level checkboxes (startContent checkboxes not rendered by mock)
    // Order: Leer(checked), Escribir(unchecked), Ver(checked), Actualizar(checked)
    const escribirCheckbox = checkboxes[1];
    fireEvent.click(escribirCheckbox);
    fireEvent.click(screen.getByText("Guardar Permisos"));
    expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
    const savedPermissions = defaultProps.onSave.mock.calls[0][0];
    expect(savedPermissions["/users"].actions.find((a: any) => a.actionId === "a2").allowed).toBe(true);
  });

  it("toggles action off via checkbox change", () => {
    render(<RolePermissionsModal {...defaultProps} />);
    const checkboxes = screen.getAllByRole("checkbox");
    // Leer (index 0) is currently allowed=true, toggle off
    fireEvent.click(checkboxes[0]);
    fireEvent.click(screen.getByText("Guardar Permisos"));
    const saved = defaultProps.onSave.mock.calls[0][0];
    expect(saved["/users"].actions.find((a: any) => a.actionId === "a1").allowed).toBe(false);
  });

  it("toggles action via div click (handlePermissionChange)", () => {
    render(<RolePermissionsModal {...defaultProps} />);
    // Click the div wrapping "Escribir"
    const escribirText = screen.getByText("Escribir");
    const actionDiv = escribirText.parentElement!;
    fireEvent.click(actionDiv);
    fireEvent.click(screen.getByText("Guardar Permisos"));
    const saved = defaultProps.onSave.mock.calls[0][0];
    expect(saved["/users"].actions.find((a: any) => a.actionId === "a2").allowed).toBe(true);
  });

  // --- onSave callback ---
  it("calls onSave with current permissions state on Guardar Permisos click", () => {
    render(<RolePermissionsModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Guardar Permisos"));
    expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
    expect(defaultProps.onSave).toHaveBeenCalledWith(expect.objectContaining({
      "/users": expect.objectContaining({ moduleName: "Usuarios" }),
      "/settings": expect.objectContaining({ moduleName: "Configuración" }),
    }));
  });

  // --- onClose ---
  it("calls onClose when Cancelar is clicked", () => {
    render(<RolePermissionsModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Cancelar"));
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  // --- Empty permissions ---
  it("shows empty message when no permissions", () => {
    render(<RolePermissionsModal {...defaultProps} permissionsData={{ role: { id: "r1", name: "Empty" }, permissions: {} } as any} />);
    expect(screen.getByText("No hay módulos con permisos configurados para este rol.")).toBeInTheDocument();
  });

  // --- null permissionsData ---
  it("shows empty message when permissionsData is null", () => {
    render(<RolePermissionsModal {...defaultProps} permissionsData={null} />);
    expect(screen.getByText("No hay módulos con permisos configurados para este rol.")).toBeInTheDocument();
  });

  // --- isModulePartiallyAllowed detection ---
  it("detects partially allowed module (1/2 actions allowed)", () => {
    render(<RolePermissionsModal {...defaultProps} />);
    expect(screen.getByText("1/2")).toBeInTheDocument();
  });

  // --- isModuleFullyAllowed detection ---
  it("detects fully allowed module (2/2 actions allowed)", () => {
    render(<RolePermissionsModal {...defaultProps} />);
    expect(screen.getByText("2/2")).toBeInTheDocument();
  });

  // --- Renders checkboxes for each action ---
  it("renders correct number of action checkboxes", () => {
    render(<RolePermissionsModal {...defaultProps} />);
    // 4 action-level checkboxes only (module-level in startContent not rendered by mock)
    expect(screen.getAllByRole("checkbox").length).toBe(4);
  });

  // --- Role name not shown when permissionsData has no role ---
  it("does not render role name when permissionsData has no role", () => {
    render(<RolePermissionsModal {...defaultProps} permissionsData={{ permissions: {} } as any} />);
    expect(screen.queryByText(/Rol:/)).not.toBeInTheDocument();
  });

  // --- Multiple toggles in sequence ---
  it("supports multiple toggles before saving", () => {
    render(<RolePermissionsModal {...defaultProps} />);
    const checkboxes = screen.getAllByRole("checkbox");
    // Toggle Escribir on (index 1)
    fireEvent.click(checkboxes[1]);
    // Toggle Ver off (index 2)
    fireEvent.click(checkboxes[2]);
    fireEvent.click(screen.getByText("Guardar Permisos"));
    const saved = defaultProps.onSave.mock.calls[0][0];
    expect(saved["/users"].actions.find((a: any) => a.actionId === "a2").allowed).toBe(true);
    expect(saved["/settings"].actions.find((a: any) => a.actionId === "a3").allowed).toBe(false);
  });

  // --- All no-action module ---
  it("renders module with all actions disallowed showing 0/N count", () => {
    const data = {
      role: { id: "r1", name: "Admin" },
      permissions: {
        "/empty": {
          moduleId: "m3",
          moduleName: "Vacío",
          actions: [
            { actionId: "x1", code: "a", name: "Acción A", allowed: false },
            { actionId: "x2", code: "b", name: "Acción B", allowed: false },
            { actionId: "x3", code: "c", name: "Acción C", allowed: false },
          ],
        },
      },
    };
    render(<RolePermissionsModal {...defaultProps} permissionsData={data as any} />);
    expect(screen.getByText("0/3")).toBeInTheDocument();
  });
});
