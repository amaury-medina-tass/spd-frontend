import { render, screen, fireEvent, within } from "@testing-library/react";
import { UserInfoModal } from "./UserInfoModal";

const mockInitialUser = {
  id: "u1",
  first_name: "John",
  last_name: "Doe",
  document_number: "123456",
  email: "john@test.com",
  is_active: true,
};

describe("UserInfoModal", () => {
  const baseProps = {
    isOpen: true,
    title: "Crear Usuario",
    initial: null as any,
    onClose: jest.fn(),
    onSave: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("renders title when open", () => {
    render(<UserInfoModal {...baseProps} />);
    expect(screen.getByText("Crear Usuario")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    render(<UserInfoModal {...baseProps} isOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows Nombre Input label", () => {
    render(<UserInfoModal {...baseProps} />);
    expect(screen.getByText("Nombre")).toBeInTheDocument();
  });

  it("shows Email Input label", () => {
    render(<UserInfoModal {...baseProps} />);
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("shows Cancelar button", () => {
    render(<UserInfoModal {...baseProps} />);
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  it("shows Guardar button", () => {
    render(<UserInfoModal {...baseProps} />);
    expect(screen.getByText("Guardar")).toBeInTheDocument();
  });

  // --- Create mode (initial=null) shows password fields ---
  it("shows password fields in create mode", () => {
    render(<UserInfoModal {...baseProps} />);
    expect(screen.getByText("Contraseña")).toBeInTheDocument();
    expect(screen.getByText("Confirmar Contraseña")).toBeInTheDocument();
  });

  // --- Edit mode (initial != null) hides password section ---
  it("does not show password section in edit mode", () => {
    render(<UserInfoModal {...baseProps} initial={mockInitialUser as any} title="Editar Usuario" />);
    expect(screen.queryByText("Contraseña")).not.toBeInTheDocument();
  });

  // --- Edit mode populates fields ---
  it("populates fields with initial data in edit mode", () => {
    render(<UserInfoModal {...baseProps} initial={mockInitialUser as any} />);
    expect(screen.getByDisplayValue("John")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("123456")).toBeInTheDocument();
    expect(screen.getByDisplayValue("john@test.com")).toBeInTheDocument();
  });

  // --- Input changes ---
  it("allows typing in Nombre field", () => {
    render(<UserInfoModal {...baseProps} />);
    const input = screen.getByLabelText("Nombre") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Jane" } });
    expect(input.value).toBe("Jane");
  });

  it("allows typing in Apellido field", () => {
    render(<UserInfoModal {...baseProps} />);
    const input = screen.getByLabelText("Apellido") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Smith" } });
    expect(input.value).toBe("Smith");
  });

  it("allows typing in Documento field (digits only)", () => {
    render(<UserInfoModal {...baseProps} />);
    const input = screen.getByLabelText("Documento") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "789" } });
    expect(input.value).toBe("789");
  });

  it("allows typing in Email field", () => {
    render(<UserInfoModal {...baseProps} />);
    const input = screen.getByLabelText("Email") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "j@t.co" } });
    expect(input.value).toBe("j@t.co");
  });

  // --- Email validation ---
  it("shows invalid email error", () => {
    render(<UserInfoModal {...baseProps} />);
    const input = screen.getByLabelText("Email") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "invalid" } });
    expect(screen.getByText("Correo electrónico inválido")).toBeInTheDocument();
  });

  it("does not show email error for valid email", () => {
    render(<UserInfoModal {...baseProps} />);
    const input = screen.getByLabelText("Email") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "valid@email.com" } });
    expect(screen.queryByText("Correo electrónico inválido")).not.toBeInTheDocument();
  });

  // --- Password visibility toggles ---
  it("renders password visibility toggle icons", () => {
    render(<UserInfoModal {...baseProps} />);
    // Eye icons for password visibility
    const eyeIcons = screen.getAllByTestId("icon-Eye");
    expect(eyeIcons.length).toBeGreaterThanOrEqual(2);
  });

  it("toggles password visibility on click", () => {
    render(<UserInfoModal {...baseProps} />);
    const passwordInput = screen.getByLabelText("Contraseña") as HTMLInputElement;
    expect(passwordInput.type).toBe("password");
    // Click the eye icon (first toggle button)
    const eyeIcons = screen.getAllByTestId("icon-Eye");
    const toggleBtn = eyeIcons[0].closest("div[data-testid='Button']") || eyeIcons[0].parentElement!;
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe("text");
  });

  it("toggles confirm password visibility", () => {
    render(<UserInfoModal {...baseProps} />);
    const confirmInput = screen.getByLabelText("Confirmar Contraseña") as HTMLInputElement;
    expect(confirmInput.type).toBe("password");
    // Find the second eye toggle
    const eyeIcons = screen.getAllByTestId("icon-Eye");
    const toggleBtn = eyeIcons[eyeIcons.length - 1].closest("div[data-testid='Button']") || eyeIcons[eyeIcons.length - 1].parentElement!;
    fireEvent.click(toggleBtn);
    expect(confirmInput.type).toBe("text");
  });

  // --- Generate password ---
  it("generates password on RefreshCw icon click", () => {
    render(<UserInfoModal {...baseProps} />);
    const refreshIcon = screen.getByTestId("icon-RefreshCw");
    const genBtn = refreshIcon.closest("div[data-testid='Button']") || refreshIcon.parentElement!;
    fireEvent.click(genBtn);
    const passwordInput = screen.getByLabelText("Contraseña") as HTMLInputElement;
    expect(passwordInput.value.length).toBeGreaterThanOrEqual(12);
  });

  it("generated password fills both password fields equally", () => {
    render(<UserInfoModal {...baseProps} />);
    const refreshIcon = screen.getByTestId("icon-RefreshCw");
    const genBtn = refreshIcon.closest("div[data-testid='Button']") || refreshIcon.parentElement!;
    fireEvent.click(genBtn);
    const pass = (screen.getByLabelText("Contraseña") as HTMLInputElement).value;
    const confirm = (screen.getByLabelText("Confirmar Contraseña") as HTMLInputElement).value;
    expect(pass).toBe(confirm);
    expect(pass.length).toBeGreaterThanOrEqual(12);
  });

  // --- Password mismatch ---
  it("shows mismatch error when passwords differ", () => {
    render(<UserInfoModal {...baseProps} />);
    const passInput = screen.getByLabelText("Contraseña") as HTMLInputElement;
    const confirmInput = screen.getByLabelText("Confirmar Contraseña") as HTMLInputElement;
    fireEvent.change(passInput, { target: { value: "Abcdef1!" } });
    fireEvent.change(confirmInput, { target: { value: "different" } });
    expect(screen.getByText("Las contraseñas no coinciden")).toBeInTheDocument();
  });

  // --- handleSave ---
  it("calls onSave with payload when Guardar is clicked (edit mode)", () => {
    render(<UserInfoModal {...baseProps} initial={mockInitialUser as any} />);
    fireEvent.click(screen.getByText("Guardar"));
    expect(baseProps.onSave).toHaveBeenCalledWith(expect.objectContaining({
      firstName: "John",
      lastName: "Doe",
      documentNumber: "123456",
      email: "john@test.com",
      is_active: true,
    }));
  });

  it("includes password in payload when set", () => {
    render(<UserInfoModal {...baseProps} />);
    // Fill required fields
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Jane" } });
    fireEvent.change(screen.getByLabelText("Apellido"), { target: { value: "Doe" } });
    fireEvent.change(screen.getByLabelText("Documento"), { target: { value: "999" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "jane@t.com" } });
    // Generate a valid password
    const refreshIcon = screen.getByTestId("icon-RefreshCw");
    fireEvent.click(refreshIcon.closest("div[data-testid='Button']") || refreshIcon.parentElement!);
    fireEvent.click(screen.getByText("Guardar"));
    expect(baseProps.onSave).toHaveBeenCalledWith(expect.objectContaining({
      password: expect.any(String),
    }));
  });

  // --- onClose ---
  it("calls onClose when Cancelar is clicked", () => {
    render(<UserInfoModal {...baseProps} />);
    fireEvent.click(screen.getByText("Cancelar"));
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
  });

  // --- Switch status ---
  it("shows Usuario Activo by default", () => {
    render(<UserInfoModal {...baseProps} />);
    expect(screen.getByText("Usuario Activo")).toBeInTheDocument();
  });

  it("toggles switch to show Usuario Inactivo", () => {
    render(<UserInfoModal {...baseProps} />);
    const switchInput = screen.getByRole("switch");
    fireEvent.click(switchInput);
    expect(screen.getByText("Usuario Inactivo")).toBeInTheDocument();
  });
});
