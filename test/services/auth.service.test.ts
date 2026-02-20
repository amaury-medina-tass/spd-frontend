jest.mock("@/lib/http", () => ({
  post: jest.fn(),
}));

import { login, register, verifyEmail, resendVerification, forgotPassword } from "@/services/auth.service";
import { post } from "@/lib/http";

const mockPost = post as jest.Mock;

describe("auth.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPost.mockResolvedValue({ success: true });
  });

  it("login should call post with login endpoint", async () => {
    const data = { email: "test@test.com", password: "pass" };
    await login(data);
    expect(mockPost).toHaveBeenCalledWith("/public/auth/login", data);
  });

  it("register should call post with register endpoint", async () => {
    const data = { email: "test@test.com", password: "pass" };
    await register(data);
    expect(mockPost).toHaveBeenCalledWith("/public/auth/register", data);
  });

  it("verifyEmail should call post with verify-email endpoint", async () => {
    const data = { token: "abc" };
    await verifyEmail(data);
    expect(mockPost).toHaveBeenCalledWith("/public/auth/verify-email", data);
  });

  it("resendVerification should call post with resend-verification endpoint", async () => {
    const data = { email: "test@test.com" };
    await resendVerification(data);
    expect(mockPost).toHaveBeenCalledWith("/public/auth/resend-verification", data);
  });

  it("forgotPassword should call post with forgot-password endpoint", async () => {
    const data = { email: "test@test.com" };
    await forgotPassword(data);
    expect(mockPost).toHaveBeenCalledWith("/public/auth/forgot-password", data);
  });
});
