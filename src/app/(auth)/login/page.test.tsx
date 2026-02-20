import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
import { post } from "@/lib/http";
import { addToast } from "@heroui/toast";

jest.mock("@/components/layout/ThemeToggle", () => ({ ThemeToggle: () => null }));
jest.mock("@/components/auth/useAuth", () => ({
  useAuth: jest.fn(() => ({ refreshMe: jest.fn().mockResolvedValue(undefined) })),
}));

import LoginPage from "./page";

const mockPost = post as jest.Mock;
const mockAddToast = addToast as jest.Mock;
const mockRouterPush = jest.fn();

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockResolvedValue({});
    const { useRouter } = require("next/navigation");
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush, replace: jest.fn(), back: jest.fn() });
  });

  // ── Login step ──────────────────────────────────────────────────────────

  it("renders login form title", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByText("Bienvenido")).toBeInTheDocument();
  });

  it("renders email and password inputs", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByLabelText(/correo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
  });

  it("renders forgot password and register links", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByText(/olvidaste/i)).toBeInTheDocument();
    expect(screen.getByText("Regístrate")).toBeInTheDocument();
  });

  it("updates email and password inputs on change", () => {
    renderWithProviders(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: "user@test.com" } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "pass123" } });
    expect(screen.getByLabelText(/correo/i)).toHaveValue("user@test.com");
    expect(screen.getByLabelText(/contraseña/i)).toHaveValue("pass123");
  });

  it("toggleVisibility button click executes without error", () => {
    renderWithProviders(<LoginPage />);
    // eye toggle is the first Button in the login step (in password input endContent)
    const btns = screen.getAllByTestId("Button");
    fireEvent.click(btns[0]);
  });

  it("calls post on submit and navigates to /dashboard on success", async () => {
    renderWithProviders(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: "user@test.com" } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "pass123" } });
    fireEvent.click(screen.getByText("Ingresar"));
    await waitFor(() => expect(mockPost).toHaveBeenCalled());
    await waitFor(() => expect(mockRouterPush).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows error message when login rejects with an error code", async () => {
    mockPost.mockRejectedValueOnce({ data: { errors: { code: "INVALID_CREDENTIALS" } } });
    renderWithProviders(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: "user@test.com" } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "wrong" } });
    fireEvent.click(screen.getByText("Ingresar"));
    await waitFor(() =>
      expect(screen.getByText(/Error: INVALID_CREDENTIALS/)).toBeInTheDocument()
    );
  });

  it("transitions to verify step when error has no code (EMAIL_NOT_VERIFIED mock)", async () => {
    // ErrorCodes.EMAIL_NOT_VERIFIED is undefined (mocked), so undefined===undefined triggers the branch
    mockPost.mockRejectedValueOnce({});
    renderWithProviders(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: "user@test.com" } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "pass123" } });
    fireEvent.click(screen.getByText("Ingresar"));
    // Verify step shows the OTP input — use input-otp testid to avoid ambiguous text match
    await waitFor(() => expect(screen.getByTestId("input-otp")).toBeInTheDocument());
  });

  // ── Helper: transition to verify step ───────────────────────────────────

  async function goToVerifyStep() {
    renderWithProviders(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: "user@test.com" } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: "pass123" } });
    mockPost.mockRejectedValueOnce({});
    fireEvent.click(screen.getByText("Ingresar"));
    // Wait for verify step OTP input to appear (avoids ambiguous text match with h1 + button)
    await waitFor(() => expect(screen.getByTestId("input-otp")).toBeInTheDocument());
    jest.clearAllMocks();
    mockPost.mockResolvedValue({});
  }

  // ── Verify step ─────────────────────────────────────────────────────────

  it("verify step shows OTP input and action buttons", async () => {
    await goToVerifyStep();
    expect(screen.getByTestId("input-otp")).toBeInTheDocument();
    // getAllByTestId("Button"): [0]=verify, [1]=resend
    const btns = screen.getAllByTestId("Button");
    expect(btns.length).toBeGreaterThanOrEqual(2);
  });

  it("onVerify does nothing when code is empty", async () => {
    await goToVerifyStep();
    // click verify without filling code
    fireEvent.click(screen.getAllByTestId("Button")[0]);
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
    fireEvent.click(screen.getAllByTestId("Button")[1]);
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
