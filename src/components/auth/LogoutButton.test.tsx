jest.mock("@/lib/http", () => ({ post: jest.fn() }));

import { render, screen, act } from "@testing-library/react";
import { LogoutButton } from "./LogoutButton";
import { AuthContext } from "./AuthProvider";
import { post } from "@/lib/http";
import { useRouter } from "next/navigation";

const mockPost = post as jest.Mock;
const mockReplace = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: jest.fn(), replace: mockReplace, back: jest.fn(), refresh: jest.fn(), prefetch: jest.fn() });

const clear = jest.fn();

const renderBtn = () =>
  render(
    <AuthContext.Provider value={{ me: { id: "1" } as any, loading: false, refreshMe: jest.fn(), clear }}>
      <LogoutButton />
    </AuthContext.Provider>
  );

describe("LogoutButton", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders logout button", () => {
    renderBtn();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("calls post and clears on click", async () => {
    mockPost.mockResolvedValue({});
    renderBtn();
    await act(async () => { screen.getByText("Logout").click(); });
    expect(mockPost).toHaveBeenCalled();
    expect(clear).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });

  it("clears even on post failure", async () => {
    mockPost.mockRejectedValue(new Error("fail"));
    renderBtn();
    await act(async () => { screen.getByText("Logout").click(); });
    expect(clear).toHaveBeenCalled();
  });
});
