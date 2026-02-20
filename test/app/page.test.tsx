/**
 * @jest-environment node
 */
import { redirect } from "next/navigation";

jest.mock("next/headers", () => ({
  cookies: jest.fn().mockResolvedValue({
    getAll: () => [{ name: "token", value: "abc" }],
  }),
}));

// Mock global fetch
global.fetch = jest.fn();

import HomePage from "@/app/page";

describe("HomePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("redirects to /dashboard when authenticated", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true });
    try {
      await HomePage();
    } catch {
      // redirect throws
    }
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });

  it("redirects to /login when not authenticated", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false });
    try {
      await HomePage();
    } catch {
      // redirect throws
    }
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
