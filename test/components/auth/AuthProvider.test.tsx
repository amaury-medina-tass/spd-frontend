jest.mock("@/lib/session", () => ({ getMe: jest.fn() }));

import { render, screen, act } from "@testing-library/react";
import { AuthProvider, AuthContext } from "@/components/auth/AuthProvider";
import { getMe } from "@/lib/session";
import { useContext } from "react";

const mockGetMe = getMe as jest.Mock;

function TestConsumer() {
  const ctx = useContext(AuthContext);
  return (
    <div>
      <span data-testid="loading">{String(ctx?.loading)}</span>
      <span data-testid="me">{ctx?.me ? ctx.me.first_name : "null"}</span>
      <button onClick={() => ctx?.clear()}>clear</button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => jest.clearAllMocks());

  it("loads user on mount", async () => {
    mockGetMe.mockResolvedValue({ first_name: "Ana", last_name: "B", email: "a@b.com" });
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await act(async () => { await new Promise(r => setTimeout(r, 0)); });
    expect(screen.getByTestId("me").textContent).toBe("Ana");
    expect(screen.getByTestId("loading").textContent).toBe("false");
  });

  it("handles getMe failure", async () => {
    mockGetMe.mockRejectedValue(new Error("fail"));
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await act(async () => { await new Promise(r => setTimeout(r, 0)); });
    expect(screen.getByTestId("me").textContent).toBe("null");
  });

  it("clear sets me to null", async () => {
    mockGetMe.mockResolvedValue({ first_name: "X" });
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await act(async () => { await new Promise(r => setTimeout(r, 0)); });
    act(() => { screen.getByText("clear").click(); });
    expect(screen.getByTestId("me").textContent).toBe("null");
  });
});
