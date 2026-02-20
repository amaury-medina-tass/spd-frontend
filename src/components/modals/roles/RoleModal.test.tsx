import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RoleModal } from "./RoleModal";

jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => async (values: any) => ({ values, errors: {} }),
}));

const mockInitialRole = {
  id: "r1",
  name: "Admin",
  description: "Admin role",
  is_active: true,
};

describe("RoleModal", () => {
  const baseProps = {
    isOpen: true,
    title: "Crear Rol",
    initial: null as any,
    onClose: jest.fn(),
    onSave: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("renders title when open", () => {
    render(<RoleModal {...baseProps} />);
    expect(screen.getByText("Crear Rol")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<RoleModal {...baseProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows Nombre Input label", () => {
    render(<RoleModal {...baseProps} />);
    expect(screen.getByText("Nombre")).toBeInTheDocument();
  });

  it("shows Cancelar button", () => {
    render(<RoleModal {...baseProps} />);
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("shows Guardar button", () => {
    render(<RoleModal {...baseProps} />);
    expect(screen.getByText("Guardar")).toBeInTheDocument();
  });

  it("renders with edit title", () => {
    render(<RoleModal {...baseProps} title="Editar Rol" />);
    expect(screen.getByText("Editar Rol")).toBeInTheDocument();
  });

  // --- handleClose ---
  it("calls onClose when Cancelar is clicked", () => {
    render(<RoleModal {...baseProps} />);
    fireEvent.click(screen.getByText("Cancelar"));
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
  });

  // --- Form submission ---
  it("submits and calls onSave with form data in edit mode", async () => {
    render(<RoleModal {...baseProps} initial={mockInitialRole as any} title="Editar Rol" />);
    const form = screen.getByText("Guardar").closest("form")!;
    fireEvent.submit(form);
    await waitFor(() => {
      expect(baseProps.onSave).toHaveBeenCalledWith(expect.objectContaining({
        name: "Admin",
        is_active: true,
      }));
    });
  });

  // --- Edit mode populates fields ---
  it("populates fields with initial data in edit mode", () => {
    render(<RoleModal {...baseProps} initial={mockInitialRole as any} title="Editar Rol" />);
    expect(screen.getByDisplayValue("Admin")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Admin role")).toBeInTheDocument();
  });

  // --- Switch toggle ---
  it("shows Rol Activo by default", () => {
    render(<RoleModal {...baseProps} />);
    expect(screen.getByText("Rol Activo")).toBeInTheDocument();
  });

  it("toggles switch to show Rol Inactivo", () => {
    render(<RoleModal {...baseProps} />);
    const switchInput = screen.getByRole("switch");
    fireEvent.click(switchInput);
    expect(screen.getByText("Rol Inactivo")).toBeInTheDocument();
  });

  // --- Descripción field ---
  it("shows Descripción textarea", () => {
    render(<RoleModal {...baseProps} />);
    const textarea = screen.getByLabelText("Descripción");
    expect(textarea).toBeInTheDocument();
  });
});
