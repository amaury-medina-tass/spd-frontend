import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
import { post } from "@/lib/http";
import { addToast } from "@heroui/toast";

jest.mock("@/components/layout/ThemeToggle", () => ({ ThemeToggle: () => null }));

import ForgotPasswordPage from "@/app/(auth)/forgot-password/page";

const mockPost = post as jest.Mock;
const mockAddToast = addToast as jest.Mock;
const mockRouterPush = jest.fn();

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockResolvedValue({});
    const { useRouter } = require("next/navigation");
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush, replace: jest.fn(), back: jest.fn() });
  });

  // ── Email step ──────────────────────────────────────────────────────────

  it("renders forgot password form with email step title", () => {
    renderWithProviders(<ForgotPasswordPage />);
    expect(screen.getByText(/recuperar contraseña/i)).toBeInTheDocument();
  });

  it("renders email input and send button", () => {
    renderWithProviders(<ForgotPasswordPage />);
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByText(/enviar código/i)).toBeInTheDocument();
  });

  it("renders back to login link", () => {
    renderWithProviders(<ForgotPasswordPage />);
    expect(screen.getByText(/volver/i)).toBeInTheDocument();
  });

  it("does not call post when email is empty", async () => {
    renderWithProviders(<ForgotPasswordPage />);
    fireEvent.click(screen.getByText(/enviar código/i));
    await new Promise((r) => setTimeout(r, 50));
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("transitions to reset step and shows success toast on email submit", async () => {
    renderWithProviders(<ForgotPasswordPage />);
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: "user@test.com" } });
    fireEvent.click(screen.getByText(/enviar código/i));
    await waitFor(() => expect(screen.getByText(/restablecer contraseña/i)).toBeInTheDocument());
    expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "success" }));
  });

  it("shows danger toast on email submit failure", async () => {
    mockPost.mockRejectedValueOnce({ data: { errors: { code: "ERR" } } });
    renderWithProviders(<ForgotPasswordPage />);
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: "user@test.com" } });
    fireEvent.click(screen.getByText(/enviar código/i));
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" })));
    expect(screen.queryByText(/cambiar contraseña/i)).not.toBeInTheDocument();
  });

  it("shows danger toast on email submit failure with fallback message", async () => {
    mockPost.mockRejectedValueOnce({ data: { message: "Server error" } });
    renderWithProviders(<ForgotPasswordPage />);
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: "user@test.com" } });
    fireEvent.click(screen.getByText(/enviar código/i));
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" })));
  });

  // ── Helper: transition to reset step ────────────────────────────────────

  async function goToResetStep() {
    renderWithProviders(<ForgotPasswordPage />);
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: "user@test.com" } });
    fireEvent.click(screen.getByText(/enviar código/i));
    await waitFor(() => expect(screen.getByText(/restablecer contraseña/i)).toBeInTheDocument());
    jest.clearAllMocks();
    mockPost.mockResolvedValue({});
    (require("next/navigation").useRouter as jest.Mock).mockReturnValue({
      push: mockRouterPush,
      replace: jest.fn(),
      back: jest.fn(),
    });
  }

  // ── Reset step ───────────────────────────────────────────────────────────

  it("renders reset step inputs after email transition", async () => {
    await goToResetStep();
    expect(screen.getByLabelText(/nueva contraseña/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument();
    expect(screen.getByTestId("input-otp")).toBeInTheDocument();
    expect(screen.getByText(/cambiar contraseña/i)).toBeInTheDocument();
  });

  it("shows passwords-don't-match error when confirmPassword differs", async () => {
    await goToResetStep();
    fireEvent.change(screen.getByLabelText(/nueva contraseña/i), { target: { value: "Pass1!" } });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: "Pass2!" } });
    await waitFor(() =>
      expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument()
    );
  });

  it("onSubmitReset does nothing when code is missing", async () => {
    await goToResetStep();
    fireEvent.change(screen.getByLabelText(/nueva contraseña/i), { target: { value: "Pass1!" } });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: "Pass1!" } });
    fireEvent.click(screen.getByText(/cambiar contraseña/i));
    await new Promise((r) => setTimeout(r, 50));
    expect(mockPost).not.toHaveBeenCalled();
  });

  it("onSubmitReset success calls post and navigates to /login", async () => {
    await goToResetStep();
    fireEvent.change(screen.getByTestId("input-otp"), { target: { value: "123456" } });
    fireEvent.change(screen.getByLabelText(/nueva contraseña/i), { target: { value: "Pass123!" } });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: "Pass123!" } });
    fireEvent.click(screen.getByText(/cambiar contraseña/i));
    await waitFor(() => expect(mockPost).toHaveBeenCalled());
    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith("/login"));
  });

  it("onSubmitReset error shows danger toast", async () => {
    await goToResetStep();
    mockPost.mockRejectedValueOnce({ data: { errors: { code: "INVALID_CODE" } } });
    fireEvent.change(screen.getByTestId("input-otp"), { target: { value: "000000" } });
    fireEvent.change(screen.getByLabelText(/nueva contraseña/i), { target: { value: "Pass123!" } });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: "Pass123!" } });
    fireEvent.click(screen.getByText(/cambiar contraseña/i));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("onSubmitReset error uses fallback message", async () => {
    await goToResetStep();
    mockPost.mockRejectedValueOnce({ data: { message: "Token expired" } });
    fireEvent.change(screen.getByTestId("input-otp"), { target: { value: "000000" } });
    fireEvent.change(screen.getByLabelText(/nueva contraseña/i), { target: { value: "Pass123!" } });
    fireEvent.change(screen.getByLabelText(/confirmar contraseña/i), { target: { value: "Pass123!" } });
    fireEvent.click(screen.getByText(/cambiar contraseña/i));
    await waitFor(() =>
      expect(mockAddToast).toHaveBeenCalledWith(expect.objectContaining({ color: "danger" }))
    );
  });

  it("toggleVisibility button click does not throw", async () => {
    await goToResetStep();
    // Buttons in endContent of password inputs appear before the submit button
    const btns = screen.getAllByTestId("Button");
    // [0] = password-toggle, [1] = confirm-toggle, [2] = submit
    fireEvent.click(btns[0]);
  });

  it("toggleConfirmVisibility button click does not throw", async () => {
    await goToResetStep();
    const btns = screen.getAllByTestId("Button");
    fireEvent.click(btns[1]);
  });
});
