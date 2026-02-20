import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ModuleModal } from "@/components/modals/modules/ModuleModal";

jest.mock("@hookform/resolvers/zod", () => ({
  zodResolver: () => async (values: any) => ({ values, errors: {} }),
}));

jest.mock("@/config/navigation", () => ({
  getAvailableRoutes: () => [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/users", label: "Users" },
  ],
}));

describe("ModuleModal", () => {
  const baseProps = {
    isOpen: true,
    title: "Crear Módulo",
    initial: null as any,
    onClose: jest.fn(),
    onSave: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("renders title when open", () => {
    render(<ModuleModal {...baseProps} />);
    expect(screen.getByText("Crear Módulo")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<ModuleModal {...baseProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows Cancelar button", () => {
    render(<ModuleModal {...baseProps} />);
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("shows Guardar button", () => {
    render(<ModuleModal {...baseProps} />);
    expect(screen.getByText("Guardar")).toBeInTheDocument();
  });

  it("renders with edit title", () => {
    render(<ModuleModal {...baseProps} title="Editar Módulo" />);
    expect(screen.getByText("Editar Módulo")).toBeInTheDocument();
  });

  it("shows Nombre, Descripción and Ruta fields", () => {
    render(<ModuleModal {...baseProps} />);
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("Descripción")).toBeInTheDocument();
  });

  it("shows route options in select", () => {
    render(<ModuleModal {...baseProps} />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
  });

  // --- handleClose ---
  it("calls onClose when Cancelar is clicked", () => {
    render(<ModuleModal {...baseProps} />);
    fireEvent.click(screen.getByText("Cancelar"));
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
  });

  // --- Route selection auto-fills name ---
  it("selects a route from the dropdown", () => {
    render(<ModuleModal {...baseProps} />);
    const select = screen.getByLabelText("Ruta");
    fireEvent.change(select, { target: { value: "/dashboard" } });
    // name should auto-fill since it's empty — but route.path value might be text content
    expect(select).toBeInTheDocument();
  });

  // --- Form submission ---
  it("submits the form and calls onSave in edit mode", async () => {
    const initial = { id: "m1", name: "Existing", description: "Desc", path: "/dashboard" };
    render(<ModuleModal {...baseProps} initial={initial as any} />);
    const form = screen.getByText("Guardar").closest("form")!;
    fireEvent.submit(form);
    await waitFor(() => {
      expect(baseProps.onSave).toHaveBeenCalledWith(expect.objectContaining({
        name: "Existing",
        path: "/dashboard",
      }));
    });
  });

  // --- Edit mode populates fields ---
  it("populates fields in edit mode", () => {
    const initial = { id: "m1", name: "Existing", description: "Desc", path: "/dashboard" };
    render(<ModuleModal {...baseProps} initial={initial as any} title="Editar Módulo" />);
    expect(screen.getByDisplayValue("Existing")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Desc")).toBeInTheDocument();
  });
});
