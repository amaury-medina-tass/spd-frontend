import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
import { post } from "@/lib/http";
import { addToast } from "@heroui/toast";

jest.mock("@/components/layout/ThemeToggle", () => ({ ThemeToggle: () => null }));
jest.mock("@/components/auth/useAuth", () => ({
  useAuth: jest.fn(() => ({ refreshMe: jest.fn().mockResolvedValue(undefined) })),
}));

import RegisterPage from "./page";

const mockPost = post as jest.Mock;
const mockAddToast = addToast as jest.Mock;
const mockRouterPush = jest.fn();

// Helpers to fill all register fields
function fillRegisterForm() {
  fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Juan" } });
  fireEvent.change(screen.getByLabelText("Apellido"), { target: { value: "García" } });
  fireEvent.change(screen.getByLabelText("Documento"), { target: { value: "12345678" } });
  fireEvent.change(screen.getByLabelText("Correo Electrónico"), { target: { value: "juan@test.com" } });
  fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "Pass123!" } });
  fireEvent.change(screen.getByLabelText("Confirmar"), { target: { value: "Pass123!" } });
}

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockResolvedValue({});
    const { useRouter } = require("next/navigation");
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush, replace: jest.fn(), back: jest.fn() });
  });

  // ── Register step ────────────────────────────────────────────────────────

  it("renders register form title", () => {
    renderWithProviders(<RegisterPage />);
    const elements = screen.getAllByText(/Crear Cuenta/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  it("renders all required inputs", () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByLabelText("Nombre")).toBeInTheDocument();
    expect(screen.getByLabelText("Apellido")).toBeInTheDocument();
    expect(screen.getByLabelText("Documento")).toBeInTheDocument();
    expect(screen.getByLabelText("Correo Electrónico")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar")).toBeInTheDocument();
  });

  it("renders login link", () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByText(/Inicia Sesi/i)).toBeInTheDocument();
  });

  it("updates field values on change", () => {
    renderWithProviders(<RegisterPage />);
    fillRegisterForm();
    expect(screen.getByLabelText("Nombre")).toHaveValue("Juan");
    expect(screen.getByLabelText("Correo Electrónico")).toHaveValue("juan@test.com");
  });

  it("shows passwords-don't-match error when passwords differ", async () => {
    renderWithProviders(<RegisterPage />);
    fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: "Pass1!" } });
    fireEvent.change(screen.getByLabelText("Confirmar"), { target: { value: "Pass2!" } });
    await waitFor(() =>
      expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument()
    );
  });

  it("generatePassword button fills both password fields with same value", async () => {
    renderWithProviders(<RegisterPage />);
    // Button order: [0]=togglePasswordVisibility, [1]=generatePassword, [2]=toggleConfirmVisibility, [3]=submit
    const btns = screen.getAllByTestId("Button");
    fireEvent.click(btns[1]); // generatePassword
    await waitFor(() => {
      const passVal = (screen.getByLabelText("Contraseña") as HTMLInputElement).value;
      const confVal = (screen.getByLabelText("Confirmar") as HTMLInputElement).value;
      expect(passVal).not.toBe("");
      expect(passVal).toBe(confVal);
    });
  });

  it("togglePasswordVisibility click does not throw", () => {
    renderWithProviders(<RegisterPage />);
    fireEvent.click(screen.getAllByTestId("Button")[0]);
  });

  it("toggleConfirmPasswordVisibility click does not throw", () => {
    renderWithProviders(<RegisterPage />);
    fireEvent.click(screen.getAllByTestId("Button")[2]);
  });

  it("isValid is false when any field is empty — submit does nothing", async () => {
    renderWithProviders(<RegisterPage />);
    // Only fill some fields
    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Juan" } });
    // Click submit (last Button)
    const btns = screen.getAllByTestId("Button");
    fireEvent.click(btns[btns.length - 1]);
    await new Promise((r) => setTimeout(r, 50));
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("onSubmitRegister success transitions to verify step", async () => {
    renderWithProviders(<RegisterPage />);
    fillRegisterForm();
    const btns = screen.getAllByTestId("Button");
    fireEvent.click(btns[btns.length - 1]); // submit
    await waitFor(() =>
      expect(screen.getByTestId("input-otp")).toBeInTheDocument()
    );
    expect(mockPost).toHaveBeenCalled();
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("onSubmitRegister error shows danger toast", async () => {
    mockPost.mockRejectedValueOnce({ data: { errors: { code: "EMAIL_TAKEN" } } });
    renderWithProviders(<RegisterPage />);
    fillRegisterForm();
    const btns = screen.getAllByTestId("Button");
    fireEvent.click(btns[btns.length - 1]);
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
    expect(screen.queryByTestId("input-otp")).not.toBeInTheDocument();
  });

  it("onSubmitRegister error uses fallback message", async () => {
    mockPost.mockRejectedValueOnce({ data: { message: "User exists" } });
    renderWithProviders(<RegisterPage />);
    fillRegisterForm();
    const btns = screen.getAllByTestId("Button");
    fireEvent.click(btns[btns.length - 1]);
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  // ── Helper: transition to verify step ───────────────────────────────────

  async function goToVerifyStep() {
    renderWithProviders(<RegisterPage />);
    fillRegisterForm();
    const btns = screen.getAllByTestId("Button");
    fireEvent.click(btns[btns.length - 1]);
    await waitFor(() => expect(screen.getByTestId("input-otp")).toBeInTheDocument());
    jest.clearAllMocks();
    mockPost.mockResolvedValue({});
  }

  // ── Verify step ─────────────────────────────────────────────────────────

  it("verify step renders OTP input and buttons", async () => {
    await goToVerifyStep();
    expect(screen.getByTestId("input-otp")).toBeInTheDocument();
    // "Verificar Correo" as both h1 and button
    const verifyTexts = screen.getAllByText("Verificar Correo");
    expect(verifyTexts.length).toBeGreaterThanOrEqual(1);
  });

  it("onVerify does nothing when code is empty", async () => {
    await goToVerifyStep();
    fireEvent.click(screen.getAllByTestId("Button")[0]); // verify button
    await new Promise((r) => setTimeout(r, 50));
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("onVerify success calls post and navigates to /dashboard", async () => {
    await goToVerifyStep();
    fireEvent.change(screen.getByTestId("input-otp"), { target: { value: "123456" } });
    fireEvent.click(screen.getAllByTestId("Button")[0]);
    await waitFor(() => expect(mockPost).toHaveBeenCalled());
    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith("/dashboard"));
  });

  it("onVerify error shows danger toast", async () => {
    await goToVerifyStep();
    mockPost.mockRejectedValueOnce({ data: { errors: { code: "BAD_OTP" } } });
    fireEvent.change(screen.getByTestId("input-otp"), { target: { value: "000000" } });
    fireEvent.click(screen.getAllByTestId("Button")[0]);
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("onResend success shows success toast", async () => {
    await goToVerifyStep();
    fireEvent.click(screen.getAllByTestId("Button")[1]); // resend button
    await waitFor(() => expect(mockPost).toHaveBeenCalled());
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }))
    );
  });

  it("onResend error shows danger toast", async () => {
    await goToVerifyStep();
    mockPost.mockRejectedValueOnce({ data: { errors: { code: "ERR" } } });
    fireEvent.click(screen.getAllByTestId("Button")[1]);
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });
});
